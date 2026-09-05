"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface FloatingPathsBackgroundProps {
  position?: number;
  className?: string;
  children?: React.ReactNode;
  fixed?: boolean;
}

export const FloatingPathsBackground = React.memo(function FloatingPathsBackground({
  position = 1,
  children,
  className,
  fixed = false,
}: FloatingPathsBackgroundProps) {
  // Stable memoized paths array to prevent recalculating on every re-render / scroll
  const paths = useMemo(() => {
    return Array.from({ length: 36 }, (_, i) => ({
      id: i,
      d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
        380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
        152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
        684 - i * 5 * position
      } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
      width: 0.5 + i * 0.03,
      duration: 22 + ((i * 7) % 11),
      delay: (i * 0.25) % 3,
    }));
  }, [position]);

  return (
    <div
      className={cn("w-full relative bg-black text-white", className)}
      style={{
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
      }}
    >
      <div
        className={cn(
          fixed ? "fixed inset-0" : "absolute inset-0",
          "pointer-events-none overflow-hidden z-0"
        )}
        style={{
          transform: "translate3d(0, 0, 0)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          contain: "paint layout",
        }}
      >
        <svg
          className="w-full h-full text-white pointer-events-none"
          viewBox="0 0 696 316"
          fill="none"
          preserveAspectRatio="none"
          style={{
            transform: "translate3d(0, 0, 0)",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          {paths.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              stroke="white"
              strokeWidth={path.width}
              strokeOpacity={0.06 + path.id * 0.022}
              initial={{ pathLength: 0.3, opacity: 0.6 }}
              animate={{
                pathLength: 1,
                opacity: [0.25, 0.7, 0.25],
                pathOffset: [0, 1, 0],
              }}
              transition={{
                duration: path.duration,
                delay: path.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          ))}
        </svg>
      </div>
      {children && (
        <div className="relative z-10 w-full">
          {children}
        </div>
      )}
    </div>
  );
});

export default FloatingPathsBackground;
