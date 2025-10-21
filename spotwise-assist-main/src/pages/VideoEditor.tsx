import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Play, Pause, Square, Upload, Camera, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import YOLODetector from "@/components/YOLODetector";

interface Detection {
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

const VideoEditor = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);

  // Get URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoUrlParam = urlParams.get('videoUrl');
    const cameraNameParam = urlParams.get('cameraName');
    
    if (videoUrlParam) {
      setVideoUrl(decodeURIComponent(videoUrlParam));
      // Auto-load the video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.src = decodeURIComponent(videoUrlParam);
          videoRef.current.load();
        }
      }, 100);
    }
    
    if (cameraNameParam) {
      setCameraName(decodeURIComponent(cameraNameParam));
    }
  }, []);

  // Handle detections from YOLO component
  const handleDetections = (newDetections: Detection[]) => {
    setDetections(newDetections);
  };

  const handleVideoLoad = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      toast.success("Video loaded successfully!");
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
      setDetections([]);
    }
  };

  const getColorForClass = (className: string): string => {
    const colors: { [key: string]: string } = {
      car: "#3b82f6",
      truck: "#ef4444",
      person: "#10b981",
      motorcycle: "#f59e0b",
      bus: "#8b5cf6"
    };
    return colors[className] || "#6b7280";
  };

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) {
      toast.error("Please enter a valid video URL");
      return;
    }
    
    if (videoRef.current) {
      videoRef.current.src = videoUrl;
      videoRef.current.load();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {cameraName ? `${cameraName} - Video Analysis` : "YOLO Video Editor"}
              </h1>
              <p className="text-muted-foreground">
                {cameraName ? `Analyzing video feed from ${cameraName}` : "Real-time object detection with YOLOv8"}
              </p>
            </div>
          </div>
          <Badge variant="default" className="px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            YOLO Ready
          </Badge>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Video Player
                </CardTitle>
                <CardDescription>
                  {cameraName ? `Video from ${cameraName} camera` : "Load a video URL and run YOLO detection"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* URL Input */}
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <Input
                    type="url"
                    placeholder="Enter direct video URL (MP4, WebM, etc. - YouTube not supported)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: YouTube videos are not supported due to CORS restrictions. Use direct video file URLs.
                  </p>
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Upload className="h-4 w-4 mr-2" />
                      Load Video
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")}
                    >
                      Sample Video
                    </Button>
                  </div>
                </form>

                {/* Video Container */}
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    className="w-full h-auto max-h-96"
                    onLoadedData={handleVideoLoad}
                    crossOrigin="anonymous"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    onClick={handlePlayPause}
                    disabled={!videoUrl}
                    size="sm"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button
                    onClick={handleStop}
                    disabled={!videoUrl}
                    variant="outline"
                    size="sm"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                  <Button
                    onClick={toggleDetection}
                    disabled={!videoUrl}
                    variant={isDetecting ? "destructive" : "default"}
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isDetecting ? "Stop Detection" : "Start Detection"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* YOLO Detector Component */}
            <YOLODetector
              videoElement={videoRef.current}
              canvasElement={canvasRef.current}
              onDetections={handleDetections}
              isActive={isDetecting && isPlaying}
            />
          </div>

          {/* Detection Results */}
          <div className="space-y-4">
            {/* Detection Status */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Detection Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Detection:</span>
                  <Badge variant={isDetecting ? "default" : "secondary"}>
                    {isDetecting ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Objects Found:</span>
                  <Badge variant="outline">{detections.length}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Current Detections */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Current Detections</CardTitle>
                <CardDescription>
                  Objects detected in current frame
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detections.length > 0 ? (
                    detections.map((detection, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted/20 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getColorForClass(detection.class) }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {detection.class}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {(detection.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No detections yet. Load a video and press play.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Model Info */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Model Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span>YOLOv8n</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework:</span>
                  <span>TensorFlow.js</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Classes:</span>
                  <span>80 COCO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input Size:</span>
                  <span>640x640</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;
