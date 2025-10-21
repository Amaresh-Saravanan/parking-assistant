export interface Camera {
  id: number;
  name: string;
  url: string;
  lot_zone?: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CameraFormData {
  name: string;
  url: string;
  lot_zone?: string;
}

export interface DetectionStatus {
  camera_id: number;
  is_detecting: boolean;
  last_detection: string | null;
  total_slots: number;
  occupied_slots: number;
  vacant_slots: number;
  fps: number;
}

export interface DetectionResult {
  id: number;
  camera_id: number;
  slot_number: string;
  status: 'vacant' | 'occupied';
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  detected_at: string;
}
