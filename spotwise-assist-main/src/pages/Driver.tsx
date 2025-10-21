import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, MapPin, Navigation, Route, Sparkles, Car } from "lucide-react";
import ParkingSlot from "@/components/ParkingSlot";
import NavigationModal from "@/components/NavigationModal";
import StarfieldBackground from "@/components/StarfieldBackground";
import useAuth from "@/hooks/useAuth";

interface Slot {
  id: number;
  slot_number: string;
  location: { x: number; y: number; width: number; height: number };
  status: "vacant" | "occupied";
  zone: string;
}

const Driver = () => {
  // Authentication guard - only allow drivers
  const { user, loading: authLoading, isDriver, logout } = useAuth('driver');
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false);
  const [navigationSlot, setNavigationSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (isDriver) {
      fetchSlots();

      // Subscribe to real-time updates
      const channel = supabase
        .channel("parking_slots_changes")
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
  }, [isDriver]);

  const fetchSlots = async () => {
    try {
      const { data, error } = await supabase
        .from("parking_slots")
        .select("*")
        .order("slot_number");

      if (error) throw error;
      setSlots((data as any) || []);
    } catch (error: any) {
      toast.error("Failed to load parking slots");
    } finally {
      setLoading(false);
    }
  };

  const findNearestSlot = () => {
    const vacantSlots = slots.filter((s) => s.status === "vacant");
    if (vacantSlots.length === 0) {
      toast.error("No vacant slots available");
      return;
    }
    
    // Simple algorithm: pick first vacant slot
    const nearest = vacantSlots[0];
    setSelectedSlot(nearest);
    toast.success(`Nearest slot: ${nearest.slot_number} in Zone ${nearest.zone}`);
  };

  const handleNavigateToSlot = (slot: Slot) => {
    if (slot.status !== "vacant") {
      toast.error("This slot is not available");
      return;
    }
    
    setNavigationSlot(slot);
    setIsNavigationModalOpen(true);
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.status === "vacant") {
      setSelectedSlot(slot);
      toast.success(`Selected slot ${slot.slot_number}`);
    } else {
      toast.error("This slot is occupied");
    }
  };

  const vacantCount = slots.filter((s) => s.status === "vacant").length;
  const occupiedCount = slots.filter((s) => s.status === "occupied").length;

  // Show loading while authenticating or fetching data
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
        <StarfieldBackground />
        <div className="relative z-10 text-center">
          <div className="animate-spin mb-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
          </div>
          <p className="text-muted-foreground">Loading parking map...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or not a driver, the useAuth hook will handle redirects
  if (!user || !isDriver) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden p-4">
      {/* Animated Starfield Background */}
      <StarfieldBackground />
      
      <div className="max-w-6xl mx-auto space-y-4 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-gradient-aurora flex items-center gap-2">
              <Car className="h-8 w-8" />
Smart Parking Navigator
            </h1>
            <p className="text-muted-foreground">
              Welcome, {user.full_name} • {vacantCount} slots available • {occupiedCount} occupied
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={logout}
            className="glass-card hover:glow-cyan transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <Button 
            onClick={findNearestSlot} 
            className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          >
            <Navigation className="mr-2 h-4 w-4" />
Find Nearest Slot
          </Button>
        </div>

        {/* Selected Slot Info */}
        {selectedSlot && (
          <Card className="p-4 glass-card glow-cosmic animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gradient-aurora">Slot {selectedSlot.slot_number}</h3>
                <p className="text-sm text-muted-foreground">Zone {selectedSlot.zone}</p>
                <p className="text-sm text-accent mt-1">✨ Available for parking</p>
              </div>
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleNavigateToSlot(selectedSlot)}
                className="flex items-center gap-2 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
              >
                <Route className="h-4 w-4" />
                Navigate to Slot
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedSlot(null)}
                className="glass-card hover:glow-cyan transition-all duration-300"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Cosmic Parking Map */}
        <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.4s'}}>
          <h3 className="text-lg font-semibold mb-4 text-gradient-cosmic flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Cosmic Parking Grid
          </h3>
          <div className="overflow-x-auto">
            <svg
              width="600"
              height="500"
              viewBox="0 0 600 500"
              className="mx-auto"
              style={{ maxWidth: "100%", height: "auto" }}
            >
              {/* Grid lines */}
              <defs>
                <pattern
                  id="cosmicGrid"
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
              <rect width="600" height="500" fill="url(#cosmicGrid)" />

              {/* Zone labels */}
              <text x="30" y="30" className="fill-primary text-sm font-semibold">
                🌌 Cosmic Zone A
              </text>
              <text x="30" y="230" className="fill-primary text-sm font-semibold">
                ✨ Stellar Zone B
              </text>

              {/* Parking Slots */}
              {slots.map((slot) => (
                <ParkingSlot
                  key={slot.id}
                  slotNumber={slot.slot_number}
                  status={slot.status}
                  x={slot.location.x}
                  y={slot.location.y}
                  width={slot.location.width}
                  height={slot.location.height}
                  onClick={() => handleSlotClick(slot)}
                />
              ))}
            </svg>
          </div>

          {/* Legend */}
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
        </Card>

        {/* Available Cosmic Slots List */}
        <Card className="p-6 glass-card animate-fade-in" style={{animationDelay: '0.6s'}}>
          <h3 className="text-lg font-semibold mb-4 text-gradient-cosmic flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Available Cosmic Slots
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots
              .filter(slot => slot.status === "vacant")
              .map((slot, index) => (
                <div
                  key={slot.id}
                  className="p-4 glass-card hover:glow-cyan transition-all cursor-pointer animate-float"
                  style={{animationDelay: `${index * 0.1}s`}}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gradient-aurora">
                      Slot {slot.slot_number}
                    </span>
                    <span className="text-xs text-muted-foreground bg-primary/20 px-2 py-1 rounded">
                      Zone {slot.zone}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToSlot(slot);
                    }}
                    className="w-full flex items-center gap-2 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                  >
                    <Navigation className="h-3 w-3" />
                    Navigate
                  </Button>
                </div>
              ))}
          </div>
          
          {slots.filter(slot => slot.status === "vacant").length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No cosmic slots available in this dimension</p>
              <p className="text-sm mt-2">Try refreshing the cosmic grid</p>
            </div>
          )}
        </Card>

        {/* Navigation Modal */}
        <NavigationModal
          slot={navigationSlot}
          isOpen={isNavigationModalOpen}
          onClose={() => {
            setIsNavigationModalOpen(false);
            setNavigationSlot(null);
          }}
        />
      </div>
    </div>
  );
};

export default Driver;
