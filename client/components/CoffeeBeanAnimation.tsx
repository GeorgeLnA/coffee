import React, { useEffect, useRef } from "react";

export default function CoffeeBeanAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(420, Math.min(720, Math.floor(window.innerHeight * 0.7)));
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Colors - minimalistic palette (white background per request)
    const BACKGROUND = "#ffffff";
    const BEAN_COLOR = "#3E2723";
    const POWDER_COLOR = "#5D4037";

    // Particles array
    const particles: Particle[] = [];

    // Draw smooth coffee bean shape
    const drawBean = (topClip: number | null) => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const beanWidth = 180; // total width in px
      const beanHeight = 200; // total height in px

      ctx.save();

      // Clip to show only portion above topClip (bottom-to-top disappearance)
      if (topClip !== null) {
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, topClip);
        ctx.clip();
      }

      ctx.fillStyle = BEAN_COLOR;

      // Main bean body (ellipse)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, beanWidth / 2, beanHeight / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center crease - straight line
      ctx.strokeStyle = "#5D4037";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      const creaseHeight = beanHeight * 0.7;
      const creaseY1 = centerY - creaseHeight / 2;
      const creaseY2 = centerY + creaseHeight / 2;
      
      // Draw straight center line
      ctx.moveTo(centerX, creaseY1);
      ctx.lineTo(centerX, creaseY2);
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
        
        // Strong funneling effect - particles drift toward center
        const centerX = canvas.width / 2;
        const distanceFromCenter = this.x - centerX;
        this.speedX -= distanceFromCenter * 0.02; // Much stronger inward pull
        
        // Dampen horizontal movement to keep stream tight
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
    const DELAY = 1000;
    const DISINTEGRATION_DURATION = 3000;
    let lastParticleSpawn = 0;
    let rafId = 0;

    const animate = (timestamp: number) => {
      if (!animationStartTime) animationStartTime = timestamp;
      const elapsed = timestamp - animationStartTime;

      // Clear canvas
      ctx.fillStyle = BACKGROUND;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Start disintegration after delay
      if (elapsed > DELAY && !disintegrationStarted) {
        disintegrationStarted = true;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const beanWidth = 180;
      const beanHeight = 200;

      let clipY: number | null = null;

      if (disintegrationStarted) {
        const disintegrationElapsed = elapsed - DELAY;
        const disintegrationProgress = Math.min(disintegrationElapsed / DISINTEGRATION_DURATION, 1);

        // Clip position from bottom to top
        clipY = centerY + beanHeight / 2 - beanHeight * disintegrationProgress;

        // Spawn particles that start wide and funnel down
        if (disintegrationProgress < 1 && timestamp - lastParticleSpawn > 12) {
          lastParticleSpawn = timestamp;
          const yPos = clipY;
          const normalizedY = (yPos - centerY) / (beanHeight / 2);
          if (Math.abs(normalizedY) <= 1) {
            // Start with full bean width, gradually narrow down
            const halfWidthAtY = (beanWidth / 2) * Math.sqrt(1 - normalizedY * normalizedY);
            const maxSpawnWidth = halfWidthAtY * 2;
            const spawnCount = 8;
            
            for (let i = 0; i < spawnCount; i++) {
              // Spawn across the full width of the bean at current height
              const xOffset = (Math.random() - 0.5) * maxSpawnWidth;
              const xPos = centerX + xOffset;
              
              // Add horizontal drift toward center as particles fall
              const particle = new Particle(xPos, yPos);
              // Start with minimal horizontal spread
              particle.speedX = (Math.random() - 0.5) * 0.2;
              particles.push(particle);
            }
          }
        }
      }

      // Draw bean (clipped)
      drawBean(clipY);

      // Draw particles above the mask
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

  return (
    <section className="relative py-24 md:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-0">
        <canvas ref={canvasRef} className="w-full h-[420px] md:h-[70vh] block" />
      </div>
    </section>
  );
}


