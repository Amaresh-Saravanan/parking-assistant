import { supabase } from '@/integrations/supabase/client';

/**
 * Test function to check if video cameras are working
 */
export const testVideoCameras = async () => {
  try {
    console.log('🔍 Testing video camera setup...');
    
    // Check if cameras exist in database
    const { data: cameras, error } = await supabase
      .from('camera_feeds')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return false;
    }

    console.log('📊 Found cameras in database:', cameras?.length || 0);
    
    if (cameras && cameras.length > 0) {
      cameras.forEach((camera, index) => {
        console.log(`📹 Camera ${index + 1}:`, {
          id: camera.id,
          name: camera.name,
          url: camera.url,
          zone: camera.lot_zone,
          active: camera.is_active
        });
      });
    }

    // Check for video-specific cameras
    const videoCameras = cameras?.filter(cam => 
      cam.url.includes('/videos/') || 
      cam.url.includes('123.mp4') || 
      cam.url.includes('whatsapp-video')
    );

    console.log('🎥 Video cameras found:', videoCameras?.length || 0);
    
    if (videoCameras && videoCameras.length > 0) {
      videoCameras.forEach((camera, index) => {
        console.log(`🎬 Video Camera ${index + 1}:`, {
          name: camera.name,
          url: camera.url,
          zone: camera.lot_zone
        });
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

/**
 * Clear all cameras from database (for testing)
 */
export const clearAllCameras = async () => {
  try {
    const { error } = await supabase
      .from('camera_feeds')
      .delete()
      .neq('id', 0); // Delete all records

    if (error) throw error;
    
    console.log('🗑️ All cameras cleared from database');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear cameras:', error);
    return false;
  }
};

/**
 * Add test video cameras manually
 */
export const addTestVideoCameras = async () => {
  try {
    const testCameras = [
      {
        name: "Test Camera 1 - 123.mp4",
        url: "/videos/123.mp4",
        lot_zone: "A",
        is_active: true
      },
      {
        name: "Test Camera 2 - WhatsApp Video 1",
        url: "/videos/whatsapp-video-1.mp4",
        lot_zone: "B", 
        is_active: true
      },
      {
        name: "Test Camera 3 - WhatsApp Video 2",
        url: "/videos/whatsapp-video-2.mp4",
        lot_zone: "C",
        is_active: true
      }
    ];

    const { data, error } = await supabase
      .from('camera_feeds')
      .insert(testCameras)
      .select();

    if (error) throw error;

    console.log('✅ Test video cameras added:', data?.length);
    return true;
  } catch (error) {
    console.error('❌ Failed to add test cameras:', error);
    return false;
  }
};
