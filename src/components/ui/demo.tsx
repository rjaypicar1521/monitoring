import React from "react";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

export default function FloatingPathsBackgroundExample() {
  return (
    <FloatingPathsBackground
      className="aspect-16/9 flex items-center justify-center min-h-[300px]"
      position={-1}
    >
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold tracking-tight text-white">Floating Paths Background</h2>
        <p className="text-xs text-slate-400 mt-1">Black and white monochrome paths in motion</p>
      </div>
    </FloatingPathsBackground>
  );
}
