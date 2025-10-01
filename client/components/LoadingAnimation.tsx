import { useState, useEffect, useRef } from "react";

export default function LoadingAnimation() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Simulate loading progress - longer duration to let bean animation finish
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Start exit animation after completion - wait longer for bean animation
                 setTimeout(() => {
                   setIsExiting(true);
                   // Hide completely after slide-up animation
                   setTimeout(() => {
                     setIsVisible(false);
                   }, 2000); // Extended to let dots keep animating during slide-up
                 }, 2400); // Wait 2.4 seconds after loading completes to let bean animation finish
          return 100;
        }
        return prev + Math.random() * 8 + 3; // Slower increment for longer loading
      });
    }, 150); // Slower interval for longer loading

    return () => clearInterval(interval);
  }, []);

  // Coffee Bean Disintegration Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = 400;
      canvas.height = 450; // Shorter container height
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Colors - adapted for dark background
    const BACKGROUND = "transparent";
    const BEAN_COLOR = "#fcf4e4";
    const POWDER_COLOR = "#fcf4e4";

    // Particles array
    const particles: Particle[] = [];

      // Draw smooth coffee bean shape
      const drawBean = (topClip: number | null) => {
        const centerX = canvas.width / 2;
        const centerY = 200; // Fixed position near top instead of center
        const beanWidth = 120;
        const beanHeight = 140;

      ctx.save();

      if (topClip !== null) {
        ctx.beginPath();
        // Create curved clipping path instead of straight rectangle
        const centerX = canvas.width / 2;
        const beanWidth = 120;
        const beanHeight = 140;
        const centerY = 200;
        
        // Calculate curved boundary based on bean shape
        const progress = (topClip - (centerY - beanHeight / 2)) / beanHeight;
        const curvedWidth = (beanWidth / 2) * Math.sqrt(1 - Math.pow(2 * progress - 1, 2));
        
        // Create curved clipping path
        ctx.moveTo(0, 0);
        ctx.lineTo(canvas.width, 0);
        ctx.lineTo(canvas.width, topClip);
        
        // Add curved bottom edge following bean shape with more pronounced curves
        for (let x = canvas.width; x >= 0; x--) {
          const normalizedX = (x - centerX) / (beanWidth / 2);
          if (Math.abs(normalizedX) <= 1) {
            // More pronounced curved calculation with additional wave
            const baseCurve = Math.sqrt(1 - normalizedX * normalizedX) * curvedWidth * 0.6;
            const waveCurve = Math.sin(normalizedX * Math.PI * 3) * curvedWidth * 0.2; // Additional wave
            const curvedY = topClip + baseCurve + waveCurve;
            ctx.lineTo(x, curvedY);
          } else {
            ctx.lineTo(x, topClip);
          }
        }
        
        ctx.lineTo(0, topClip);
        ctx.closePath();
        ctx.clip();
      }

      ctx.fillStyle = BEAN_COLOR;

      // Main bean body (ellipse)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, beanWidth / 2, beanHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center wavy line (burgundy color)
      ctx.strokeStyle = "#3b0b0b";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const creaseHeight = beanHeight; // Full bean height
      const creaseY1 = centerY - beanHeight / 2; // Top of bean
      const creaseY2 = centerY + beanHeight / 2; // Bottom of bean
      
      // Draw smooth S-shaped wavy line like coffee bean icon
      const waveAmplitude = 10; // How wavy the line is
      const segments = 30; // Smooth curves
      
      ctx.moveTo(centerX, creaseY1);
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const y = creaseY1 + (creaseY2 - creaseY1) * t;
        
        // Create proper S-curve with two opposing arches
        const x = centerX + Math.sin(t * Math.PI * 2) * waveAmplitude;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.restore();
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      alpha: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speedY = Math.random() * 2 + 1.5;
        this.speedX = (Math.random() - 0.5) * 0.7;
        this.alpha = 1;
      }
      update(): boolean {
        this.y += this.speedY;
        this.x += this.speedX;
        this.speedY += 0.05;
        
        const centerX = canvas.width / 2;
        const distanceFromCenter = this.x - centerX;
        this.speedX -= distanceFromCenter * 0.02;
        this.speedX *= 0.95;
        
        if (this.y > canvas.height + 20) {
          return false;
        }
        return true;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = POWDER_COLOR;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    let animationStartTime: number | null = null;
    let disintegrationStarted = false;
    const DELAY = 500; // 0.5 seconds delay
    const DISINTEGRATION_DURATION = 3000; // Longer duration
    let lastParticleSpawn = 0;
    let rafId = 0;

    const animate = (timestamp: number) => {
      if (!animationStartTime) animationStartTime = timestamp;
      const elapsed = timestamp - animationStartTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (elapsed > DELAY && !disintegrationStarted) {
        disintegrationStarted = true;
      }

      const centerX = canvas.width / 2;
      const centerY = 200; // Fixed position near top instead of center
      const beanWidth = 120;
      const beanHeight = 140;

      let clipY: number | null = null;

      if (disintegrationStarted) {
        const disintegrationElapsed = elapsed - DELAY;
        const disintegrationProgress = Math.min(disintegrationElapsed / DISINTEGRATION_DURATION, 1);

        clipY = centerY + beanHeight / 2 - beanHeight * disintegrationProgress;

        if (disintegrationProgress < 1 && disintegrationProgress > 0.07 && timestamp - lastParticleSpawn > 12) { // 0.2 sec delay (0.07 of 3 sec)
          lastParticleSpawn = timestamp;
          
          // Spawn particles along the curved disintegration edge
          const spawnCount = 8;
          
          for (let i = 0; i < spawnCount; i++) {
            // Start with much narrower spawning area, gradually expand
            const narrowness = 1 - disintegrationProgress; // 1 at start, 0 at end
            const spawnWidth = beanWidth * (0.2 + 0.8 * disintegrationProgress); // Start at 20% width
            const randomX = (Math.random() - 0.5) * spawnWidth;
            const normalizedX = randomX / (beanWidth / 2);
            
            // Only spawn particles within bean boundaries - check both X and Y constraints
            if (Math.abs(normalizedX) <= 1) {
              // Calculate Y position on the curved disintegration edge
              const progress = (clipY - (centerY - beanHeight / 2)) / beanHeight;
              const curvedWidth = (beanWidth / 2) * Math.sqrt(1 - Math.pow(2 * progress - 1, 2));
              
              // Base curve calculation
              const baseCurve = Math.sqrt(1 - normalizedX * normalizedX) * curvedWidth * 0.6;
              const waveCurve = Math.sin(normalizedX * Math.PI * 3) * curvedWidth * 0.2;
              
              const xPos = centerX + randomX;
              const yPos = clipY + baseCurve + waveCurve;
              
              // Double-check particle is within bean's elliptical boundary
              const normalizedY = (yPos - centerY) / (beanHeight / 2);
              const isWithinBean = (normalizedX * normalizedX) + (normalizedY * normalizedY) <= 1;
              
              if (isWithinBean) {
                const particle = new Particle(xPos, yPos);
                // Particles fall more naturally from the curved edge
                particle.speedX = (Math.random() - 0.5) * 0.3;
                particle.speedY = Math.random() * 1.5 + 1; // Slower fall for more realistic effect
                particles.push(particle);
              }
            }
          }
        }
      }

      drawBean(clipY);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.update()) {
          particles.splice(i, 1);
        } else {
          p.draw(ctx);
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3b0b0b] transition-all duration-[1200ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
      style={{ 
        transform: isExiting ? 'translateY(-100vh)' : 'translateY(0)',
        transition: 'transform 1200ms cubic-bezier(0.25,0.46,0.45,0.94)'
      }}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#fcf4e4] blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-[#fcf4e4] blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

       {/* Main Loading Content */}
       <div className="relative z-10 text-center pt-[30vh]">
         {/* Logo/Title */}
         <div className="mb-20">
           <h1 className="text-6xl md:text-8xl font-black text-[#fcf4e4] font-dosis tracking-wider">
             <span className="block">THE</span>
             <span className="block">COFFEE</span>
             <span className="block">MANIFEST</span>
           </h1>
         </div>
         
         {/* Coffee Bean Disintegration Animation */}
         <div className="flex justify-center">
           <canvas 
             ref={canvasRef} 
             className="w-96"
             style={{ maxWidth: '400px', height: '450px', marginTop: '-150px' }}
           />
         </div>
       </div>
    </div>
  );
}
