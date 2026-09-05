import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 3000
}) => {
  const [isDismissing, setIsDismissing] = useState(false);

  const handleDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);
    // Smooth exit duration before unmounting callback
    setTimeout(() => {
      onFinish?.();
    }, 600);
  }, [isDismissing, onFinish]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, Math.max(durationMs - 600, 500));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [durationMs, handleDismiss]);

  return (
    <AnimatePresence>
      {!isDismissing && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.06,
            filter: 'blur(8px)',
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={handleDismiss}
          role="button"
          tabIndex={0}
          aria-label="RMVN Solutions Intro Splash Screen. Click or tap anywhere to skip."
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #0b132b 0%, #0a0f1d 55%, #030712 100%)'
          }}
        >
          {/* Subtle Tech Cybernetic Network Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(rgba(56, 189, 248, 0.3) 1px, transparent 1px), radial-gradient(rgba(14, 165, 233, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px, 20px 20px',
              backgroundPosition: '0 0, 10px 10px'
            }}
          />

          {/* Pulsing Network Ambient Light Aura Behind Logo */}
          <motion.div
            animate={{
              scale: [0.9, 1.18, 0.96],
              opacity: [0.35, 0.7, 0.4]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute w-[360px] sm:w-[580px] h-[220px] sm:h-[340px] rounded-full bg-blue-600/25 blur-[90px] pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 1.25, 1.05],
              opacity: [0.2, 0.55, 0.28]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2
            }}
            className="absolute w-[240px] sm:w-[380px] h-[140px] sm:h-[220px] rounded-full bg-cyan-400/25 blur-[60px] pointer-events-none"
          />

          {/* Central Logo Container with Netflix-style Zoom & Aura */}
          <div className="relative z-10 px-6 sm:px-12 flex flex-col items-center justify-center max-w-4xl w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, filter: 'blur(10px) brightness(1.25)' }}
              animate={{
                opacity: 1,
                scale: [0.88, 1, 1.06],
                filter: [
                  'blur(10px) brightness(1.25)',
                  'blur(0px) brightness(1)',
                  'blur(0px) brightness(1.08)'
                ]
              }}
              transition={{
                duration: 3,
                times: [0, 0.35, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative flex items-center justify-center overflow-hidden py-4"
            >
              {/* Clean Transparent RMVN Logo (White edition for dark cinematic contrast) */}
              <img
                src="/rmvn-logo-white.png"
                alt="RMVN Solutions - Network & Systems Architects"
                className="w-[84vw] max-w-[480px] sm:max-w-[580px] md:max-w-[640px] h-auto object-contain drop-shadow-[0_0_40px_rgba(26,98,184,0.5)] transition-transform"
                loading="eager"
              />

              {/* Cinematic Light Sweep / Shimmer Across Logo */}
              <motion.div
                initial={{ x: '-150%', opacity: 0 }}
                animate={{
                  x: '200%',
                  opacity: [0, 0.85, 0]
                }}
                transition={{
                  duration: 1.8,
                  delay: 0.7,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="absolute inset-y-0 w-36 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Bottom Tap Anywhere to Skip Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.6, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="absolute bottom-8 sm:bottom-12 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs text-[11px] font-mono tracking-[0.22em] text-slate-400 uppercase pointer-events-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Tap anywhere to skip</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
