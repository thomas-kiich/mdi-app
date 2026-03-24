import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TONES } from "@/lib/tones";
import frequencyData from "@/lib/frequencyData.json";

interface HarmonicSpectrumChartProps {
  toneDistribution: Record<string, number>;
  dominantToneId?: number;
  onToneClick?: (toneId: number) => void;
}

export function HarmonicSpectrumChart({ 
  toneDistribution, 
  dominantToneId,
  onToneClick
}: HarmonicSpectrumChartProps) {
  
  // Calculate percentage distribution for all 24 tones
  const totalEnergy = Object.values(toneDistribution).reduce((a, b) => a + b, 0);
  
  const spectrumData = frequencyData.map((tone) => {
    const energy = toneDistribution[tone.id.toString()] || 0;
    const percentage = totalEnergy > 0 ? (energy / totalEnergy) * 100 : 0;
    return {
      id: tone.id,
      colorName: tone.colorName,
      metaphor: tone.metaphor,
      hex: tone.hex,
      percentage,
      energy
    };
  });

  // Sort by percentage descending
  const sortedSpectrum = [...spectrumData].sort((a, b) => b.percentage - a.percentage);

  // Find max percentage for scaling
  const maxPercentage = Math.max(...sortedSpectrum.map(s => s.percentage), 1);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-orange-500 to-purple-500" />
          Harmonisches Spektrum
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-2">
          Prozentuale Verteilung aller 24 Töne in deiner Stimme (hierarchisch sortiert)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {sortedSpectrum.map((tone, index) => (
            <div 
              key={tone.id} 
              className="space-y-1 cursor-pointer hover:bg-zinc-800/30 p-2 rounded-lg transition-colors"
              onClick={() => onToneClick && onToneClick(tone.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">
                      TYP {tone.id}: {tone.metaphor}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {tone.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-zinc-500">
                    {tone.energy.toFixed(0)} dB
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="w-full bg-zinc-800/50 rounded-sm overflow-hidden h-6 border border-zinc-700/50">
                <div
                  className="h-full transition-all duration-500 ease-out rounded-sm relative"
                  style={{
                    width: `${(tone.percentage / maxPercentage) * 100}%`,
                    backgroundColor: tone.hex,
                    opacity: 0.8,
                    boxShadow: `inset 0 0 8px ${tone.hex}40`
                  }}
                >
                  {tone.percentage > 5 && (
                    <div className="absolute inset-0 flex items-center justify-end pr-2">
                      <span className="text-xs font-semibold text-white drop-shadow-md">
                        {tone.percentage.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-zinc-700/50 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Dominanter Ton
            </div>
            <div className="text-lg font-bold" style={{ color: sortedSpectrum[0]?.hex }}>
              TYP {sortedSpectrum[0]?.id}
            </div>
            <div className="text-xs text-zinc-400">
              {sortedSpectrum[0]?.percentage.toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Aktive Töne
            </div>
            <div className="text-lg font-bold text-white">
              {sortedSpectrum.filter(s => s.percentage > 0).length}
            </div>
            <div className="text-xs text-zinc-400">
              von 24
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Gesamt-Energie
            </div>
            <div className="text-lg font-bold text-orange-500">
              {totalEnergy.toFixed(0)}
            </div>
            <div className="text-xs text-zinc-400">
              dB
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
