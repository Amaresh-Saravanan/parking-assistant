import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Camera, Plus, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import StarfieldBackground from '@/components/StarfieldBackground';
import CameraCard from '@/components/CameraCard';
import AddCameraForm from '@/components/AddCameraForm';
import useCameras from '@/hooks/useCameras';
import useAuth from '@/hooks/useAuth';
import { Camera as CameraType } from '@/types/camera';
import { setupVideoCameras, checkVideoCamerasExist } from '@/utils/setupVideoCameras';

const CameraManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth('admin');
  const { 
    cameras, 
    loading, 
    detectionStatuses, 
    addCamera, 
    deleteCamera 
  } = useCameras();
  
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [deleteConfirmCamera, setDeleteConfirmCamera] = useState<CameraType | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [videoCamerasExist, setVideoCamerasExist] = useState(false);

  // Check if video cameras exist on mount
  useEffect(() => {
    const checkVideoSetup = async () => {
      const exist = await checkVideoCamerasExist();
      setVideoCamerasExist(exist);
    };
    checkVideoSetup();
  }, [cameras]);

  // Debug logging
  console.log('CameraManagement component mounted');
  console.log('Auth loading:', authLoading, 'User:', user, 'Is Admin:', isAdmin);
  console.log('Cameras loading:', loading, 'Cameras count:', cameras.length);

  // Show loading while authenticating
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading cosmic camera system...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not an admin, the useAuth hook will handle redirects
  if (!user || !isAdmin) {
    return null;
  }

  const handleAddCamera = useCallback(async (data: any) => {
    setAddLoading(true);
    try {
      const result = await addCamera(data);
      if (result) {
        setIsAddFormOpen(false); // Close form immediately on success
      }
    } catch (error) {
      console.error('Error adding camera:', error);
    } finally {
      setAddLoading(false);
    }
  }, [addCamera]);

  const handlePreview = (camera: CameraType) => {
    navigate(`/admin/cameras/${camera.id}/preview`);
  };

  const handleDetect = (camera: CameraType) => {
    navigate(`/admin/detection/${camera.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmCamera) return;
    
    await deleteCamera(deleteConfirmCamera.id);
    setDeleteConfirmCamera(null);
  };

  const handleSetupVideoCameras = async () => {
    setSetupLoading(true);
    try {
      const success = await setupVideoCameras();
      if (success) {
        setVideoCamerasExist(true);
        // Refresh cameras list
        window.location.reload();
      }
    } catch (error) {
      console.error('Error setting up video cameras:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const detectingCameras = Object.values(detectionStatuses).filter(s => s.is_detecting).length;

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
              onClick={() => navigate('/admin')}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient-aurora flex items-center gap-2">
                <Camera className="h-8 w-8" />
                Cosmic Camera Management
              </h1>
              <p className="text-muted-foreground">
                {activeCameras} active cameras • {detectingCameras} detecting • {cameras.length} total
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!videoCamerasExist && (
              <Button
                onClick={handleSetupVideoCameras}
                disabled={setupLoading}
                variant="outline"
                className="glass-card hover:glow-cyan transition-all duration-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {setupLoading ? 'Setting up...' : 'Setup Video Cameras'}
              </Button>
            )}
            <Button
              onClick={() => setIsAddFormOpen(true)}
              className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Camera className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cameras</p>
                <p className="text-2xl font-bold text-gradient-aurora">{cameras.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-gradient-cosmic">{activeCameras}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-cosmic rounded-lg">
                <div className="h-5 w-5 bg-white rounded animate-pulse" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Detecting</p>
                <p className="text-2xl font-bold text-gradient-aurora">{detectingCameras}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <div className="h-5 w-5 bg-secondary rounded" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {cameras.filter(c => c.status === 'inactive' || c.status === 'error').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Camera Grid */}
        <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          {cameras.length === 0 ? (
            <Card className="p-12 text-center glass-card">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-gradient-cosmic mb-2">
                No Cosmic Cameras Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first camera to start monitoring the cosmic parking dimensions
              </p>
              <Button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Camera
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cameras.map((camera, index) => (
                <div
                  key={camera.id}
                  className="animate-float"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CameraCard
                    camera={camera}
                    onPreview={handlePreview}
                    onDetect={handleDetect}
                    onDelete={setDeleteConfirmCamera}
                    isDetecting={detectionStatuses[camera.id]?.is_detecting}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Camera Form */}
        <AddCameraForm
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onSubmit={handleAddCamera}
          loading={addLoading}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={!!deleteConfirmCamera} 
          onOpenChange={() => setDeleteConfirmCamera(null)}
        >
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle className="text-gradient-aurora">
                Delete Camera
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete "{deleteConfirmCamera?.name}"? 
                This action cannot be undone and will stop any active detection.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmCamera(null)}
                className="flex-1 glass-card hover:glow-cyan transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-destructive hover:bg-destructive/80 text-destructive-foreground"
              >
                Delete Camera
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CameraManagement;
