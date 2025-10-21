-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('driver', 'admin');

-- Create slot status enum
CREATE TYPE public.slot_status AS ENUM ('vacant', 'occupied');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'driver',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create parking_slots table
CREATE TABLE public.parking_slots (
  id SERIAL PRIMARY KEY,
  slot_number TEXT NOT NULL UNIQUE,
  location JSONB NOT NULL, -- {x: number, y: number, width: number, height: number}
  status public.slot_status NOT NULL DEFAULT 'vacant',
  zone TEXT NOT NULL DEFAULT 'A',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create camera_feeds table
CREATE TABLE public.camera_feeds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  lot_zone TEXT NOT NULL DEFAULT 'A',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create detection_logs table
CREATE TABLE public.detection_logs (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER REFERENCES public.parking_slots(id) ON DELETE CASCADE,
  status public.slot_status NOT NULL,
  camera_id INTEGER REFERENCES public.camera_feeds(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camera_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Parking slots policies (read-only for drivers, full access for admins)
CREATE POLICY "Anyone can view parking slots"
  ON public.parking_slots FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage parking slots"
  ON public.parking_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Camera feeds policies (admin only)
CREATE POLICY "Anyone can view active cameras"
  ON public.camera_feeds FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cameras"
  ON public.camera_feeds FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Detection logs policies
CREATE POLICY "Anyone can view logs"
  ON public.detection_logs FOR SELECT
  USING (true);

CREATE POLICY "System can insert logs"
  ON public.detection_logs FOR INSERT
  WITH CHECK (true);

-- Function to update slot timestamp
CREATE OR REPLACE FUNCTION public.update_slot_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for slot updates
CREATE TRIGGER update_parking_slots_timestamp
  BEFORE UPDATE ON public.parking_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_slot_timestamp();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'driver')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample parking slots
INSERT INTO public.parking_slots (slot_number, location, status, zone) VALUES
  ('A1', '{"x": 50, "y": 50, "width": 80, "height": 150}', 'vacant', 'A'),
  ('A2', '{"x": 150, "y": 50, "width": 80, "height": 150}', 'occupied', 'A'),
  ('A3', '{"x": 250, "y": 50, "width": 80, "height": 150}', 'vacant', 'A'),
  ('A4', '{"x": 350, "y": 50, "width": 80, "height": 150}', 'vacant', 'A'),
  ('A5', '{"x": 450, "y": 50, "width": 80, "height": 150}', 'occupied', 'A'),
  ('B1', '{"x": 50, "y": 250, "width": 80, "height": 150}', 'vacant', 'B'),
  ('B2', '{"x": 150, "y": 250, "width": 80, "height": 150}', 'vacant', 'B'),
  ('B3', '{"x": 250, "y": 250, "width": 80, "height": 150}', 'occupied', 'B'),
  ('B4', '{"x": 350, "y": 250, "width": 80, "height": 150}', 'vacant', 'B'),
  ('B5', '{"x": 450, "y": 250, "width": 80, "height": 150}', 'vacant', 'B');

-- Insert sample camera
INSERT INTO public.camera_feeds (name, url, lot_zone, is_active) VALUES
  ('Zone A Camera 1', 'rtsp://example.com/camera1', 'A', true),
  ('Zone B Camera 1', 'rtsp://example.com/camera2', 'B', true);

-- Enable realtime for parking_slots
ALTER PUBLICATION supabase_realtime ADD TABLE public.parking_slots;