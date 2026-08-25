'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';

const PARTICLES_COUNT = 40;

function generateParticles() {
  return Array.from({ length: PARTICLES_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1.5,
    opacity: Math.random() * 0.6 + 0.3,
  }));
}

export default function CarbonLoadingScreen() {
  const t = useTranslations('loading');
  const [stageIndex, setStageIndex] = useState(0);
  const [particles] = useState(generateParticles);
  const stages = t.raw('stages') as string[];

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % stages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [stages.length]);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `rgba(16, 185, 129, ${p.opacity})`,
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, 0],
              y: [0, -30 - Math.random() * 40, -60 - Math.random() * 40, -100],
              opacity: [p.opacity, p.opacity * 1.5, p.opacity * 0.8, 0],
              scale: [1, 1.5, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main animation: Orbital rings */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(16,185,129,0.2)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Rotating dashed ring */}
        <motion.div
          className="absolute"
          style={{
            width: '130px',
            height: '130px',
            border: '2px dashed rgba(16,185,129,0.4)',
            borderRadius: '50%',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Counter-rotating ring */}
        <motion.div
          className="absolute"
          style={{
            width: '100px',
            height: '100px',
            border: '1.5px solid rgba(52, 211, 153, 0.3)',
            borderRadius: '50%',
            borderTopColor: '#10B981',
            borderRightColor: 'transparent',
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />

        {/* Inner glowing orb */}
        <motion.div
          style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #34D399, #059669)',
            boxShadow: '0 0 30px rgba(16,185,129,0.6), 0 0 60px rgba(16,185,129,0.3)',
          }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2)',
              '0 0 40px rgba(16,185,129,0.8), 0 0 80px rgba(16,185,129,0.4)',
              '0 0 20px rgba(16,185,129,0.5), 0 0 40px rgba(16,185,129,0.2)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* CO2 icon */}
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white font-bold text-xs font-mono tracking-tight select-none">
              CO₂
            </span>
          </div>
        </motion.div>

        {/* Orbiting data dots */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: i % 2 === 0 ? '#10B981' : '#34D399',
              boxShadow: '0 0 6px rgba(16,185,129,0.8)',
            }}
            animate={{
              rotate: [angle, angle + 360],
              x: Math.cos((angle * Math.PI) / 180) * 58,
              y: Math.sin((angle * Math.PI) / 180) * 58,
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.1,
              },
            }}
          />
        ))}
      </div>

      {/* Title */}
      <motion.h2
        className="mt-10 text-xl font-bold text-white text-center"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {t('title')}
      </motion.h2>

      {/* Stage text cycling */}
      <div className="mt-4 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-sm text-[#34D399] font-mono text-center"
          >
            {stages[stageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="mt-6 w-64">
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(16,185,129,0.12)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #10B981, #34D399, #10B981)',
              backgroundSize: '200% 100%',
            }}
            animate={{
              width: ['0%', '40%', '70%', '85%', '95%'],
              backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
            }}
            transition={{
              width: {
                duration: 11,
                ease: [0.1, 0.4, 0.8, 1],
                times: [0, 0.2, 0.5, 0.75, 1],
              },
              backgroundPosition: {
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              },
            }}
          />
        </div>
      </div>

      {/* Data stream lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[15, 35, 55, 75, 92].map((left, i) => (
          <motion.div
            key={i}
            className="absolute w-px"
            style={{
              left: `${left}%`,
              background: `linear-gradient(180deg, transparent, rgba(16,185,129,${0.1 + i * 0.05}), transparent)`,
              top: 0,
              height: '100%',
            }}
            animate={{
              opacity: [0, 0.6, 0],
              scaleY: [0, 1, 0],
              originY: 0,
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
