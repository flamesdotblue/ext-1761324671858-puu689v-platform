import React from 'react';
import Spline from '@splinetool/react-spline';
import { Leaf, LineChart, Car } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/M2rj0DQ6tP7dSzSz/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/80" />
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 rounded-full px-4 py-1 text-xs font-medium border border-emerald-400/20 mb-4">
            <Leaf className="w-4 h-4" />
            Track • Reduce • Thrive
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight">
            EcoTrack: Carbon Footprint Intelligence
          </h1>
          <p className="mt-4 text-white/80 text-base sm:text-lg">
            Measure your impact, get actionable insights, and move toward a sustainable future.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#calculator" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 text-black font-medium px-5 py-2.5 hover:bg-emerald-400 transition">
              <Car className="w-4 h-4" />
              Start Calculating
            </a>
            <a href="#progress" className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-5 py-2.5 hover:bg-white/5 transition">
              <LineChart className="w-4 h-4" />
              View Progress
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
