import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, Camera, Activity, ParkingCircle, TrendingUp, Plus, Zap, Sparkles, Video } from "lucide-react";
import StatCard from "@/components/StatCard";
import ParkingSlot from "@/components/ParkingSlot";
import StarfieldBackground from "@/components/StarfieldBackground";
import useAuth from "@/hooks/useAuth";
import { setupVideoCameras, checkVideoCamerasExist } from "@/utils/setupVideoCameras";
import { testVideoCameras, clearAllCameras, addTestVideoCameras } from "@/utils/testVideoCameras";

interface Slot {
  id: number;
  slot_number: string;
  location: { x: number; y: number; width: number; height: number };
  status: "vacant" | "occupied";
  zone: string;
  updated_at: string;
}

interface CameraFeed {
  id: number;
  name: string;
  url: string;
  video_url?: string;
  lot_zone: string;
  is_active: boolean;
}

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth('admin');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [cameras, setCameras] = useState<CameraFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCamera, setNewCamera] = useState({ name: "", url: "", video_url: "", lot_zone: "A" });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();

      // Subscribe to real-time updates
      const channel = supabase
        .channel("admin_updates")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "parking_slots",
          },
          () => {
            fetchSlots();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      // Check if video cameras are set up, if not, set them up
      const videoCamerasExist = await checkVideoCamerasExist();
      if (!videoCamerasExist) {
        console.log('🎥 Setting up video cameras for the first time...');
        await setupVideoCameras();
      }
      
      await Promise.all([fetchSlots(), fetchCameras()]);
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("parking_slots")
        .select("*")
        .order("slot_number");

      if (error) throw error;
      setSlots((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load slots");
    }
  };

  const fetchCameras = async () => {
    try {
      const { data, error } = await supabase
        .from("camera_feeds")
        .select("*")
        .order("name");

      if (error) throw error;
      setCameras((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load cameras");
    }
  };

  const handleAddCamera = async () => {
    try {
      const { error } = await supabase.from("camera_feeds").insert([newCamera]);

      if (error) throw error;

      toast.success("Camera added successfully");
      setNewCamera({ name: "", url: "", video_url: "", lot_zone: "A" });
      setDialogOpen(false);
      fetchCameras();
    } catch (error: any) {
      toast.error(error.message || "Failed to add camera");
    }
  };

  const handleVideoAnalysis = (camera: CameraFeed) => {
    if (!camera.video_url) {
      toast.error("No video URL configured for this camera");
      return;
    }
    // Navigate to video editor with the camera's video URL
    navigate(`/video-editor?videoUrl=${encodeURIComponent(camera.video_url)}&cameraName=${encodeURIComponent(camera.name)}`);
  };

  const simulateDetection = async () => {
    // Simulate AI detection by randomly changing slot status
    const randomSlot = slots[Math.floor(Math.random() * slots.length)];
    const newStatus = randomSlot.status === "vacant" ? "occupied" : "vacant";

    try {
      const { error } = await supabase
        .from("parking_slots")
        .update({ status: newStatus })
        .eq("id", randomSlot.id);

      if (error) throw error;
      
      toast.success(`Simulated detection: ${randomSlot.slot_number} is now ${newStatus}`);
    } catch (error: any) {
      toast.error("Simulation failed");
    }
  };

  const vacantCount = slots.filter((s) => s.status === "vacant").length;
  const occupiedCount = slots.filter((s) => s.status === "occupied").length;
  const totalSlots = slots.length;
  const occupancyRate = totalSlots > 0 ? Math.round((occupiedCount / totalSlots) * 100) : 0;

  // Show loading while authenticating or fetching data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not an admin, the useAuth hook will handle redirects
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden p-4 md:p-6">
      <StarfieldBackground />
      
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient-aurora flex items-center gap-2">
              <Sparkles className="h-8 w-8" />
Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome, {user.full_name} • Real-time parking management system
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/cameras")}
              className="flex items-center gap-2 glass-card hover:glow-cyan transition-all duration-300"
            >
              <Camera className="h-4 w-4" />
              Camera Management
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/video-editor")}
              className="flex items-center gap-2 glass-card hover:glow-cyan transition-all duration-300"
            >
              <Video className="h-4 w-4" />
              Video Editor
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => user && supabase.auth.signOut().then(() => navigate("/"))}
              className="glass-card hover:glow-cyan transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Card className="p-4 glass-card hover:glow-cyan transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <ParkingCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Slots</p>
                <p className="text-2xl font-bold text-gradient-aurora">{totalSlots}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card hover:glow-cyan transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-gradient-cosmic">{vacantCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card hover:glow-cyan transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Camera className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold text-gradient-aurora">{occupiedCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 glass-card hover:glow-cyan transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-cosmic rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy</p>
                <p className="text-2xl font-bold text-gradient-cosmic">{occupancyRate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <Button 
            onClick={simulateDetection} 
            className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          >
            <Zap className="mr-2 h-4 w-4" />
            Simulate AI Detection
          </Button>
          <Button 
            onClick={() => navigate("/admin/cameras")} 
            variant="outline"
            className="glass-card hover:glow-cyan transition-all duration-300"
          >
            <Camera className="mr-2 h-4 w-4" />
            Manage Cameras
          </Button>
          <Button 
            onClick={async () => {
              const success = await setupVideoCameras();
              if (success) {
                fetchCameras(); // Refresh camera list
              }
            }} 
            variant="outline"
            className="glass-card hover:glow-aurora transition-all duration-300"
          >
            <Video className="mr-2 h-4 w-4" />
            Setup Video Cameras
          </Button>
          <Button 
            onClick={async () => {
              await testVideoCameras();
              toast.success('Check console for camera test results');
            }} 
            variant="outline"
            className="glass-card hover:glow-cyan transition-all duration-300"
          >
            <Activity className="mr-2 h-4 w-4" />
            Test Cameras
          </Button>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in" style={{animationDelay: '0.6s'}}>
          {/* Smart Parking Map */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-gradient-cosmic flex items-center gap-2">
                <ParkingCircle className="h-5 w-5" />
Live Parking Management
              </CardTitle>
              <CardDescription>Real-time parking slot monitoring and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <svg
                  width="600"
                  height="500"
                  viewBox="0 0 600 500"
                  className="mx-auto"
                  style={{ maxWidth: "100%", height: "auto" }}
                >
                  <defs>
                    <pattern
                      id="admin-grid"
                      width="50"
                      height="50"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 50 0 L 0 0 0 50"
                        fill="none"
                        stroke="hsl(var(--primary) / 0.3)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="600" height="500" fill="url(#admin-grid)" />

                  <text x="30" y="30" className="fill-primary text-sm font-semibold">
🅰️ Zone A
                  </text>
                  <text x="30" y="230" className="fill-primary text-sm font-semibold">
🅱️ Zone B
                  </text>

                  {slots.map((slot) => (
                    <ParkingSlot
                      key={slot.id}
                      slotNumber={slot.slot_number}
                      status={slot.status}
                      x={slot.location.x}
                      y={slot.location.y}
                      width={slot.location.width}
                      height={slot.location.height}
                    />
                  ))}
                </svg>
              </div>

              <div className="flex gap-6 justify-center mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-accent/20 border-2 border-accent rounded glow-cyan"></div>
                  <span className="text-sm">✨ Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/20 border-2 border-destructive rounded"></div>
                  <span className="text-sm">🚫 Occupied</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Management System */}
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-gradient-cosmic flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Camera Management System
                </CardTitle>
                <CardDescription>Advanced surveillance and monitoring infrastructure</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={() => {
                    console.log('Navigating to camera management...');
                    try {
                      navigate("/admin/cameras");
                    } catch (error) {
                      console.error('Navigation error:', error);
                      toast.error('Failed to navigate to camera management');
                      // Fallback: try window.location
                      window.location.href = '/admin/cameras';
                    }
                  }}
                  className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Manage Cameras
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => navigate("/admin/live-feed")}
                  variant="outline"
                  className="glass-card hover:glow-cyan transition-all duration-300"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Live Analytics
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cameras.slice(0, 3).map((camera, index) => (
                  <div
                    key={camera.id}
                    className="p-4 glass-card hover:glow-cyan transition-all duration-300 animate-float"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gradient-aurora">{camera.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          Zone {camera.lot_zone}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {camera.url}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${
                          camera.is_active
                            ? "bg-accent/20 text-accent border border-accent"
                            : "bg-muted/20 text-muted-foreground border border-muted"
                        }`}
                      >
                        {camera.is_active ? "🟢 Online" : "⚫ Offline"}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/admin/cameras/${camera.id}/preview`)}
                        className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/detection/${camera.id}`)}
                        className="flex-1 glass-card hover:glow-cyan transition-all duration-300"
                      >
                        <Zap className="h-3 w-3 mr-1" />
                        Analyze
                      </Button>
                    </div>
                  </div>
                ))}

                {cameras.length === 0 && (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">No surveillance cameras configured</p>
                    <Button
                      onClick={() => navigate("/admin/cameras")}
                      className="bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Configure Camera System
                    </Button>
                  </div>
                )}

                {cameras.length > 3 && (
                  <div className="text-center pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/admin/cameras")}
                      className="glass-card hover:glow-cyan transition-all duration-300"
                    >
                      View All {cameras.length} Cameras
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;
