import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId } from '@/lib/mdiToToneMapping';
import { TONES } from '@/lib/tones';

interface ToneColorExplorerProps {
  mdiDistribution?: Record<string, number>;
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Helper function to convert HSL back to hex
function hslToHex(h: number, s: number, l: number): string {
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function ToneColorExplorer({ mdiDistribution }: ToneColorExplorerProps) {
  const [saturationValues, setSaturationValues] = useState<Record<number, number>>({});

  // Initialize saturation values for all 24 tones
  const initializeSaturation = () => {
    const init: Record<number, number> = {};
    for (let i = 1; i <= 24; i++) {
      init[i] = 100; // Default to 100% saturation
    }
    return init;
  };

  const satValues = useMemo(() => {
    if (Object.keys(saturationValues).length === 0) {
      return initializeSaturation();
    }
    return saturationValues;
  }, [saturationValues]);

  const handleSaturationChange = (mdiId: number, value: number[]) => {
    setSaturationValues(prev => ({
      ...prev,
      [mdiId]: value[0]
    }));
  };

  // Get saturation descriptions
  const getSaturationDescription = (saturation: number): { intense: string; delicate: string } => {
    if (saturation >= 90) {
      return {
        intense: "Intensiv & Kraftvoll",
        delicate: "Kräftig & Präsent"
      };
    } else if (saturation >= 70) {
      return {
        intense: "Lebendig & Präsent",
        delicate: "Harmonisch & Ausgewogen"
      };
    } else if (saturation >= 50) {
      return {
        intense: "Sanft & Ausgewogen",
        delicate: "Zart & Beruhigend"
      };
    } else if (saturation >= 30) {
      return {
        intense: "Subtil & Elegant",
        delicate: "Himmlisch & Zart"
      };
    } else {
      return {
        intense: "Hauch & Essenz",
        delicate: "Luft & Geist"
      };
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
          Farbsättigung erkunden
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-2">
          Jeder Ton trägt verschiedene Sättigungsgrade. Verschiebe den Regler, um die emotionale Qualität der Farbe zu erkunden.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-2">
          {frequencyData.map((tone) => {
            const mdiId = tone.id;
            const saturation = satValues[mdiId] || 100;
            const toneName = getToneNameFromMdiId(mdiId);
            const toneInfo = TONES.find(t => t.name === toneName);
            
            // Convert hex to HSL, modify saturation, convert back
            const hsl = hexToHsl(tone.hex);
            const modifiedHex = hslToHex(hsl.h, saturation, hsl.l);
            const description = getSaturationDescription(saturation);

            // Calculate energy from mdiDistribution if available
            const energy = mdiDistribution ? (mdiDistribution[mdiId.toString()] || 0) : 0;
            const hasEnergy = energy > 0;

            return (
              <div
                key={mdiId}
                className={`p-4 rounded-lg border transition-all ${
                  hasEnergy
                    ? 'border-white/30 bg-zinc-800/50'
                    : 'border-zinc-700/50 bg-zinc-900/30 opacity-60'
                }`}
              >
                {/* Tone Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      TYP {mdiId}: {tone.colorName}
                    </div>
                    {toneName && (
                      <div className="text-xs text-zinc-400 mt-1">
                        Ton: <span className="font-medium">{toneName}</span>
                      </div>
                    )}
                  </div>
                  {hasEnergy && (
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">Energie</div>
                      <div className="text-sm font-bold text-orange-400">
                        {energy.toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Preview */}
                <div className="flex gap-3 mb-4">
                  {/* Original Color */}
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                      100% Sättigung
                    </div>
                    <div
                      className="w-full h-16 rounded-lg border border-white/20 shadow-lg"
                      style={{ backgroundColor: tone.hex }}
                      title="Volle Sättigung"
                    />
                  </div>

                  {/* Modified Color */}
                  <div className="flex-1">
                    <div className="text-xs text-zinc-500 mb-1 uppercase tracking-wider">
                      {saturation}% Sättigung
                    </div>
                    <div
                      className="w-full h-16 rounded-lg border border-white/20 shadow-lg"
                      style={{ backgroundColor: modifiedHex }}
                      title={`${saturation}% Sättigung`}
                    />
                  </div>
                </div>

                {/* Saturation Slider */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase tracking-wider text-zinc-400">
                      Sättigung
                    </label>
                    <span className="text-sm font-bold text-white">{saturation}%</span>
                  </div>
                  <Slider
                    value={[saturation]}
                    onValueChange={(value) => handleSaturationChange(mdiId, value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Zart</span>
                    <span>Intensiv</span>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-black/30 rounded-lg p-3 border border-zinc-700/50">
                  <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                    Wirkung bei dieser Sättigung:
                  </div>
                  <div className="text-sm text-white font-medium">
                    {saturation >= 50 ? description.intense : description.delicate}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="mt-6 pt-6 border-t border-zinc-700/50 bg-zinc-900/30 rounded-lg p-4">
          <div className="text-xs text-zinc-400 uppercase tracking-wider mb-2">
            💡 Tipp für die Praxis
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Wähle für deine tägliche Praxis die Sättigung, die sich für deine aktuelle Lebenssituation richtig anfühlt. 
            Intensive Farben (80-100%) eignen sich für Aktivierung und Energie. Zarte Farben (20-50%) unterstützen Entspannung und innere Ruhe.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
