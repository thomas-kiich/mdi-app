import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Mic, Save, Activity, Info } from 'lucide-react';

export default function Erklaerung() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-orange-500/30">
      <div className="max-w-3xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            ZUR HAUPTSEITE
          </Link>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white">
            Deine Reise zur <span className="text-orange-500">wahren Frequenz</span>
          </h1>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Das MDI-System ermittelt deine einzigartige Identität aus Licht & Klang nicht durch eine Momentaufnahme, sondern durch eine präzise Längsschnittstudie über 5 Tage.
          </p>
        </header>

        {/* Steps */}
        <div className="grid gap-8 md:gap-12">
          
          {/* Step 1 */}
          <div className="relative pl-8 md:pl-0">
            <div className="hidden md:flex absolute -left-4 top-0 bottom-0 w-px bg-zinc-800" />
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 z-10 relative">
                  <Mic className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-white">1. Tägliche Messung</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Führe einmal täglich eine vollständige Analyse durch. Diese besteht aus zwei Teilen:
                </p>
                <ul className="list-disc list-inside text-zinc-400 space-y-1 ml-2">
                  <li><strong className="text-zinc-300">Innenfeld:</strong> Deine innere Stimme (Summen).</li>
                  <li><strong className="text-zinc-300">Außenfeld:</strong> Deine Sprechstimme (Zählen).</li>
                </ul>
                <p className="text-zinc-500 text-sm mt-2">
                  Tipp: Versuche, entspannt und natürlich zu sein. Die Tageszeit spielt keine Rolle.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 md:pl-0">
            <div className="hidden md:flex absolute -left-4 top-0 bottom-0 w-px bg-zinc-800" />
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 z-10 relative">
                  <Save className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-white">2. Ergebnis speichern</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Nach jeder Analyse siehst du dein Tagesergebnis. Klicke unten auf den Button <strong className="text-white border border-zinc-700 px-2 py-0.5 rounded text-sm bg-zinc-900">In Längsschnittstudie speichern</strong>.
                </p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg mt-2">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-zinc-400">
                      Das System erkennt automatisch den Tag (1/5, 2/5, etc.). Du musst nichts manuell einstellen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 md:pl-0">
             {/* No vertical line for last item */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-shrink-0 relative">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-orange-500/50 flex items-center justify-center text-orange-500 z-10 relative shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-medium text-white">3. Dein wahres MDI-Ergebnis</h3>
                <p className="text-zinc-400 leading-relaxed">
                  Nach 5 gespeicherten Tagen berechnet das System deine Identität.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                    <span>Die 2 extremsten Werte (Ausreißer) werden gestrichen.</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Der Mittelwert der 3 besten Tage bildet dein Ergebnis.</span>
                  </div>
                </div>
                <p className="text-zinc-400 mt-4">
                  Du erhältst eine Zuordnung zu einem der <strong className="text-white">24 MDI-Frequenztypen</strong> mit detaillierter Beschreibung deiner Talente und Wirkungen.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="pt-12 border-t border-zinc-800">
          <Link href="/">
            <button className="w-full md:w-auto px-8 py-4 bg-white text-black font-medium tracking-wide hover:bg-zinc-200 transition-colors rounded-sm">
              JETZT ANALYSE STARTEN
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
