"use client";

interface ConfettiConfig {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  gravity?: number;
  drift?: number;
  ticks?: number;
  origin?: {
    x: number;
    y: number;
  };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  scalar?: number;
  zIndex?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'square' | 'circle';
  size: number;
  life: number;
  maxLife: number;
}

class ConfettiCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: ConfettiParticle[] = [];
  private animationId: number | null = null;
  private isAnimating = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire(config: ConfettiConfig = {}): void {
    if (this.isAnimating) return;

    const {
      particleCount = 50,
      spread = 70,
      startVelocity = 30,
      decay = 0.95,
      gravity = 1,
      drift = 0,
      ticks = 200,
      origin = { x: 0.5, y: 0.5 },
      colors = ['#00BCD4', '#7C4DFF', '#4CAF50', '#FF9800', '#F44336'],
      shapes = ['square', 'circle'],
      scalar = 1,
      zIndex = 1000,
    } = config;

    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.canvas.style.zIndex = zIndex.toString();
    this.particles = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = startVelocity * (0.5 + Math.random() * 0.5);
      const spreadAngle = (Math.PI * 2 * Math.random() - Math.PI) * (spread / 360);

      this.particles.push({
        x: origin.x * this.canvas.width,
        y: origin.y * this.canvas.height,
        vx: Math.cos(angle + spreadAngle) * velocity,
        vy: Math.sin(angle + spreadAngle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        size: (Math.random() * 3 + 2) * scalar,
        life: 0,
        maxLife: ticks,
      });
    }

    this.isAnimating = true;
    this.animate(decay, gravity, drift);
  }

  private animate(decay: number, gravity: number, drift: number): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.life++;

      if (particle.life >= particle.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += gravity;
      particle.vx += drift;

      // Apply decay
      particle.vx *= decay;
      particle.vy *= decay;

      // Draw particle
      this.ctx.save();
      this.ctx.globalAlpha = 1 - particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;

      if (particle.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
      }
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate(decay, gravity, drift));
    } else {
      this.isAnimating = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

let confettiCanvas: ConfettiCanvas | null = null;

export function createConfetti(config: ConfettiConfig = {}): void {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // Create canvas if it doesn't exist
  if (!confettiCanvas) {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    confettiCanvas = new ConfettiCanvas(canvas);
  }

  confettiCanvas.fire(config);
}

export function stopConfetti(): void {
  if (confettiCanvas) {
    confettiCanvas.stop();
  }
}

// React hook for confetti
export function useConfetti() {
  const fire = (config?: ConfettiConfig) => {
    if (typeof window !== 'undefined') {
      createConfetti(config);
    }
  };

  const stop = () => {
    if (typeof window !== 'undefined') {
      stopConfetti();
    }
  };

  return { fire, stop };
}
