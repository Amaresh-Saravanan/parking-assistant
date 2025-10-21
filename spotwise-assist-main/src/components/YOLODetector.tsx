import { useEffect, useRef, useState } from 'react';

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface YOLODetectorProps {
  videoElement: HTMLVideoElement | null;
  canvasElement: HTMLCanvasElement | null;
  onDetections: (detections: Detection[]) => void;
  isActive: boolean;
}

// COCO class names for YOLO
const COCO_CLASSES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
  'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
  'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
  'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
  'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
  'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
  'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
  'toothbrush'
];

const YOLODetector: React.FC<YOLODetectorProps> = ({
  videoElement,
  canvasElement,
  onDetections,
  isActive
}) => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    loadModel();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive && modelLoaded && videoElement && canvasElement) {
      startDetection();
    } else {
      stopDetection();
    }
  }, [isActive, modelLoaded, videoElement, canvasElement]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      
      // Simulate model loading time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setModelLoaded(true);
      console.log('YOLO model simulation loaded successfully');
    } catch (error) {
      console.error('Failed to load model:', error);
      setModelLoaded(true); // Still set to true for demo
    } finally {
      setIsLoading(false);
    }
  };

  const startDetection = () => {
    if (!videoElement || !canvasElement || !modelLoaded) return;

    const detect = async () => {
      try {
        const detections = generateMockDetections();
        onDetections(detections);
        drawDetections(detections);
        
        if (isActive) {
          animationFrameRef.current = requestAnimationFrame(detect);
        }
      } catch (error) {
        console.error('Detection error:', error);
      }
    };

    detect();
  };

  const stopDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const generateMockDetections = (): Detection[] => {
    // Mock detections for demo - simulates YOLO output
    const vehicleClasses = ['car', 'truck', 'bus', 'motorcycle', 'person'];
    const detections: Detection[] = [];
    
    const numDetections = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numDetections; i++) {
      const className = vehicleClasses[Math.floor(Math.random() * vehicleClasses.length)];
      detections.push({
        class: className,
        confidence: 0.6 + Math.random() * 0.4,
        bbox: [
          Math.random() * (canvasElement?.width || 640) * 0.7,
          Math.random() * (canvasElement?.height || 480) * 0.7,
          50 + Math.random() * 100,
          50 + Math.random() * 100
        ]
      });
    }
    
    return detections;
  };

  const drawDetections = (detections: Detection[]) => {
    if (!canvasElement || !videoElement) return;

    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw video frame
    ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    // Draw detections
    detections.forEach((detection) => {
      const [x, y, width, height] = detection.bbox;
      
      // Draw bounding box
      ctx.strokeStyle = getColorForClass(detection.class);
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      const label = `${detection.class} ${(detection.confidence * 100).toFixed(1)}%`;
      ctx.font = '14px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      
      ctx.fillStyle = getColorForClass(detection.class);
      ctx.fillRect(x, y - textHeight, textMetrics.width + 10, textHeight);
      
      // Draw label text
      ctx.fillStyle = 'white';
      ctx.fillText(label, x + 5, y - 5);
    });
  };

  const getColorForClass = (className: string): string => {
    const colors: { [key: string]: string } = {
      car: '#3b82f6',
      truck: '#ef4444',
      bus: '#8b5cf6',
      motorcycle: '#f59e0b',
      person: '#10b981',
      bicycle: '#06b6d4',
      airplane: '#ec4899',
      train: '#84cc16'
    };
    return colors[className] || '#6b7280';
  };

  return null; // This component doesn't render anything visible
};

export default YOLODetector;
