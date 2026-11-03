'use client';

import React, { useEffect, useRef, useSyncExternalStore } from 'react';

const subscribeReducedMotion = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};

const getReducedMotionSnapshot = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getServerSnapshot = () => false;

export const AnimatedEcosystem3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerSnapshot
  );

  // Mouse offset states for smooth 3D parallax
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    // Skip interactive mouse parallax if user requested reduced motion or on mobile touch screen
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isReducedMotion || isTouch) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse from center of screen (-1 to 1)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      // Controlled tilt range: max ±7 deg Y, ±5 deg X
      mousePos.current.targetX = nx * 7;
      mousePos.current.targetY = -ny * 5;
    };

    const handleMouseLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    // Smooth physics lerp loop
    const updateMotion = () => {
      // Lerp damping factor 0.055 for silky, organic return
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.055;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.055;

      if (containerRef.current) {
        const { x, y } = mousePos.current;
        containerRef.current.style.setProperty('--mouse-rx', `${y.toFixed(2)}deg`);
        containerRef.current.style.setProperty('--mouse-ry', `${x.toFixed(2)}deg`);
        containerRef.current.style.setProperty('--mouse-tx', `${(x * 2.2).toFixed(1)}px`);
        containerRef.current.style.setProperty('--mouse-ty', `${(-y * 1.8).toFixed(1)}px`);
      }

      animFrameId.current = requestAnimationFrame(updateMotion);
    };

    animFrameId.current = requestAnimationFrame(updateMotion);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isReducedMotion]);

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 w-screen h-screen pointer-events-none overflow-hidden select-none z-0"
      style={{
        perspective: '1300px',
        perspectiveOrigin: '50% 50%'
      }}
    >
      {/* Ambient background depth base */}
      <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#080c14] transition-colors duration-200 -z-20" />
      
      {/* Subtle deep architectural grid */}
      <div className="absolute inset-0 bg-grid-subtle opacity-60 dark:opacity-35 transition-opacity duration-200 -z-10" />

      {/* Primary 3D Stage Container */}
      <div
        ref={containerRef}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[1050px] h-[790px] sm:w-[1320px] sm:h-[990px] lg:w-[1560px] lg:h-[1170px] xl:w-[1760px] xl:h-[1320px] opacity-100 animate-fade-in"
        style={{
          transformStyle: 'preserve-3d',
          transform: isReducedMotion
            ? 'translate(-50%, -50%) rotateX(8deg) rotateY(0deg)'
            : 'translate(-50%, -50%) rotateX(calc(7.5deg + var(--mouse-rx, 0deg))) rotateY(calc(-2deg + var(--mouse-ry, 0deg))) translate3d(var(--mouse-tx, 0px), var(--mouse-ty, 0px), 0px)',
          willChange: 'transform'
        }}
      >
        {/* Continuous Natural Floating Wrapper */}
        <div 
          className={`w-full h-full relative ${
            isReducedMotion ? '' : 'animate-ecosystem-float'
          }`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Main 3D Technology Ecosystem Image: Preserves the authentic black, metallic, white, and electric-lime details in both Light and Dark mode */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/ai-ecosystem-3d.png"
            alt=""
            className="w-full h-full object-contain filter drop-shadow-[0_16px_48px_rgba(0,0,0,0.16)] dark:drop-shadow-[0_24px_60px_rgba(0,0,0,0.85)] contrast-100 dark:contrast-105 opacity-90 dark:opacity-100 transition-all duration-300"
            loading="eager"
            decoding="async"
          />

          {/* LAYER: Central AI Processor Core Luminous Pulse (aligned over "ai.go" chip) */}
          <div 
            className="absolute left-[50%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 rounded-full pointer-events-none dark:mix-blend-screen"
            style={{ transform: 'translateZ(25px)' }}
          >
            {/* Core aura */}
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle,rgba(101,163,13,0.22)_0%,rgba(101,163,13,0.10)_40%,transparent_70%)] dark:bg-[radial-gradient(circle,rgba(163,230,53,0.42)_0%,rgba(132,204,22,0.22)_40%,transparent_70%)] animate-processor-pulse" />
            
            {/* Concentric high-tech electric lime focus ring */}
            <div className="absolute inset-4 rounded-full border border-lime-600/35 dark:border-lime-400/25 animate-ping opacity-25" style={{ animationDuration: '4s' }} />
          </div>

          {/* LAYER: Animated Light Conduits (connecting platforms to central core) */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible opacity-70"
            viewBox="0 0 1024 770"
            fill="none"
            style={{ transform: 'translateZ(15px)' }}
          >
            <defs>
              <linearGradient id="limeConduitGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a3e635" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#84cc16" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#facc15" stopOpacity="0.8" />
              </linearGradient>
              <filter id="conduitBlur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Pipeline: Central Core to Databases (Bottom-Left) */}
            <path
              d="M 430 455 L 390 510 L 460 565 L 440 600"
              stroke="url(#limeConduitGlow)"
              strokeWidth="3.5"
              strokeDasharray="16 120"
              strokeLinecap="round"
              filter="url(#conduitBlur)"
              className="animate-conduit-flow"
              style={{ animationDuration: '4.8s' }}
            />

            {/* Pipeline: Central Core to Chat Interface (Bottom-Right) */}
            <path
              d="M 570 475 L 700 550 L 730 568"
              stroke="url(#limeConduitGlow)"
              strokeWidth="3.5"
              strokeDasharray="16 110"
              strokeLinecap="round"
              filter="url(#conduitBlur)"
              className="animate-conduit-flow"
              style={{ animationDuration: '4.2s', animationDelay: '1.2s' }}
            />

            {/* Pipeline: Central Core to Archives (Top-Left) */}
            <path
              d="M 440 370 L 320 310 L 300 295"
              stroke="url(#limeConduitGlow)"
              strokeWidth="3.5"
              strokeDasharray="16 100"
              strokeLinecap="round"
              filter="url(#conduitBlur)"
              className="animate-conduit-flow"
              style={{ animationDuration: '5.2s', animationDelay: '2.1s' }}
            />

            {/* Pipeline: Central Core to Documents (Top-Right) */}
            <path
              d="M 580 375 L 670 300 L 690 280"
              stroke="url(#limeConduitGlow)"
              strokeWidth="3.5"
              strokeDasharray="16 110"
              strokeLinecap="round"
              filter="url(#conduitBlur)"
              className="animate-conduit-flow"
              style={{ animationDuration: '4.6s', animationDelay: '0.6s' }}
            />
          </svg>

          {/* LAYER: Pinging Data Indicators on Peripheral Hardware Modules */}
          
          {/* Databases Stack (Bottom-Left) */}
          <div 
            className="absolute left-[24%] top-[70%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ transform: 'translateZ(30px)' }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500/80 shadow-[0_0_8px_#a3e635]" />
            </span>
          </div>

          {/* Chat Interface Workstation (Bottom-Right) */}
          <div 
            className="absolute left-[76%] top-[68%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ transform: 'translateZ(30px)' }}
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" style={{ animationDelay: '1.4s' }} />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-lime-500/80 shadow-[0_0_8px_#a3e635]" />
            </span>
          </div>

          {/* Archives Module (Top-Left) */}
          <div 
            className="absolute left-[24%] top-[25%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ transform: 'translateZ(25px)' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" style={{ animationDelay: '0.8s' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400 shadow-[0_0_8px_#a3e635]" />
            </span>
          </div>

          {/* Documents Module (Top-Right) */}
          <div 
            className="absolute left-[77%] top-[24%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ transform: 'translateZ(25px)' }}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-beacon-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" style={{ animationDelay: '2.2s' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400 shadow-[0_0_8px_#a3e635]" />
            </span>
          </div>

        </div>
      </div>

      {/* Atmospheric Contrast Vignette Mask:
          Subtle neutral overlay in Light Mode so the authentic 3D hardware details, neon lime conduits, and server modules remain vivid and recognizable */}
      {/* Light Mode Vignette: Subtle and neutral, avoids heavy white wash */}
      <div 
        className="absolute inset-0 pointer-events-none dark:hidden transition-opacity duration-300"
        style={{
          background: 'radial-gradient(ellipse 85% 75% at 50% 45%, rgba(248, 250, 252, 0.08) 0%, rgba(248, 250, 252, 0.22) 55%, rgba(248, 250, 252, 0.50) 100%)'
        }}
      />
      {/* Dark Mode Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none hidden dark:block transition-opacity duration-300"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(8, 12, 20, 0.55) 0%, rgba(8, 12, 20, 0.30) 50%, rgba(8, 12, 20, 0.75) 100%)'
        }}
      />
    </div>
  );
};

