import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Camera, Wifi, WifiOff, Car, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface DetectionResults {
  detections: Detection[];
  count: number;
  frame_number: number;
  timestamp: number;
}

interface LiveFeedData {
  type: string;
  frame: string;
  detections: DetectionResults;
  fps: number;
  resolution: {
    width: number;
    height: number;
  };
}

interface LiveFeedSimulatorProps {
  videoPath?: string;
  serverUrl?: string;
  onDetectionUpdate?: (results: DetectionResults) => void;
}

const LiveFeedSimulator: React.FC<LiveFeedSimulatorProps> = ({
  videoPath,
  serverUrl = 'ws://localhost:8765',
  onDetectionUpdate
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState<string | null>(null);
  const [detectionResults, setDetectionResults] = useState<DetectionResults | null>(null);
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const connectToServer = useCallback(() => {
    try {
      setConnectionError(null);
      const ws = new WebSocket(serverUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Connected to AI detection server');
        console.log('Connected to WebSocket server');
      };

      ws.onmessage = (event) => {
        try {
          const data: LiveFeedData = JSON.parse(event.data);
          
          if (data.type === 'frame') {
            setCurrentFrame(`data:image/jpeg;base64,${data.frame}`);
            setDetectionResults(data.detections);
            setFps(data.fps);
            setResolution(data.resolution);
            
            // Callback for parent component
            if (onDetectionUpdate) {
              onDetectionUpdate(data.detections);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsPlaying(false);
        toast.error('Disconnected from AI detection server');
        console.log('WebSocket connection closed');
      };

      ws.onerror = (error) => {
        setConnectionError('Failed to connect to AI server');
        setIsConnected(false);
        toast.error('Connection error: Check if AI server is running');
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionError('Invalid server URL');
      console.error('Connection error:', error);
    }
  }, [serverUrl, onDetectionUpdate]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsPlaying(false);
    setCurrentFrame(null);
    setDetectionResults(null);
  }, []);

  const startFeed = useCallback(() => {
    if (isConnected && wsRef.current) {
      setIsPlaying(true);
      // Send start command to server if needed
      wsRef.current.send(JSON.stringify({ command: 'start', video_path: videoPath }));
    }
  }, [isConnected, videoPath]);

  const pauseFeed = useCallback(() => {
    setIsPlaying(false);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ command: 'pause' }));
    }
  }, []);

  const stopFeed = useCallback(() => {
    setIsPlaying(false);
    setCurrentFrame(null);
    setDetectionResults(null);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ command: 'stop' }));
    }
  }, []);

  // Draw detection overlays on canvas
  const drawDetections = useCallback(() => {
    if (!canvasRef.current || !imgRef.current || !detectionResults) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw detections
    detectionResults.detections.forEach((detection) => {
      const { bbox, class_name, confidence } = detection;
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
      
      // Draw label background
      const label = `${class_name}: ${(confidence * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillRect(bbox.x1, bbox.y1 - textHeight, textMetrics.width + 10, textHeight);
      
      // Draw label text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, bbox.x1 + 5, bbox.y1 - 5);
    });
  }, [detectionResults]);

  // Update canvas when frame or detections change
  useEffect(() => {
    if (currentFrame && imgRef.current) {
      imgRef.current.onload = drawDetections;
    }
  }, [currentFrame, detectionResults, drawDetections]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="p-4 glass-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gradient-cosmic">Real-Time Analytics Engine</h3>
            <Badge variant={isConnected ? "default" : "secondary"} className="ml-2">
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Standby
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {!isConnected ? (
              <Button
                onClick={connectToServer}
                className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
              >
                Initialize Analytics Engine
              </Button>
            ) : (
              <>
                <Button
                  onClick={isPlaying ? pauseFeed : startFeed}
                  disabled={!isConnected}
                  className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause Analysis
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Begin Analysis
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={stopFeed}
                  disabled={!isConnected}
                  variant="outline"
                  className="glass-card hover:glow-cyan transition-all duration-300"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Analysis
                </Button>
                
                <Button
                  onClick={disconnect}
                  variant="outline"
                  className="glass-card hover:glow-red transition-all duration-300"
                >
                  Disconnect Engine
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Analytics Engine Error: {connectionError}</span>
          </div>
        )}

        {/* Stats */}
        {isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-muted-foreground">FPS</div>
              <div className="font-semibold text-primary">{fps}</div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Resolution</div>
              <div className="font-semibold text-primary">
                {resolution.width}x{resolution.height}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Vehicles Detected</div>
              <div className="font-semibold text-accent flex items-center justify-center gap-1">
                <Car className="h-4 w-4" />
                {detectionResults?.count || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Frame</div>
              <div className="font-semibold text-primary">
                #{detectionResults?.frame_number || 0}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Video Feed */}
      <Card className="p-4 glass-card">
        <div className="relative bg-black rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
          {currentFrame ? (
            <div className="relative w-full h-full">
              <img
                ref={imgRef}
                src={currentFrame}
                alt="Live Feed"
                className="w-full h-full object-contain"
                style={{ maxHeight: '600px' }}
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
                style={{ maxHeight: '600px' }}
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Analytics Engine Standby</p>
              <p className="text-sm">
                {!isConnected 
                  ? "Initialize analytics engine to begin real-time vehicle detection"
                  : "Click 'Begin Analysis' to start processing video feed"
                }
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Detection Results */}
      {detectionResults && detectionResults.detections.length > 0 && (
        <Card className="p-4 glass-card">
          <h4 className="font-semibold text-gradient-aurora mb-3 flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicle Detection Analytics ({detectionResults.count} vehicles identified)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {detectionResults.detections.map((detection, index) => (
              <div key={index} className="p-3 glass-card">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{detection.class_name}</span>
                  <Badge variant="secondary">
                    {(detection.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Position: ({detection.bbox.x1}, {detection.bbox.y1}) - 
                  ({detection.bbox.x2}, {detection.bbox.y2})
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LiveFeedSimulator;
