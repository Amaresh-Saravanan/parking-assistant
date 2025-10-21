import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Camera, MapPin, TrendingUp, Zap, Shield, User, Menu } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/driver");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden">
      {/* Animated Starfield Background */}
      <StarfieldBackground />
      {/* Hero Section */}
      <section className="relative z-10">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block p-6 bg-gradient-cosmic rounded-full mb-4 glow-aurora animate-pulse-glow">
              <Sparkles className="h-16 w-16 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gradient-aurora animate-float">
              Pulse
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI-powered parking management with intelligent vehicle detection and analytics
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button 
                size="lg" 
                onClick={() => {
                  console.log("Navigating to auth");
                  navigate("/auth");
                }}
                className="text-lg px-8 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  console.log("Testing directions page");
                  navigate("/directions?slot=A-101&zone=A");
                }}
                className="text-lg px-8 glass-card hover:glow-cyan transition-all duration-300"
              >
                🧭 Test Navigation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-cosmic">
            Smart Parking Intelligence
          </h2>
          <p className="text-muted-foreground text-lg">
            Powered by advanced AI detection and real-time analytics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 glass-card hover:glow-cyan transition-all duration-300 animate-float">
            <Camera className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">AI Detection</h3>
            <p className="text-muted-foreground">
              Real-time vehicle detection using advanced computer vision technology
            </p>
          </Card>

          <Card className="p-6 glass-card hover:glow-cyan transition-all duration-300 animate-float" style={{animationDelay: '0.2s'}}>
            <MapPin className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">Smart Navigation</h3>
            <p className="text-muted-foreground">
              Intelligent routing and navigation with optimized pathfinding algorithms
            </p>
          </Card>

          <Card className="p-6 glass-card hover:glow-cyan transition-all duration-300 animate-float" style={{animationDelay: '0.4s'}}>
            <TrendingUp className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">Advanced Analytics</h3>
            <p className="text-muted-foreground">
              Real-time occupancy tracking and predictive analytics insights
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient-cosmic">
            Why Choose ParkVision AI?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 glass-card hover:glow-cyan transition-all duration-300">
              <Zap className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">Cost Efficiency</h3>
                <p className="text-muted-foreground">
                  No expensive sensors required. Works with standard IP cameras for easy deployment
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 glass-card hover:glow-cyan transition-all duration-300">
              <Shield className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">High Accuracy</h3>
                <p className="text-muted-foreground">
                  99.9%+ detection accuracy across all weather conditions - rain, fog, or bright sunlight
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 glass-card hover:glow-cyan transition-all duration-300">
              <TrendingUp className="h-8 w-8 text-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gradient-aurora">Enterprise Scale</h3>
                <p className="text-muted-foreground">
                  Manage 1000+ slots per camera. Perfect for shopping centers, airports, and large facilities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <Card className="max-w-4xl mx-auto p-12 text-center glass-card glow-aurora animate-pulse-glow">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-cosmic">
            Ready to Transform Your Parking Management?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of businesses using intelligent parking solutions
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="text-lg px-12 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
          >
Start Free Trial
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
