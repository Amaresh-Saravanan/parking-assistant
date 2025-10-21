import React, { useState, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Video, Zap, Download, Server, AlertTriangle } from 'lucide-react';
import StarfieldBackground from '@/components/StarfieldBackground';
import VideoUpload from '@/components/VideoUpload';
import LiveFeedSimulator from '@/components/LiveFeedSimulator';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingScreen from '@/components/LoadingScreen';
import { toast } from 'sonner';

interface VideoFile {
  id: string;
  name: string;
  url: string;
  file: File;
  duration?: number;
  size: number;
}

interface DetectionResults {
  detections: any[];
  count: number;
  frame_number: number;
  timestamp: number;
}

const LiveCameraFeed: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [detectionStats, setDetectionStats] = useState<DetectionResults | null>(null);
  const [serverStatus, setServerStatus] = useState<'unknown' | 'running' | 'stopped'>('unknown');

  const handleVideoSelect = useCallback((video: VideoFile | null) => {
    setSelectedVideo(video);
    if (video) {
      toast.success(`Selected video: ${video.name}`);
    }
  }, []);

  const handleDetectionUpdate = useCallback((results: DetectionResults) => {
    setDetectionStats(results);
  }, []);

  const checkServerStatus = useCallback(async () => {
    try {
      // Try to connect to WebSocket to check if server is running
      const ws = new WebSocket('ws://localhost:8765');
      
      ws.onopen = () => {
        setServerStatus('running');
        ws.close();
      };
      
      ws.onerror = () => {
        setServerStatus('stopped');
      };
      
      // Timeout after 3 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          ws.close();
          setServerStatus('stopped');
        }
      }, 3000);
      
    } catch (error) {
      setServerStatus('stopped');
    }
  }, []);

  React.useEffect(() => {
    checkServerStatus();
  }, [checkServerStatus]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gradient-cosmic flex items-center gap-3">
                <Camera className="h-8 w-8" />
                AI-Powered Camera Analytics
              </h1>
              <p className="text-muted-foreground mt-1">
                Advanced real-time vehicle detection and monitoring system with intelligent analytics
              </p>
            </div>
          </div>

          {/* Server Status */}
          <Card className="p-3 glass-card">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span className="text-sm font-medium">AI Server:</span>
              <span className={`text-sm font-semibold ${
                serverStatus === 'running' ? 'text-green-400' : 
                serverStatus === 'stopped' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {serverStatus === 'running' ? 'Running' : 
                 serverStatus === 'stopped' ? 'Stopped' : 'Checking...'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={checkServerStatus}
                className="ml-2"
              >
                Refresh
              </Button>
            </div>
          </Card>
        </div>

        {/* Server Setup Instructions */}
        {serverStatus === 'stopped' && (
          <Card className="p-4 glass-card mb-6 border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-400 mb-2">Analytics Engine Configuration Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  To enable real-time vehicle detection, please initialize the AI analytics backend service.
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-black/20 rounded-lg font-mono">
                    <div className="text-green-400"># Initialize system dependencies</div>
                    <div>cd backend</div>
                    <div>pip install -r requirements.txt</div>
                    <div className="mt-2 text-green-400"># Launch analytics engine</div>
                    <div>python ai_module.py --video path/to/your/video.mp4</div>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Analytics service will be available at ws://localhost:8765
                </p>
              </div>
            </div>
          </Card>
        )}

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="glass-card">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Media Configuration
            </TabsTrigger>
            <TabsTrigger value="live-feed" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="downloads" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Video Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <VideoUpload
              onVideoSelect={handleVideoSelect}
              selectedVideo={selectedVideo}
            />
            
            {selectedVideo && (
              <Card className="p-4 glass-card">
                <h3 className="font-semibold text-gradient-aurora mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Selected Video Preview
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <video
                      src={selectedVideo.url}
                      controls
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '300px' }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Name:</label>
                      <p className="font-semibold">{selectedVideo.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">File Size:</label>
                      <p className="font-semibold">
                        {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    
                    {selectedVideo.duration && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Duration:</label>
                        <p className="font-semibold">
                          {Math.floor(selectedVideo.duration / 60)}:
                          {Math.floor(selectedVideo.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">
                        This video will be used to simulate a live camera feed with AI-powered car detection.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Live Feed Tab */}
          <TabsContent value="live-feed" className="space-y-6">
            <Suspense fallback={<LoadingScreen message="Initializing analytics engine..." />}>
              <LiveFeedSimulator
                videoPath={selectedVideo?.url}
                onDetectionUpdate={handleDetectionUpdate}
              />
            </Suspense>
            
            {/* Detection Statistics */}
            {detectionStats && (
              <Card className="p-4 glass-card">
                <h3 className="font-semibold text-gradient-aurora mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Real-time Statistics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 glass-card">
                    <div className="text-2xl font-bold text-primary">{detectionStats.count}</div>
                    <div className="text-sm text-muted-foreground">Cars Detected</div>
                  </div>
                  
                  <div className="text-center p-3 glass-card">
                    <div className="text-2xl font-bold text-accent">{detectionStats.frame_number}</div>
                    <div className="text-sm text-muted-foreground">Frames Processed</div>
                  </div>
                  
                  <div className="text-center p-3 glass-card">
                    <div className="text-2xl font-bold text-green-400">
                      {detectionStats.detections.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Detections</div>
                  </div>
                  
                  <div className="text-center p-3 glass-card">
                    <div className="text-2xl font-bold text-blue-400">
                      {new Date(detectionStats.timestamp * 1000).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Update</div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Downloads Tab */}
          <TabsContent value="downloads" className="space-y-6">
            <Card className="p-6 glass-card">
              <h3 className="font-semibold text-gradient-aurora mb-4 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Sample Videos & Resources
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sample Videos */}
                <div>
                  <h4 className="font-medium mb-3">Sample Videos</h4>
                  <div className="space-y-3">
                    {[
                      { name: '123.mp4', size: '15.2 MB', description: 'Parking lot surveillance footage' },
                      { name: 'WhatsApp Video 2025-10-13 at 8.04.43 PM', size: '8.7 MB', description: 'Mobile camera recording' },
                      { name: 'WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054', size: '12.1 MB', description: 'Traffic monitoring video' }
                    ].map((video, index) => (
                      <div key={index} className="p-3 glass-card hover:glow-cyan transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium truncate">{video.name}</h5>
                            <p className="text-sm text-muted-foreground">{video.description}</p>
                            <p className="text-xs text-muted-foreground">{video.size}</p>
                          </div>
                          <Button size="sm" variant="outline" className="ml-2">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Models */}
                <div>
                  <h4 className="font-medium mb-3">AI Models</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'YOLOv8n.pt', size: '6.2 MB', description: 'Nano model (fastest)' },
                      { name: 'YOLOv8s.pt', size: '21.5 MB', description: 'Small model (balanced)' },
                      { name: 'YOLOv8m.pt', size: '49.7 MB', description: 'Medium model (accurate)' }
                    ].map((model, index) => (
                      <div key={index} className="p-3 glass-card hover:glow-aurora transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium">{model.name}</h5>
                            <p className="text-sm text-muted-foreground">{model.description}</p>
                            <p className="text-xs text-muted-foreground">{model.size}</p>
                          </div>
                          <Button size="sm" variant="outline" className="ml-2">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Setup Instructions */}
              <div className="mt-6 p-4 glass-card">
                <h4 className="font-medium mb-3">Quick Setup Guide</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Download sample videos or use your own MP4 files</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Install Python dependencies: <code className="bg-black/20 px-1 rounded">pip install -r requirements.txt</code></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Start AI server: <code className="bg-black/20 px-1 rounded">python ai_module.py --video your_video.mp4</code></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Upload video in the Video Setup tab and start live detection</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default LiveCameraFeed;
