import React, { useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Camera, Plus, Zap } from 'lucide-react';
import { CameraFormData } from '@/types/camera';
import { toast } from 'sonner';

interface AddCameraFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CameraFormData) => Promise<void>;
  loading?: boolean;
}

const AddCameraForm: React.FC<AddCameraFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<CameraFormData>({
    name: '',
    url: '',
    lot_zone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        name: '',
        url: '',
        lot_zone: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, onClose]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return; // Prevent closing while submitting
    
    setFormData({
      name: '',
      url: '',
      lot_zone: ''
    });
    onClose();
  }, [onClose, isSubmitting]);

  const handleInputChange = useCallback((field: keyof CameraFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoize sample URLs to prevent recreation on each render
  const sampleUrls = useMemo(() => [
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mp4'
  ], []);

  const handleSampleUrlClick = useCallback((url: string) => {
    handleInputChange('url', url);
  }, [handleInputChange]);

  const isFormValid = useMemo(() => 
    formData.name.trim() && formData.url.trim(), 
    [formData.name, formData.url]
  );

  const currentLoading = loading || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora flex items-center gap-2">
            <Camera className="h-5 w-5" />
Add New Camera
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="camera-name" className="text-foreground">
              Camera Name *
            </Label>
            <Input
              id="camera-name"
              type="text"
              placeholder="Zone A - Entrance"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              disabled={currentLoading}
              className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="camera-url" className="text-foreground">
              Video URL *
            </Label>
            <Input
              id="camera-url"
              type="url"
              placeholder="rtsp://camera.example.com/stream or http://video.mp4"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              required
              disabled={currentLoading}
              className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lot-zone" className="text-foreground">
              Parking Zone
            </Label>
            <Input
              id="lot-zone"
              type="text"
              placeholder="Zone A, Level 1, Entrance"
              value={formData.lot_zone}
              onChange={(e) => handleInputChange('lot_zone', e.target.value)}
              disabled={currentLoading}
              className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
              autoComplete="off"
            />
          </div>

          {/* Quick Test URLs */}
          <Card className="p-3 glass-card">
            <Label className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Quick Test URLs:
            </Label>
            <div className="space-y-1">
              {sampleUrls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSampleUrlClick(url)}
                  disabled={currentLoading}
                  className="text-xs text-primary hover:text-accent transition-colors block truncate w-full text-left p-1 rounded hover:bg-primary/10 disabled:opacity-50"
                >
                  {url}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
              disabled={!isFormValid || currentLoading}
            >
              <Plus className="mr-2 h-4 w-4" />
              {currentLoading ? 'Adding...' : 'Add Camera'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={currentLoading}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCameraForm;
