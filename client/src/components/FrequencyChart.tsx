import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import frequencyData from '@/lib/frequencyData.json';

interface FrequencyChartProps {
  distribution: Record<string, number>;
  mdiDistribution?: Record<string, number>;
  stepDistributions?: {
    q1?: Record<string, number>;
    q2?: Record<string, number>;
    q3?: Record<string, number>;
  };
}

export function FrequencyChart({ distribution, mdiDistribution, stepDistributions }: FrequencyChartProps) {
  // Determine which data to show
  const showMdi = !!mdiDistribution;
  
  // Prepare data for rendering
  let chartData: { label: string, value: number, color: string, isDominant: boolean }[] = [];
  let maxValue = 1;

  if (showMdi && mdiDistribution) {
      // Use MDI Data (1-24)
      maxValue = Math.max(...Object.values(mdiDistribution), 1);
      
      chartData = frequencyData.map(item => {
          const val = mdiDistribution[item.id.toString()] || 0;
          return {
              label: item.id.toString(),
              value: val,
              color: item.hex,
              isDominant: val === maxValue
          };
      });
  } else {
      // Fallback to Tones (C-B)
      maxValue = Math.max(...Object.values(distribution), 1);
      
      chartData = TONES.map(t => {
          const val = distribution[t.name] || 0;
          return {
              label: t.name,
              value: val,
              color: t.color, // Use tone color if available, or default
              isDominant: val === maxValue
          };
      });
  }

  // Helper to get bar height percentage
  const getHeight = (val: number) => {
    return Math.max((val / maxValue) * 100, 4); // Min height 4%
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 w-full">
      <CardHeader>
        <CardTitle className="text-zinc-400 text-sm font-medium tracking-wider">
          {showMdi ? "MDI-SPEKTRUM (1-24)" : "FREQUENZ-SPEKTRUM (GESAMT)"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-end justify-between gap-1 mt-4">
          {chartData.map((item) => {
            const height = getHeight(item.value);
            
            return (
              <div key={item.label} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="relative w-full flex items-end justify-center h-full">
                  <div 
                    className={cn(
                      "w-full rounded-t-sm transition-all duration-500",
                      item.isDominant ? "shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "opacity-80 group-hover:opacity-100"
                    )}
                    style={{ 
                        height: `${height}%`,
                        backgroundColor: item.color 
                    }}
                  >
                    {item.value > 0 && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(item.value)}%
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "text-[10px] font-medium truncate w-full text-center",
                  item.isDominant ? "text-white font-bold" : "text-zinc-600"
                )}>
                  {item.label}
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
