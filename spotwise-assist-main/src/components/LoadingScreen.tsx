import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading cosmic interface..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-nebula relative overflow-hidden">
      {/* Simplified background for faster loading */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      
      <div className="relative z-10 text-center">
        <div className="animate-spin mb-4">
          <Sparkles className="h-12 w-12 text-primary mx-auto" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-48 bg-primary/20 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-cosmic rounded-full animate-pulse" style={{width: '60%'}} />
          </div>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
