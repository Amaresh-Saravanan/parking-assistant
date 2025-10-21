import cv2
import numpy as np
from ultralytics import YOLO
import asyncio
import websockets
import json
import base64
import threading
import time
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LiveCameraFeedSimulator:
    def __init__(self, model_path="yolov8n.pt"):
        """
        Initialize the live camera feed simulator with YOLOv8
        
        Args:
            model_path (str): Path to YOLOv8 model file
        """
        self.model = YOLO(model_path)
        self.video_path = None
        self.cap = None
        self.is_running = False
        self.frame_rate = 30  # FPS for simulation
        self.detection_results = []
        self.current_frame = None
        self.frame_count = 0
        
        # Car detection classes (COCO dataset)
        self.car_classes = [2, 3, 5, 7]  # car, motorcycle, bus, truck
        self.class_names = {
            2: 'car',
            3: 'motorcycle', 
            5: 'bus',
            7: 'truck'
        }
        
    def load_video(self, video_path):
        """Load video file for processing"""
        try:
            self.video_path = Path(video_path)
            if not self.video_path.exists():
                raise FileNotFoundError(f"Video file not found: {video_path}")
                
            self.cap = cv2.VideoCapture(str(video_path))
            if not self.cap.isOpened():
                raise ValueError(f"Cannot open video file: {video_path}")
                
            # Get video properties
            self.total_frames = int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT))
            self.original_fps = self.cap.get(cv2.CAP_PROP_FPS)
            self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            logger.info(f"Video loaded: {video_path}")
            logger.info(f"Properties: {self.width}x{self.height}, {self.total_frames} frames, {self.original_fps} FPS")
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading video: {e}")
            return False
    
    def extract_frame(self):
        """Extract current frame from video"""
        if not self.cap or not self.cap.isOpened():
            return None
            
        ret, frame = self.cap.read()
        if not ret:
            # Loop video when it ends
            self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = self.cap.read()
            
        if ret:
            self.current_frame = frame
            self.frame_count += 1
            return frame
        return None
    
    def detect_cars(self, frame):
        """
        Detect cars in the frame using YOLOv8
        
        Args:
            frame: OpenCV frame (numpy array)
            
        Returns:
            dict: Detection results with bounding boxes and confidence scores
        """
        if frame is None:
            return {"detections": [], "count": 0}
            
        try:
            # Run YOLOv8 inference
            results = self.model(frame, verbose=False)
            
            detections = []
            car_count = 0
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get class ID and confidence
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        # Filter for car-related classes with confidence > 0.5
                        if class_id in self.car_classes and confidence > 0.5:
                            # Get bounding box coordinates
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            
                            detection = {
                                "class_id": class_id,
                                "class_name": self.class_names.get(class_id, "vehicle"),
                                "confidence": confidence,
                                "bbox": {
                                    "y1": int(y1), 
                                    "x2": int(x2),
                                    "y2": int(y2)
                                }
                            }
                try:
            data = json.loads(message)
            command = data.get('command')
            video_path = data.get('video_path')
            
            if command == 'start':
                if video_path and video_path != self.video_path:
                    # Switch to new video
                    self.stop_feed()
                    self.video_path = video_path
                    logger.info(f"Switching to video: {video_path}")
                
                if not self.is_running:
                    self.start_feed()
            elif command == 'pause':
                self.pause_feed()
            elif command == 'stop':
                self.stop_feed()
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON message: {message}")
            return {"detections": [], "count": 0}
    
    def draw_detections(self, frame, detection_results):
        """
        Draw bounding boxes and labels on frame
        Args:
            frame: OpenCV frame
            detection_results: Detection results from detect_cars()
            
        Returns:
            frame: Frame with drawn detections
        """
        if not detection_results or not detection_results.get("detections"):
            return frame
            
        annotated_frame = frame.copy()
        
        for detection in detection_results["detections"]:
            bbox = detection["bbox"]
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            
            # Draw bounding box
            cv2.rectangle(
                annotated_frame,
                (bbox["x1"], bbox["y1"]),
                (bbox["x2"], bbox["y2"]),
                (0, 255, 0),  # Green color
                2
            )
            
            # Draw label
            label = f"{class_name}: {confidence:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)[0]
            
            cv2.rectangle(
                annotated_frame,
                (bbox["x1"], bbox["y1"] - label_size[1] - 10),
                (bbox["x1"] + label_size[0], bbox["y1"]),
                (0, 255, 0),
                -1
            )
            
            cv2.putText(
                annotated_frame,
                label,
                (bbox["x1"], bbox["y1"] - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 0),
                2
            )
        
        # Draw detection count
        count_text = f"Cars Detected: {detection_results['count']}"
        cv2.putText(
            annotated_frame,
            count_text,
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        return annotated_frame
    
    def frame_to_base64(self, frame):
        """Convert OpenCV frame to base64 string for web transmission"""
        try:
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            frame_base64 = base64.b64encode(buffer).decode('utf-8')
            return frame_base64
        except Exception as e:
            logger.error(f"Error encoding frame: {e}")
            return None
    
    async def simulate_live_feed(self, websocket, path):
        """
        WebSocket handler for streaming live feed simulation
        """
        logger.info(f"Client connected: {websocket.remote_address}")
        
        try:
            while self.is_running:
                # Extract frame
                frame = self.extract_frame()
                if frame is None:
                    break
                
                # Detect cars
                detection_results = self.detect_cars(frame)
                
                # Draw detections on frame
                annotated_frame = self.draw_detections(frame, detection_results)
                
                # Convert to base64
                frame_base64 = self.frame_to_base64(annotated_frame)
                if frame_base64:
                    # Send frame and detection data
                    message = {
                        "type": "frame",
                        "frame": frame_base64,
                        "detections": detection_results,
                        "fps": self.frame_rate,
                        "resolution": {"width": self.width, "height": self.height}
                    }
                    
                    await websocket.send(json.dumps(message))
                
                # Control frame rate
                await asyncio.sleep(1.0 / self.frame_rate)
                
        except websockets.exceptions.ConnectionClosed:
            logger.info("Client disconnected")
        except Exception as e:
            logger.error(f"Error in live feed: {e}")
    
    def start_server(self, host="localhost", port=8765):
        """Start WebSocket server for live feed"""
        logger.info(f"Starting live feed server on ws://{host}:{port}")
        
        start_server = websockets.serve(self.simulate_live_feed, host, port)
        asyncio.get_event_loop().run_until_complete(start_server)
        asyncio.get_event_loop().run_forever()
    
    def start_simulation(self, video_path):
        """Start the live feed simulation"""
        if not self.load_video(video_path):
            return False
            
        self.is_running = True
        logger.info("Live feed simulation started")
        return True
    
    def stop_simulation(self):
        """Stop the live feed simulation"""
        self.is_running = False
        if self.cap:
            self.cap.release()
        logger.info("Live feed simulation stopped")

# CLI interface for testing
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Live Camera Feed Simulator with YOLOv8")
    parser.add_argument('--video', type=str, help='Path to input video file (optional, can be set via WebSocket)')
    parser.add_argument('--model', type=str, default='yolov8n.pt', help='YOLOv8 model file')
    parser.add_argument('--host', type=str, default='localhost', help='WebSocket server host')
    parser.add_argument('--port', type=int, default=8765, help='WebSocket server port')
    parser.add_argument('--fps', type=int, default=30, help='Simulation frame rate')
    
    args = parser.parse_args()
    
    # Initialize simulator
    simulator = LiveCameraFeedSimulator(args.model)
    simulator.frame_rate = args.fps
    
    # Start simulation
    if simulator.start_simulation(args.video):
        try:
            simulator.start_server(args.host, args.port)
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            simulator.stop_simulation()
    else:
        logger.error("Failed to start simulation")
