"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-reactive holographic point-globe (Canvas 2D, no WebGL). Points sit on
 * a Fibonacci sphere, rotate continuously, and steer toward the pointer.
 * Depth drives size/opacity; a cobalt core glows behind. Capped point count +
 * DPR clamp + pause-when-offscreen keep it at 60fps. Reduced motion → a single
 * static frame (no animation loop).
 */
export default function HoloGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Fibonacci sphere
    const N = 850;
    const pts: { x: number; y: number; z: number }[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2;
      R = Math.min(w, h) * 0.34;
    };
    resize();
    window.addEventListener("resize", resize);

    let rotX = -0.3;
    let rotY = 0;
    let targetRX = -0.3;
    let targetRY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetRY = px * 1.4;
      targetRX = -0.3 + py * 1.0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const draw = (spin: number) => {
      ctx.clearRect(0, 0, w, h);

      // ambient core glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.8);
      glow.addColorStop(0, "rgba(43,92,255,0.35)");
      glow.addColorStop(0.5, "rgba(43,92,255,0.06)");
      glow.addColorStop(1, "rgba(43,92,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      rotY += (targetRY - rotY) * 0.05 + spin;
      rotX += (targetRX - rotX) * 0.05;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        // rotate Y
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        // rotate X
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;

        const depth = (z + 1) / 2; // 0 back .. 1 front
        const sx = cx + x * R;
        const sy = cy + y * R;
        const size = 0.6 + depth * 2.2;
        const alpha = 0.15 + depth * 0.8;
        // accent tint on the front-facing points
        ctx.beginPath();
        ctx.fillStyle =
          depth > 0.72
            ? `rgba(120,160,255,${alpha})`
            : `rgba(220,228,245,${alpha * 0.9})`;
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduce) {
      draw(0);
    } else {
      const loop = () => {
        draw(0.0016);
        raf = requestAnimationFrame(loop);
      };
      // pause when offscreen
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(loop);
          } else {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0.05 }
      );
      io.observe(canvas);
      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
      };
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}
