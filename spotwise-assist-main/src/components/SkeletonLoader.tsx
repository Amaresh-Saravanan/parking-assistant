import React from 'react';
import { Card } from '@/components/ui/card';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'grid';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 3 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <Card className="p-4 glass-card animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-primary/20 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-primary/20 rounded w-3/4" />
                  <div className="h-3 bg-muted/20 rounded w-1/2" />
                </div>
              </div>
              <div className="w-16 h-6 bg-accent/20 rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-primary/20 rounded flex-1" />
              <div className="h-8 bg-secondary/20 rounded flex-1" />
            </div>
          </Card>
        );
      
      case 'list':
        return (
          <div className="p-4 glass-card animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-primary/20 rounded w-2/3" />
                <div className="h-3 bg-muted/20 rounded w-1/3" />
              </div>
            </div>
          </div>
        );
      
      case 'grid':
        return (
          <Card className="p-6 glass-card animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-primary/20 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-muted/20 rounded" />
                <div className="h-4 bg-muted/20 rounded w-3/4" />
                <div className="h-4 bg-muted/20 rounded w-1/2" />
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 bg-primary/20 rounded flex-1" />
                <div className="h-8 bg-secondary/20 rounded flex-1" />
              </div>
            </div>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
