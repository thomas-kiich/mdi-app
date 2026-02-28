import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface FrequencyChartProps {
  distribution: Record<string, number>;
  stepDistributions?: {
    q1?: Record<string, number>;
    q2?: Record<string, number>;
    q3?: Record<string, number>;
  };
}

export function FrequencyChart({ distribution, stepDistributions }: FrequencyChartProps) {
  // Sort tones by musical order (C to B)
  const sortedTones = TONES.map(t => t.name);
  
  // Calculate max value for scaling
  const maxValue = Math.max(...Object.values(distribution), 1);

  // Helper to get bar height percentage
  const getHeight = (val: number) => {
    return Math.max((val / maxValue) * 100, 4); // Min height 4%
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 w-full">
      <CardHeader>
        <CardTitle className="text-zinc-400 text-sm font-medium tracking-wider">
          FREQUENZ-SPEKTRUM (GESAMT)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end justify-between gap-1 mt-4">
          {sortedTones.map((toneName) => {
            const value = distribution[toneName] || 0;
            const height = getHeight(value);
            const isDominant = value === maxValue;
            
            return (
              <div key={toneName} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500",
                      isDominant ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]" : "bg-zinc-800 group-hover:bg-zinc-700"
                    )}
                    style={{ height: `${height}%` }}
                  >
                    {value > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(value)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "text-xs font-medium",
                  isDominant ? "text-orange-500" : "text-zinc-500"
                )}>
                  {toneName}
                </div>
              </div>
            );
          })}
        </div>

        {stepDistributions && (
          <div className="grid grid-cols-3 gap-2 mt-8 pt-6 border-t border-zinc-800/50">
            {['Gegenwart', 'Vergangenheit', 'Zukunft'].map((label, idx) => {
              const stepKey = idx === 0 ? 'q1' : idx === 1 ? 'q2' : 'q3';
              const stepData = stepDistributions[stepKey as keyof typeof stepDistributions];
              
              if (!stepData) return null;

              // Find dominant tone for this step
              let domTone = "";
              let maxVal = 0;
              Object.entries(stepData).forEach(([t, v]) => {
                if (v > maxVal) {
                  maxVal = v;
                  domTone = t;
                }
              });

              return (
                <div key={label} className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">{label}</div>
                  <div className="text-lg font-bold text-zinc-300">{domTone || "-"}</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
