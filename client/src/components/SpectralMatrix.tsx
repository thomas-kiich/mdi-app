import { useMemo } from 'react';
import { ToneColorExplorer } from './ToneColorExplorer';

interface SpectralMatrixProps {
  toneDistribution: Record<string, number>; // e.g. { "C": 10, "F": 30 ... }
}

export function SpectralMatrix({ toneDistribution }: SpectralMatrixProps) {
  // Convert tone names back to MDI IDs for the explorer
  const mdiDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    
    // Reverse mapping from tone names to IDs (1-24)
    // We'll just map the base 12 tones to their primary IDs for highlighting
    const toneToIdMap: Record<string, number> = {
      "C": 1,
      "Cis": 2,
      "D": 3,
      "Dis": 4,
      "E": 5,
      "F": 6,
      "Fis": 7,
      "G": 8,
      "Gis": 9,
      "A": 10,
      "Ais": 11,
      "H": 12
    };

    Object.entries(toneDistribution).forEach(([tone, value]) => {
      if (value > 0 && toneToIdMap[tone]) {
        dist[toneToIdMap[tone].toString()] = value;
      }
    });
    
    return dist;
  }, [toneDistribution]);

  return (
    <div className="mt-8">
      <ToneColorExplorer mdiDistribution={mdiDistribution} />
    </div>
  );
}
