import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import StarfieldBackground from "@/components/StarfieldBackground";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"driver" | "admin">("driver");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) throw error;
      
      toast.success("Account created! Logging you in...");
      
      // Auto login after signup
      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/driver");
        }
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      toast.success("Welcome back!");
      
      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/driver");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-nebula relative overflow-hidden">
      {/* Animated Starfield Background */}
      <StarfieldBackground />
      
      {/* Glassmorphism Auth Card */}
      <Card className="w-full max-w-md glass-card glow-cosmic animate-fade-in relative z-10">
        {/* Back to Home Button */}
        <div className="p-4 pb-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground hover:glow-cyan transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <CardHeader className="space-y-1 text-center pt-2 animate-float">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-cosmic rounded-full glow-aurora animate-pulse-glow">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient-aurora">
            Pulse
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter the cosmic parking dimension
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 glass-card">
              <TabsTrigger value="signin" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-gradient-cosmic data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-foreground">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-foreground">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold" 
                  disabled={loading}
                >
                  {loading ? "Entering the cosmos..." : "Enter Cosmic Realm"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Cosmic Explorer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="explorer@cosmos.space"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="glass-card focus:ring-primary focus:glow-cosmic transition-all duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-foreground">Choose your cosmic role:</Label>
                  <RadioGroup value={role} onValueChange={(value) => setRole(value as "driver" | "admin")} className="space-y-2">
                    <div className="flex items-center space-x-3 p-3 rounded-lg glass-card hover:glow-cyan transition-all duration-300">
                      <RadioGroupItem value="driver" id="driver" className="border-primary" />
                      <Label htmlFor="driver" className="cursor-pointer text-foreground font-medium">
                        🚗 Space Driver (Navigate Parking)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg glass-card hover:glow-cyan transition-all duration-300">
                      <RadioGroupItem value="admin" id="admin" className="border-primary" />
                      <Label htmlFor="admin" className="cursor-pointer text-foreground font-medium">
                        🌌 Cosmic Admin (Control Universe)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold" 
                  disabled={loading}
                >
                  {loading ? "Materializing in cosmos..." : "Join the Cosmic Fleet"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
