import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Eye, Play, Trash2, MapPin } from 'lucide-react';
import { Camera as CameraType } from '@/types/camera';

interface CameraCardProps {
  camera: CameraType;
  onPreview: (camera: CameraType) => void;
  onDetect: (camera: CameraType) => void;
  onDelete: (camera: CameraType) => void;
  isDetecting?: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onPreview,
  onDetect,
  onDelete,
  isDetecting = false
}) => {
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
    <Card className="p-4 glass-card hover:glow-cyan transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-cosmic rounded-lg">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gradient-aurora">{camera.name}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-48">
              {camera.url}
            </p>
            {camera.lot_zone && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary">{camera.lot_zone}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <Badge className={getStatusColor(camera.status)}>
            {camera.status}
          </Badge>
          {isDetecting && (
            <Badge className="bg-primary/20 text-primary border-primary animate-pulse">
              🤖 Detecting
            </Badge>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPreview(camera)}
          className="flex-1 glass-card hover:glow-cyan transition-all duration-300"
        >
          <Eye className="h-3 w-3 mr-1" />
          Preview
        </Button>
        
        <Button
          size="sm"
          onClick={() => onDetect(camera)}
          className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          disabled={camera.status !== 'active'}
        >
          <Play className="h-3 w-3 mr-1" />
          {isDetecting ? 'Detecting...' : 'Detect'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(camera)}
          className="hover:bg-destructive/20 hover:text-destructive transition-all duration-300"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};

export default CameraCard;
