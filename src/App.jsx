import React from 'react';
import HeroSection from './components/HeroSection';
import CarbonCalculator from './components/CarbonCalculator';
import AirQualityMonitor from './components/AirQualityMonitor';
import ProgressTracker from './components/ProgressTracker';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroSection />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section id="calculator">
          <CarbonCalculator />
        </section>
        <section id="air-quality">
          <AirQualityMonitor />
        </section>
        <section id="progress">
          <ProgressTracker />
        </section>
      </main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/60">
        EcoTrack • Empowering sustainable choices • v1.0
      </footer>
    </div>
  );
}
