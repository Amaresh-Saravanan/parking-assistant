import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VideoCameraConfig {
  name: string;
  url: string;
  lot_zone: string;
  description: string;
}

// Your 3 video configurations
export const VIDEO_CAMERAS: VideoCameraConfig[] = [
  {
    name: "Parking Zone A Camera",
    url: "/videos/camera1.mp4",
    lot_zone: "Zone A",
    description: "Main entrance monitoring with YOLO detection"
  },
  {
    name: "Parking Zone B Camera", 
    url: "/videos/camera2.mp4",
    lot_zone: "Zone B",
    description: "Zone B surveillance with real-time detection"
  },
  {
    name: "Parking Zone C Camera",
    url: "/videos/camera3.mp4", 
    lot_zone: "Zone C",
    description: "Zone C monitoring with AI object detection"
  }
];

/**
 * Check if video cameras are already set up in the database
 */
export const checkVideoCamerasExist = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('camera_feeds')
      .select('url')
      .in('url', VIDEO_CAMERAS.map(cam => cam.url));

    if (error) throw error;
    
    return (data?.length || 0) >= VIDEO_CAMERAS.length;
  } catch (error) {
    console.error('Error checking video cameras:', error);
    return false;
  }
};

/**
 * Set up your 3 videos as camera feeds in the system
 */
export const setupVideoCameras = async (): Promise<boolean> => {
  try {
    console.log('🎥 Setting up video cameras...');
    
    // Check if cameras already exist
    const exist = await checkVideoCamerasExist();
    if (exist) {
      console.log('✅ Video cameras already configured');
      return true;
    }

    // Add each video as a camera feed
    const insertPromises = VIDEO_CAMERAS.map(async (camera) => {
      const { data, error } = await supabase
        .from('camera_feeds')
        .insert({
          name: camera.name,
          url: camera.url,
          lot_zone: camera.lot_zone,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error(`Error adding camera ${camera.name}:`, error);
        throw error;
      }

      console.log(`✅ Added camera: ${camera.name}`);
      return data;
    });

    await Promise.all(insertPromises);
    
    toast.success('🎥 Video cameras configured successfully!');
    console.log('🎉 All video cameras set up successfully');
    
    return true;
  } catch (error: any) {
    console.error('Error setting up video cameras:', error);
    toast.error('Failed to set up video cameras: ' + error.message);
    return false;
  }
};

/**
 * Remove video cameras from the system
 */
export const removeVideoCameras = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('camera_feeds')
      .delete()
      .in('url', VIDEO_CAMERAS.map(cam => cam.url));

    if (error) throw error;
    
    toast.success('Video cameras removed successfully');
    return true;
  } catch (error: any) {
    console.error('Error removing video cameras:', error);
    toast.error('Failed to remove video cameras: ' + error.message);
    return false;
  }
};

/**
 * Get video camera by URL
 */
export const getVideoCameraByUrl = (url: string): VideoCameraConfig | undefined => {
  return VIDEO_CAMERAS.find(cam => cam.url === url);
};
