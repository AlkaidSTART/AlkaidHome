import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  opacity: number;
  twinkleSpeed: number;
  color: string;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  active: boolean;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Star[] = [];
    let shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      length: 0,
      speed: 0,
      angle: 0,
      active: false,
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const numStars = Math.floor((canvas.width * canvas.height) / 8000);
      const starColors = [
        '#ffffff',
        '#e0f2fe',
        '#f0f9ff',
        '#ccfbf1',
        '#fae8ff',
        '#e0e7ff',
      ];

      for (let i = 0; i < numStars; i++) {
        const baseOpacity = Math.random() * 0.5 + 0.1;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          baseOpacity,
          opacity: baseOpacity,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }
    };

    const triggerShootingStar = () => {
      if (shootingStar.active) return;
      
      const side = Math.random() > 0.5 ? 'top' : 'left';
      shootingStar = {
        x: side === 'top' ? Math.random() * canvas.width * 0.8 : 0,
        y: side === 'top' ? 0 : Math.random() * canvas.height * 0.5,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 8 + 6,
        angle: Math.PI / 6 + (Math.random() * Math.PI) / 12, // 30-45 degrees down-right
        active: true,
      };
    };

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw space nebula glow background (soft colorful gradients)
      const grad = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        10,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width * 0.8
      );
      grad.addColorStop(0, '#04020a');
      grad.addColorStop(0.5, '#010103');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle cyan-purple nebulae glows
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      
      // Purple glow top right
      const purpleGlow = ctx.createRadialGradient(
        canvas.width * 0.8,
        canvas.height * 0.2,
        0,
        canvas.width * 0.8,
        canvas.height * 0.2,
        canvas.width * 0.4
      );
      purpleGlow.addColorStop(0, 'rgba(88, 28, 135, 0.08)');
      purpleGlow.addColorStop(0.5, 'rgba(88, 28, 135, 0.03)');
      purpleGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = purpleGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blue-cyan glow bottom left
      const cyanGlow = ctx.createRadialGradient(
        canvas.width * 0.2,
        canvas.height * 0.8,
        0,
        canvas.width * 0.2,
        canvas.height * 0.8,
        canvas.width * 0.5
      );
      cyanGlow.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      cyanGlow.addColorStop(0.5, 'rgba(6, 182, 212, 0.015)');
      cyanGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = cyanGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.restore();

      // 2. Update and Draw Stars
      stars.forEach((star) => {
        // Simple sin-based twinkling
        star.opacity = star.baseOpacity + Math.sin(Date.now() * star.twinkleSpeed) * 0.15;
        // Clamp
        star.opacity = Math.max(0.05, Math.min(0.8, star.opacity));

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Update and Draw Shooting Star
      if (shootingStar.active) {
        const rad = shootingStar.angle;
        const dx = Math.cos(rad) * shootingStar.speed;
        const dy = Math.sin(rad) * shootingStar.speed;

        shootingStar.x += dx;
        shootingStar.y += dy;

        // Draw tail gradient
        ctx.save();
        ctx.globalAlpha = 0.8;
        const tailGrad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          shootingStar.x - Math.cos(rad) * shootingStar.length,
          shootingStar.y - Math.sin(rad) * shootingStar.length
        );
        tailGrad.addColorStop(0, '#ffffff');
        tailGrad.addColorStop(0.1, '#a5f3fc');
        tailGrad.addColorStop(1, 'rgba(165, 243, 252, 0)');
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(
          shootingStar.x - Math.cos(rad) * shootingStar.length,
          shootingStar.y - Math.sin(rad) * shootingStar.length
        );
        ctx.stroke();
        ctx.restore();

        // Check if out of bounds
        if (
          shootingStar.x > canvas.width ||
          shootingStar.y > canvas.height ||
          shootingStar.x < 0 ||
          shootingStar.y < 0
        ) {
          shootingStar.active = false;
        }
      } else {
        // Randomly spawn a shooting star (approx. every 10 seconds or 0.15% chance per frame)
        if (Math.random() < 0.0015) {
          triggerShootingStar();
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    updateAndDraw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
