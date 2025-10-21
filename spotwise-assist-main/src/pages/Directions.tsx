import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Navigation, MapPin, Clock, Car, Route } from "lucide-react";

interface DirectionStep {
  instruction: string;
  distance: string;
  icon: string;
}

const Directions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slotNumber = searchParams.get('slot');
  const zone = searchParams.get('zone');
  
  const [directions, setDirections] = useState<DirectionStep[]>([]);
  const [estimatedTime, setEstimatedTime] = useState("3 mins");
  const [totalDistance, setTotalDistance] = useState("150m");

  useEffect(() => {
    // Generate sample directions based on slot and zone
    generateDirections(slotNumber, zone);
  }, [slotNumber, zone]);

  const generateDirections = (slot: string | null, slotZone: string | null) => {
    if (!slot || !slotZone) return;

    // Sample directions based on zone
    const sampleDirections: { [key: string]: DirectionStep[] } = {
      'A': [
        { instruction: "Start from main entrance", distance: "0m", icon: "start" },
        { instruction: "Head straight towards Zone A", distance: "50m", icon: "straight" },
        { instruction: "Turn right at the first intersection", distance: "30m", icon: "turn-right" },
        { instruction: "Continue straight for 20 meters", distance: "20m", icon: "straight" },
        { instruction: `Parking slot ${slot} will be on your left`, distance: "50m", icon: "destination" }
      ],
      'B': [
        { instruction: "Start from main entrance", distance: "0m", icon: "start" },
        { instruction: "Head straight towards the central area", distance: "40m", icon: "straight" },
        { instruction: "Turn left at the Zone B sign", distance: "35m", icon: "turn-left" },
        { instruction: "Drive straight past the first row", distance: "25m", icon: "straight" },
        { instruction: `Parking slot ${slot} will be on your right`, distance: "50m", icon: "destination" }
      ],
      'C': [
        { instruction: "Start from main entrance", distance: "0m", icon: "start" },
        { instruction: "Head towards the back of the parking area", distance: "80m", icon: "straight" },
        { instruction: "Turn right towards Zone C", distance: "40m", icon: "turn-right" },
        { instruction: "Continue until you see the Zone C marker", distance: "30m", icon: "straight" },
        { instruction: `Parking slot ${slot} will be directly ahead`, distance: "20m", icon: "destination" }
      ]
    };

    const zoneDirections = sampleDirections[slotZone] || sampleDirections['A'];
    setDirections(zoneDirections);

    // Set estimated time and distance based on zone
    const zoneData: { [key: string]: { time: string; distance: string } } = {
      'A': { time: "2 mins", distance: "150m" },
      'B': { time: "3 mins", distance: "180m" },
      'C': { time: "4 mins", distance: "220m" }
    };

    const data = zoneData[slotZone] || zoneData['A'];
    setEstimatedTime(data.time);
    setTotalDistance(data.distance);
  };

  const getStepIcon = (iconType: string) => {
    switch (iconType) {
      case 'start':
        return <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">S</div>;
      case 'straight':
        return <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">↑</div>;
      case 'turn-right':
        return <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">↗</div>;
      case 'turn-left':
        return <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">↖</div>;
      case 'destination':
        return <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">P</div>;
      default:
        return <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white">•</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Directions to {slotNumber}
              </h1>
              <p className="text-muted-foreground">
                Navigate to your reserved parking spot in Zone {zone}
              </p>
            </div>
          </div>
          <Badge variant="default" className="px-3 py-1">
            <Navigation className="h-3 w-3 mr-1" />
            Active Route
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Directions List */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  Step-by-Step Directions
                </CardTitle>
                <CardDescription>
                  Follow these directions to reach parking slot {slotNumber}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {directions.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex-shrink-0 mt-1">
                        {getStepIcon(step.icon)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Step {index + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {step.distance}
                          </Badge>
                        </div>
                        <p className="text-foreground font-medium">
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map Placeholder */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Parking Layout Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Interactive Map View</p>
                    <p className="text-sm text-muted-foreground">
                      Map integration coming soon - showing route to {slotNumber}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Route Summary */}
          <div className="space-y-4">
            {/* Trip Info */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Estimated Time:</span>
                  </div>
                  <Badge variant="outline">{estimatedTime}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total Distance:</span>
                  </div>
                  <Badge variant="outline">{totalDistance}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Destination:</span>
                  </div>
                  <Badge variant="default">Slot {slotNumber}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Parking Slot Info */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Parking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {slotNumber}
                  </div>
                  <div className="text-sm text-green-300">
                    Zone {zone} - Available
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Zone:</span>
                    <span>Zone {zone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-500">Available</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>Standard</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={() => navigate("/driver")}
              >
                <Car className="h-4 w-4 mr-2" />
                Reserve This Spot
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Choose Different Spot
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Directions;
