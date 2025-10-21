import React, { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

interface StarfieldBackgroundProps {
  starCount?: number;
  animationSpeed?: number;
}

const StarfieldBackground: React.FC<StarfieldBackgroundProps> = ({ 
  starCount = 75, // Reduced from 150 for better performance
  animationSpeed = 1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTime = useRef<number>(0);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  const createStars = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5, // Smaller stars for better performance
        opacity: 0.3 + Math.random() * 0.7,
        speed: (0.1 + Math.random() * 0.3) * animationSpeed,
      });
    }
    starsRef.current = stars;
  }, [starCount, animationSpeed]);

  const animate = useCallback((currentTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Throttle animation to ~30fps for better performance
    if (currentTime - lastFrameTime.current < 33) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }
    lastFrameTime.current = currentTime;

    // Clear with gradient background for better visual effect
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'hsl(230, 35%, 7%)');
    gradient.addColorStop(1, 'hsl(230, 35%, 4%)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Batch star rendering for better performance
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    starsRef.current.forEach((star) => {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();

      star.y += star.speed;

      if (star.y > canvas.height + star.size) {
        star.y = -star.size;
        star.x = Math.random() * canvas.width;
      }
    });
    ctx.globalAlpha = 1;

    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();
    createStars();
    animationFrameRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      createStars();
    };

    // Debounce resize events
    let resizeTimeout: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [resizeCanvas, createStars, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="starfield-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6,
        willChange: 'transform', // Optimize for animations
      }}
    />
  );
};

export default StarfieldBackground;
