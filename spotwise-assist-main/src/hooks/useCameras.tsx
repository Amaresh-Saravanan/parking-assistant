import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Camera, CameraFormData, DetectionStatus } from '@/types/camera';

export const useCameras = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [detectionStatuses, setDetectionStatuses] = useState<Record<number, DetectionStatus>>({});

  const fetchCameras = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('camera_feeds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform Supabase data to match Camera interface
      const transformedData: Camera[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        url: item.url,
        lot_zone: item.lot_zone || '',
        status: (item.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'error',
        created_at: item.created_at,
        updated_at: item.created_at // Use created_at as fallback since updated_at might not exist
      }));
      
      setCameras(transformedData);
    } catch (error: any) {
      console.error('Error fetching cameras:', error);
      toast.error('Failed to load cameras');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
    
    // Subscribe to real-time camera updates with debouncing
    let updateTimeout: NodeJS.Timeout;
    const debouncedFetch = () => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(fetchCameras, 500);
    };

    const channel = supabase
      .channel('camera_feeds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camera_feeds',
        },
        debouncedFetch
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearTimeout(updateTimeout);
    };
  }, [fetchCameras]);

  const addCamera = async (cameraData: CameraFormData): Promise<Camera | null> => {
    try {
      const { data, error } = await supabase
        .from('camera_feeds')
        .insert([{
          ...cameraData,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Transform the returned data to match Camera interface
      const transformedCamera: Camera = {
        id: data.id,
        name: data.name,
        url: data.url,
        lot_zone: data.lot_zone || '',
        status: (data.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'error',
        created_at: data.created_at,
        updated_at: data.created_at // Use created_at as fallback
      };
      
      // Optimistically update the local state instead of refetching all cameras
      setCameras(prev => [transformedCamera, ...prev]);
      
      toast.success(`Camera "${cameraData.name}" added successfully`);
      return transformedCamera;
    } catch (error: any) {
      console.error('Error adding camera:', error);
      toast.error('Failed to add camera');
      // Refetch on error to ensure consistency
      await fetchCameras();
      return null;
    }
  };

  const updateCamera = async (id: number, updates: Partial<CameraFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('camera_feeds')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Camera updated successfully');
      await fetchCameras();
      return true;
    } catch (error: any) {
      console.error('Error updating camera:', error);
      toast.error('Failed to update camera');
      return false;
    }
  };

  const deleteCamera = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('camera_feeds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Camera deleted successfully');
      await fetchCameras();
      return true;
    } catch (error: any) {
      console.error('Error deleting camera:', error);
      toast.error('Failed to delete camera');
      return false;
    }
  };

  const getCameraById = async (id: number): Promise<Camera | null> => {
    try {
      const { data, error } = await supabase
        .from('camera_feeds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform the returned data to match Camera interface
      const transformedCamera: Camera = {
        id: data.id,
        name: data.name,
        url: data.url,
        lot_zone: data.lot_zone || '',
        status: (data.is_active ? 'active' : 'inactive') as 'active' | 'inactive' | 'error',
        created_at: data.created_at,
        updated_at: data.created_at // Use created_at as fallback
      };
      
      return transformedCamera;
    } catch (error: any) {
      console.error('Error fetching camera:', error);
      return null;
    }
  };

  const updateDetectionStatus = (cameraId: number, status: DetectionStatus) => {
    setDetectionStatuses(prev => ({
      ...prev,
      [cameraId]: status
    }));
  };

  const startDetection = async (cameraId: number): Promise<boolean> => {
    try {
      // This would typically call a backend API to start YOLO detection
      // For now, we'll simulate the detection start
      const mockStatus: DetectionStatus = {
        camera_id: cameraId,
        is_detecting: true,
        last_detection: new Date().toISOString(),
        total_slots: 20,
        occupied_slots: 8,
        vacant_slots: 12,
        fps: 15
      };
      
      updateDetectionStatus(cameraId, mockStatus);
      toast.success('Detection started successfully');
      return true;
    } catch (error: any) {
      console.error('Error starting detection:', error);
      toast.error('Failed to start detection');
      return false;
    }
  };

  const stopDetection = async (cameraId: number): Promise<boolean> => {
    try {
      // This would typically call a backend API to stop YOLO detection
      const currentStatus = detectionStatuses[cameraId];
      if (currentStatus) {
        updateDetectionStatus(cameraId, {
          ...currentStatus,
          is_detecting: false
        });
      }
      
      toast.success('Detection stopped');
      return true;
    } catch (error: any) {
      console.error('Error stopping detection:', error);
      toast.error('Failed to stop detection');
      return false;
    }
  };

  return {
    cameras,
    loading,
    detectionStatuses,
    fetchCameras,
    addCamera,
    updateCamera,
    deleteCamera,
    getCameraById,
    startDetection,
    stopDetection,
    updateDetectionStatus
  };
};

export default useCameras;
