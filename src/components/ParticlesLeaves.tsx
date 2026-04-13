import React, { useEffect, useMemo, useState } from 'react';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export const ParticlesLeaves: React.FC = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setReady(true);
    });
  }, []);

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 18, density: { enable: true, width: 1200, height: 800 } },
        shape: {
          type: 'image',
          options: {
            image: [
              {
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%236ca252' d='M7 37c0-16 17-31 45-30-1 28-16 45-32 45C12 52 7 45 7 37Z'/%3E%3Cpath fill='none' stroke='%233f784a' stroke-width='2.4' stroke-linecap='round' d='M18 46c8-9 17-18 30-29M27 36c4 0 8-2 12-5'/%3E%3C/svg%3E",
                width: 64,
                height: 64,
              },
              {
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cpath fill='%238abf61' d='M56 27c0 15-16 30-43 30 1-27 16-43 32-43 8 0 11 6 11 13Z'/%3E%3Cpath fill='none' stroke='%234f8442' stroke-width='2.2' stroke-linecap='round' d='M46 18c-8 8-18 17-31 28M38 30c-5 1-9 3-13 6'/%3E%3C/svg%3E",
                width: 64,
                height: 64,
              },
            ],
          },
        },
        opacity: { value: { min: 0.28, max: 0.62 } },
        size: { value: { min: 9, max: 18 } },
        rotate: { value: { min: 0, max: 360 }, direction: 'random', animation: { enable: true, speed: 4 } },
        tilt: { value: { min: 0, max: 360 }, direction: 'random', enable: true, animation: { enable: true, speed: 2 } },
        move: {
          enable: true,
          speed: { min: 0.45, max: 1.05 },
          direction: 'bottom',
          drift: { min: -0.25, max: 0.25 },
          outModes: { default: 'out', top: 'out', bottom: 'out' },
          wobble: { enable: true, distance: 6, speed: { min: -2, max: 2 } },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'repulse' },
          onClick: { enable: true, mode: ['push', 'bubble'] },
          resize: { enable: true, delay: 0.2 },
        },
        modes: {
          repulse: { distance: 80, duration: 0.5 },
          push: { quantity: 2 },
          bubble: { distance: 120, duration: 1.1, opacity: 0.9, size: 18 },
        },
      },
      background: { color: 'transparent' },
    }),
    [],
  );

  if (!ready) return null;

  return <Particles id="leaf-particles" className="leaf-particles-layer" options={options} />;
};
