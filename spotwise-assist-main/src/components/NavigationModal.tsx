import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Route, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Slot {
  id: number;
  slot_number: string;
  location: { x: number; y: number; width: number; height: number };
  status: "vacant" | "occupied";
  zone: string;
}

interface NavigationModalProps {
  slot: Slot | null;
  isOpen: boolean;
  onClose: () => void;
}

const NavigationModal: React.FC<NavigationModalProps> = ({ slot, isOpen, onClose }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);

  if (!slot) return null;

  // Simulate distance and time calculations
  const distance = Math.floor(Math.random() * 50) + 10; // 10-60m
  const walkTime = Math.ceil(distance / 20); // ~20m per minute walking speed

  const simulatedInstructions = [
    "Exit the main entrance",
    `Head towards Zone ${slot.zone}`,
    "Follow the yellow parking lines",
    `Look for slot ${slot.slot_number} on your left`,
    "Park within the designated lines"
  ];

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setNavigationStarted(true);
    toast.success(`Navigation started to Slot ${slot.slot_number}!`);
    
    // Simulate navigation process
    setTimeout(() => {
      setIsNavigating(false);
      toast.success("You have arrived at your destination!");
    }, 3000);
  };

  const handleClose = () => {
    setIsNavigating(false);
    setNavigationStarted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient-aurora flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Navigate to Slot {slot.slot_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Slot Details */}
          <Card className="p-4 glass-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Slot {slot.slot_number}</h3>
                <p className="text-sm text-muted-foreground">Zone {slot.zone}</p>
              </div>
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                Available
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span>{distance}m away</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{walkTime} min walk</span>
              </div>
            </div>
          </Card>

          {/* Navigation Instructions */}
          {navigationStarted && (
            <Card className="p-4 glass-card animate-fade-in">
              <h4 className="font-semibold mb-3 text-gradient-cosmic flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                Step-by-Step Directions
              </h4>
              <div className="space-y-2">
                {simulatedInstructions.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-muted-foreground">{instruction}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Navigation Status */}
          {isNavigating && (
            <Card className="p-4 glass-card glow-cosmic animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">Navigating...</p>
                  <p className="text-sm text-muted-foreground">Follow the cosmic path to your slot</p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {!navigationStarted ? (
              <>
                <Button
                  onClick={handleStartNavigation}
                  className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                  disabled={isNavigating}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Start Navigation
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="glass-card hover:glow-cyan transition-all duration-300"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
                  disabled={isNavigating}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isNavigating ? "Navigating..." : "Complete"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NavigationModal;
