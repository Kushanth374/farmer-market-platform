import React, { useEffect, useMemo, useState } from 'react';
import Particles from '@tsparticles/react';
import { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export const ParticlesBubbles: React.FC = () => {
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
        number: { value: 22, density: { enable: true, width: 1200, height: 800 } },
        color: { value: ['#dcfce7', '#bbf7d0', '#d9f99d'] },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.12, max: 0.34 } },
        size: { value: { min: 6, max: 18 } },
        move: {
          enable: true,
          speed: { min: 0.25, max: 0.9 },
          direction: 'top',
          random: true,
          outModes: { default: 'out', top: 'out' },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'bubble' },
          resize: { enable: true, delay: 0.2 },
        },
        modes: {
          bubble: { distance: 130, duration: 1.2, opacity: 0.42, size: 22 },
        },
      },
      background: { color: 'transparent' },
    }),
    [],
  );

  if (!ready) return null;
  return <Particles id="bubble-particles" className="bubble-particles-layer" options={options} />;
};
