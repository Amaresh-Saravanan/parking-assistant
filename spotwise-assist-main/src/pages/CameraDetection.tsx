import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Square, Camera, Activity, Zap, Car, Users, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import StarfieldBackground from '@/components/StarfieldBackground';
import useCameras from '@/hooks/useCameras';
import useAuth from '@/hooks/useAuth';
import { Camera as CameraType, DetectionResult } from '@/types/camera';
import YOLODetector from '@/components/YOLODetector';

interface MockDetection {
  id: number;
  type: 'car' | 'person' | 'truck';
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
}

const CameraDetection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth('admin');
  const { getCameraById, stopDetection, updateDetectionStatus } = useCameras();
  
  const [camera, setCamera] = useState<CameraType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
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
    if (!id) return;
    
    setLoading(true);
    try {
      const cameraData = await getCameraById(parseInt(id));
      if (cameraData) {
        setCamera(cameraData);
        startDetection();
      } else {
        toast.error('Camera not found');
        navigate('/admin/cameras');
      }
    } catch (error) {
      console.error('Error loading camera:', error);
      toast.error('Failed to load camera');
      navigate('/admin/cameras');
    } finally {
      setLoading(false);
    }
  };

  const startDetection = () => {
    setIsDetecting(true);
    toast.success('YOLO detection started');
    
    // Update detection status
    if (camera) {
      updateDetectionStatus(camera.id, {
        camera_id: camera.id,
        is_detecting: true,
        last_detection: new Date().toISOString(),
        total_slots: 20,
        occupied_slots: 0,
        vacant_slots: 20,
        fps: 15
      });
    }
    
    // Auto-play video when detection starts
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleStopDetection = async () => {
    setIsDetecting(false);
    setDetections([]);
    
    if (camera) {
      await stopDetection(camera.id);
    }
    
    toast.success('Detection stopped');
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
          <p className="text-muted-foreground">Initializing YOLO detection...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not an admin, the useAuth hook will handle redirects
  if (!user || !isAdmin) {
    return null;
  }

  if (!camera) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden p-4">
      <StarfieldBackground />
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/cameras/${camera.id}/preview`)}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Preview
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient-aurora flex items-center gap-2">
                <Activity className="h-8 w-8" />
                YOLO Detection - {camera.name}
              </h1>
              <p className="text-muted-foreground">
                Real-time AI object detection {isDetecting && '• Live'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge className={isDetecting ? 'bg-accent/20 text-accent border-accent animate-pulse' : 'bg-muted/20 text-muted-foreground border-muted'}>
              {isDetecting ? '🤖 Detecting' : '⏸️ Stopped'}
            </Badge>
            <Button
              onClick={handleStopDetection}
              disabled={!isDetecting}
              variant="outline"
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Detection
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
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
              <div className="p-2 bg-gradient-cosmic rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">FPS</p>
                <p className="text-2xl font-bold text-gradient-cosmic">{stats.fps}</p>
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

        {/* Detection View */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video with Overlay */}
          <div className="lg:col-span-3">
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.4s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Live Detection Feed
              </h3>
              
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  controls
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                  onLoadedData={() => {
                    const canvas = canvasRef.current;
                    const video = videoRef.current;
                    if (canvas && video) {
                      canvas.width = video.videoWidth || 640;
                      canvas.height = video.videoHeight || 480;
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  <source src={camera.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Detection Overlay Canvas */}
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  style={{ mixBlendMode: 'normal' }}
                />
                
                {/* YOLO Detector Component */}
                <YOLODetector
                  videoElement={videoRef.current}
                  canvasElement={canvasRef.current}
                  onDetections={handleDetections}
                  isActive={isDetecting && isPlaying}
                />
                
                {/* Detection Status Overlay */}
                {isDetecting && (
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE DETECTION
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Detection Details */}
          <div className="space-y-4">
            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.6s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4">
                Current Detections
              </h3>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {detections.length > 0 ? (
                  detections.map((detection, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg glass-card"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getColorForClass(detection.class) }}
                        />
                        <span className="text-sm font-medium capitalize">
                          {detection.class}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {(detection.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No detections</p>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.8s'}}>
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-4">
                Detection Settings
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Model</span>
                  <span className="text-sm font-semibold">YOLOv8n</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Classes</span>
                  <span className="text-sm font-semibold">Vehicle, Person</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Threshold</span>
                  <span className="text-sm font-semibold">0.7</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">NMS</span>
                  <span className="text-sm font-semibold">0.45</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraDetection;
