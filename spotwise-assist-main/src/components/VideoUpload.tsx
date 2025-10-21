import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Video, Play, Pause, Square, FileVideo, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoFile {
  id: string;
  name: string;
  url: string;
  file: File;
  duration?: number;
  size: number;
}

interface VideoUploadProps {
  onVideoSelect: (video: VideoFile) => void;
  selectedVideo?: VideoFile | null;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onVideoSelect, selectedVideo }) => {
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newVideos: VideoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a valid video file`);
        continue;
      }

      // Create video URL
      const url = URL.createObjectURL(file);
      
      // Get video duration
      const duration = await getVideoDuration(url);
      
      const videoFile: VideoFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        url,
        file,
        duration,
        size: file.size
      };

      newVideos.push(videoFile);
    }

    setUploadedVideos(prev => [...prev, ...newVideos]);
    setIsUploading(false);
    
    if (newVideos.length > 0) {
      toast.success(`${newVideos.length} video(s) uploaded successfully`);
      // Auto-select the first uploaded video
      onVideoSelect(newVideos[0]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onVideoSelect]);

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => resolve(0);
      video.src = url;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVideoSelect = (video: VideoFile) => {
    onVideoSelect(video);
    toast.success(`Selected: ${video.name}`);
  };

  const handleVideoDelete = (videoId: string) => {
    setUploadedVideos(prev => {
      const updated = prev.filter(v => v.id !== videoId);
      const deletedVideo = prev.find(v => v.id === videoId);
      
      if (deletedVideo) {
        URL.revokeObjectURL(deletedVideo.url);
        if (selectedVideo?.id === videoId) {
          onVideoSelect(updated[0] || null);
        }
      }
      
      return updated;
    });
    toast.success('Video removed');
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="p-4 glass-card">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-gradient-cosmic">Media File Management</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Processing...' : 'Import Video Files'}
            </Button>
            <span className="text-sm text-muted-foreground">
              Supported formats: MP4, AVI, MOV, WebM
            </span>
          </div>
          
          {/* Sample Videos */}
          <div className="p-3 glass-card">
            <Label className="text-sm text-muted-foreground mb-2 block">
              Demo Content Library:
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: '123.mp4', url: '/videos/123.mp4' },
                { name: 'WhatsApp Video 1 (8:04 PM)', url: '/videos/whatsapp-video-1.mp4' },
                { name: 'WhatsApp Video 2 (20:04)', url: '/videos/whatsapp-video-2.mp4' }
              ].map((sample, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const sampleVideo: VideoFile = {
                      id: `sample-${index}`,
                      name: sample.name,
                      url: sample.url,
                      file: new File([], sample.name),
                      size: 0
                    };
                    onVideoSelect(sampleVideo);
                  }}
                  className="text-xs text-primary hover:text-accent transition-colors text-left p-2 rounded hover:bg-primary/10"
                >
                  <FileVideo className="inline mr-1 h-3 w-3" />
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Uploaded Videos List */}
      {uploadedVideos.length > 0 && (
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-gradient-cosmic">Uploaded Videos</h3>
          </div>
          
          <div className="space-y-2">
            {uploadedVideos.map((video) => (
              <div
                key={video.id}
                className={`p-3 rounded-lg border transition-all duration-300 ${
                  selectedVideo?.id === video.id
                    ? 'border-primary bg-primary/10 glow-cosmic'
                    : 'border-muted hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{video.name}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(video.size)}</span>
                      {video.duration && <span>{formatDuration(video.duration)}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={selectedVideo?.id === video.id ? "default" : "outline"}
                      onClick={() => handleVideoSelect(video)}
                      className="text-xs"
                    >
                      <Play className="mr-1 h-3 w-3" />
                      {selectedVideo?.id === video.id ? 'Selected' : 'Select'}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVideoDelete(video.id)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoUpload;
