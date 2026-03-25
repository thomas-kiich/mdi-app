import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function GuidePendulum() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light tracking-wider">ANLEITUNG</h1>
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/')}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          ZUR HAUPTSEITE
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto w-full">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-white/90">Das Grundpendeln</h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Die Basisbewegung der Methode 36. 
            Eine starre Neigung aus dem Becken heraus, wie ein Metronom.
          </p>
        </div>

        <div className="relative w-full aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img 
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/method36-pendulum-motion_b096035b.webp"
            alt="Grundpendeln Animation"
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-sm text-white/50">
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <h3 className="text-white font-medium mb-2">1. Starre Achse</h3>
            <p>Die Wirbelsäule bleibt gerade. Keine Welle im Rücken. Die Bewegung kommt rein aus der Hüfte.</p>
          </div>
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <h3 className="text-white font-medium mb-2">2. Pendel-Ausschlag</h3>
            <p>Neige dich deutlich (ca. 45°) zur Seite. Spüre die Dehnung in der Flanke.</p>
          </div>
          <div className="p-4 border border-white/10 rounded-lg bg-white/5">
            <h3 className="text-white font-medium mb-2">3. Ruhe bewahren</h3>
            <p>Hände bleiben entspannt auf den Oberschenkeln. Füße fest am Boden.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
