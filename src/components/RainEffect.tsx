import React, { useEffect, useRef } from 'react';

const RainEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Rain drop properties
    const maxDrops = 120;
    const drops: Array<{
      x: number;
      y: number;
      vy: number;
      vx: number;
      length: number;
      opacity: number;
    }> = [];

    let lastLightningTime = Date.now() - 15000; // First flash after 15 seconds
    let lightningStartTime = 0;

    // Initialize drops
    for (let i = 0; i < maxDrops; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        vy: 10 + Math.random() * 12, // vertical speed
        vx: -1.5 - Math.random() * 2, // slightly slanted to the left
        length: 15 + Math.random() * 20,
        opacity: 0.45 + Math.random() * 0.35,
      });
    }

    const draw = () => {
      const now = Date.now();
      if (now - lastLightningTime > 30000) {
        lastLightningTime = now;
        lightningStartTime = now;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw lightning flash if active
      if (lightningStartTime > 0) {
        const elapsed = now - lightningStartTime;
        if (elapsed < 800) {
          let alpha = 0;
          if (elapsed < 150) {
            alpha = (elapsed / 150) * 0.55;
          } else if (elapsed < 300) {
            alpha = 0.55 - ((elapsed - 150) / 150) * 0.45;
          } else if (elapsed < 450) {
            alpha = 0.1 + ((elapsed - 300) / 150) * 0.7;
          } else {
            alpha = 0.8 * (1 - (elapsed - 450) / 350);
          }
          if (alpha > 0.01) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, width, height);
          }
        }
      }

      for (let i = 0; i < maxDrops; i++) {
        const drop = drops[i];

        // Draw drop
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + drop.vx * 0.5, drop.y + drop.length);
        ctx.strokeStyle = `rgba(100, 149, 237, ${drop.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Update position
        drop.y += drop.vy;
        drop.x += drop.vx;

        // Reset drop to top if it goes off screen
        if (drop.y > height || drop.x < -20 || drop.x > width + 20) {
          drop.x = Math.random() * width;
          drop.y = -20 - Math.random() * 50;
          drop.vy = 10 + Math.random() * 12;
          drop.vx = -1.5 - Math.random() * 2;
          drop.length = 15 + Math.random() * 20;
          drop.opacity = 0.45 + Math.random() * 0.35;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default RainEffect;
