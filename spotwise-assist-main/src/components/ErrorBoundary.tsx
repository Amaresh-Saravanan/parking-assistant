import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({ 
  error, 
  resetError 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-nebula relative overflow-hidden flex items-center justify-center">
      <Card className="p-8 glass-card max-w-md mx-auto text-center">
        <div className="flex flex-col items-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-yellow-400" />
          
          <div>
            <h2 className="text-xl font-bold text-gradient-cosmic mb-2">
              System Error Detected
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              An unexpected error occurred while processing your request. 
              Our analytics engine encountered an issue.
            </p>
            
            {error && (
              <details className="text-xs text-muted-foreground bg-black/20 p-3 rounded-lg mb-4">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 text-left overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={resetError}
              className="flex-1 bg-gradient-cosmic hover:glow-aurora transition-all duration-300 text-white font-semibold"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Operation
            </Button>
            
            <Button
              onClick={() => navigate('/admin')}
              variant="outline"
              className="flex-1 glass-card hover:glow-cyan transition-all duration-300"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ErrorBoundary;
