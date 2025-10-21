import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Pause, Square, Camera, MapPin, Link, Sparkles, AlertCircle, Zap, Car, Users } from 'lucide-react';
import { toast } from 'sonner';
import StarfieldBackground from '@/components/StarfieldBackground';
import useCameras from '@/hooks/useCameras';
import useAuth from '@/hooks/useAuth';
import { Camera as CameraType } from '@/types/camera';
import YOLODetector from '@/components/YOLODetector';

const CameraPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth('admin');
  const { getCameraById, startDetection } = useCameras();
  
  const [camera, setCamera] = useState<CameraType | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [isStartingDetection, setIsStartingDetection] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDetections: 0,
    vehicles: 0,
    persons: 0,
    fps: 0,
    confidence: 0
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (id && isAdmin) {
      loadCamera();
    }
  }, [id, isAdmin]);

  const loadCamera = async () => {
    if (!id) {
      console.error('No camera ID provided');
      navigate('/admin/cameras');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading camera with ID:', id);
      const cameraData = await getCameraById(parseInt(id));
      console.log('Camera data received:', cameraData);
      
      if (cameraData) {
        setCamera(cameraData);
        console.log('Camera loaded successfully:', cameraData.name);
      } else {
        console.error('Camera not found for ID:', id);
        toast.error('Camera not found');
        // Don't auto-navigate, let user decide
      }
    } catch (error) {
      console.error('Error loading camera:', error);
      toast.error('Failed to load camera: ' + (error as Error).message);
      // Don't auto-navigate, let user decide
    } finally {
      setLoading(false);
    }
  };

  const handleStartDetection = async () => {
    if (!camera) return;
    
    setIsStartingDetection(true);
    try {
      const success = await startDetection(camera.id);
      if (success) {
        navigate(`/admin/detection/${camera.id}`);
      }
    } finally {
      setIsStartingDetection(false);
    }
  };

  const handleVideoError = (e: any) => {
    console.error('Video error:', e);
    console.log('Video URL that failed:', camera?.url);
    setVideoError(true);
    toast.error(`Failed to load video: ${camera?.url}`);
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', camera?.url);
    setVideoError(false);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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

  const toggleDetection = () => {
    setIsDetecting(!isDetecting);
    if (!isDetecting) {
      toast.success('YOLO detection started');
    } else {
      toast.success('YOLO detection stopped');
    }
  };

  const handleDetections = (newDetections: any[]) => {
    setDetections(newDetections);
    
    // Update stats
    const vehicles = newDetections.filter(d => ['car', 'truck', 'bus', 'motorcycle'].includes(d.class)).length;
    const persons = newDetections.filter(d => d.class === 'person').length;
    const avgConfidence = newDetections.length > 0 
      ? newDetections.reduce((sum, d) => sum + d.confidence, 0) / newDetections.length * 100
      : 0;
    
    setStats({
      totalDetections: newDetections.length,
      vehicles,
      persons,
      fps: 15,
      confidence: avgConfidence
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

  // Show loading while authenticating
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading cosmic camera preview...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not an admin, the useAuth hook will handle redirects
  if (!user || !isAdmin) {
    return null;
  }

  if (!camera) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gradient-aurora mb-2">Camera Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested camera could not be found.</p>
          <Button
            onClick={() => navigate('/admin/cameras')}
            className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cameras
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent/20 text-accent border-accent';
      case 'inactive':
        return 'bg-muted/20 text-muted-foreground border-muted';
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden p-4">
      <StarfieldBackground />
      
      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/cameras')}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cameras
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient-aurora flex items-center gap-2">
                <Camera className="h-8 w-8" />
                {camera.name}
              </h1>
              <p className="text-muted-foreground">Camera Preview & Detection Control</p>
            </div>
          </div>
          
          <Button
            onClick={handleStartDetection}
            disabled={camera.status !== 'active' || isStartingDetection}
            className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          >
            <Play className="mr-2 h-4 w-4" />
            {isStartingDetection ? 'Starting...' : 'Start Detection'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detections</p>
                <p className="text-2xl font-bold text-gradient-aurora">{stats.totalDetections}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Car className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicles</p>
                <p className="text-2xl font-bold text-gradient-cosmic">{stats.vehicles}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Persons</p>
                <p className="text-2xl font-bold text-gradient-aurora">{stats.persons}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-gradient-aurora">{stats.confidence.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Live Preview with YOLO Detection
              </h3>
              
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      muted
                      className="w-full h-full object-cover"
                      onError={handleVideoError}
                      onLoadedData={handleVideoLoad}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      <source src={camera.url} type="video/mp4" />
                      <source src={camera.url} type="video/webm" />
                      <source src={camera.url} type="video/ogg" />
                      Your browser does not support the video tag.
                    </video>
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full"
                      style={{ pointerEvents: 'none' }}
                    />
                    {/* Detection Status Overlay */}
                    {isDetecting && (
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          YOLO DETECTING
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-center p-8">
                    <div>
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gradient-aurora mb-2">
                        Video Stream Unavailable
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        Unable to load the video stream. This could be due to:
                      </p>
                      <ul className="text-sm text-muted-foreground text-left space-y-1">
                        <li>• Network connectivity issues</li>
                        <li>• Invalid video URL format</li>
                        <li>• Camera is offline</li>
                        <li>• CORS restrictions</li>
                      </ul>
                      <Button
                        onClick={() => {
                          setVideoError(false);
                          if (videoRef.current) {
                            videoRef.current.load();
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-4 glass-card hover:glow-cyan transition-all duration-300"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Controls */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  onClick={handlePlayPause}
                  disabled={videoError}
                  size="sm"
                  className="glass-card hover:glow-cyan transition-all duration-300"
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
                  disabled={videoError}
                  variant="outline"
                  size="sm"
                  className="glass-card hover:glow-cyan transition-all duration-300"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Button
                  onClick={toggleDetection}
                  disabled={videoError}
                  variant={isDetecting ? "destructive" : "default"}
                  size="sm"
                  className={isDetecting ? "" : "bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isDetecting ? "Stop Detection" : "Start Detection"}
                </Button>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>Resolution: Auto-detected</span>
                <span>Status: {videoError ? 'Error' : isDetecting ? 'Detecting' : 'Ready'}</span>
              </div>
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
            {/* Current Detections */}
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4">
                Current Detections
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {detections.length > 0 ? (
                  detections.map((detection, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg glass-card"
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
                  <div className="text-center py-4 text-muted-foreground">
                    <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No detections yet</p>
                    <p className="text-xs">Start detection to see results</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Camera Info */}
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.8s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Camera Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  <p className="font-semibold text-gradient-aurora">{camera.name}</p>
                </div>
                
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(camera.status)}>
                      {camera.status}
                    </Badge>
                  </div>
                </div>
                
                {camera.lot_zone && (
                  <div>
                    <label className="text-sm text-muted-foreground">Zone</label>
                    <p className="flex items-center gap-1 text-primary">
                      <MapPin className="h-4 w-4" />
                      {camera.lot_zone}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Detection Settings */}
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '1.0s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4">
                YOLO Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="text-sm font-semibold">YOLOv8n</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="text-sm font-semibold">80 COCO</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Threshold</span>
                  <span className="text-sm font-semibold">0.6</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">FPS</span>
                  <span className="text-sm font-semibold">{stats.fps}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraPreview;
