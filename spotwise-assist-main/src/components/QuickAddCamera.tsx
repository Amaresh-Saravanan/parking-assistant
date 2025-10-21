import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Camera, Plus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { CameraFormData } from '@/types/camera';

interface QuickAddCameraProps {
  onSubmit: (data: CameraFormData) => Promise<void>;
  loading?: boolean;
}

const QuickAddCamera: React.FC<QuickAddCameraProps> = ({ onSubmit, loading = false }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickAdd = useCallback(async () => {
    if (!name.trim() || !url.trim()) {
      toast.error('Please enter camera name and URL');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        url: url.trim(),
        lot_zone: 'Zone A' // Default zone
      });
      
      // Reset form on success
      setName('');
      setUrl('');
      toast.success('Camera added successfully!');
    } catch (error) {
      console.error('Error adding camera:', error);
      toast.error('Failed to add camera');
    } finally {
      setIsSubmitting(false);
    }
  }, [name, url, onSubmit]);

  const handleSampleUrl = useCallback(() => {
    setUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
    if (!name.trim()) {
      setName('Sample Camera');
    }
  }, [name]);

  const currentLoading = loading || isSubmitting;

  return (
    <Card className="p-4 glass-card animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-gradient-cosmic">Quick Add Camera</h3>
      </div>
      
      <div className="space-y-3">
        <Input
          placeholder="Camera name (e.g., Zone A - Entrance)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={currentLoading}
          className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
        />
        
        <div className="flex gap-2">
          <Input
            placeholder="Video URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={currentLoading}
            className="flex-1 glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSampleUrl}
            disabled={currentLoading}
            className="glass-card hover:glow-cyan transition-all duration-300"
          >
            Sample
          </Button>
        </div>
        
        <Button
          onClick={handleQuickAdd}
          disabled={!name.trim() || !url.trim() || currentLoading}
          className="w-full bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
        >
          <Plus className="mr-2 h-4 w-4" />
          {currentLoading ? 'Adding...' : 'Quick Add'}
        </Button>
      </div>
    </Card>
  );
};

export default QuickAddCamera;
