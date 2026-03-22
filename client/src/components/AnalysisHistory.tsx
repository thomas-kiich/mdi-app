import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Activity, Trash2 } from "lucide-react";
import { useLongitudinalStudy, DailyResult } from "@/hooks/useLongitudinalStudy";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId } from '@/lib/mdiToToneMapping';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export function AnalysisHistory() {
  const { history } = useLongitudinalStudy();
  const [localHistory, setLocalHistory] = useState<DailyResult[]>([]);

  useEffect(() => {
    // We get history from the hook, but we also want to be able to delete items locally
    // The hook doesn't currently expose a delete method, so we manage state here for display
    setLocalHistory([...history].reverse()); // Show newest first
  }, [history]);

  if (localHistory.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Activity className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Noch keine Analysen</h3>
          <p className="text-sm text-zinc-500 max-w-md">
            Du hast noch keine Stimmklang-Analysen durchgeführt. Starte deine erste Messung auf dem Dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" />
          Meine Analysen Historie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localHistory.map((entry, index) => {
            // Find dominant MDI type for this entry
            let maxScore = 0;
            let dominantMdiId = "";
            
            if (entry.result.mdiDistribution) {
              for (const [id, score] of Object.entries(entry.result.mdiDistribution)) {
                if (score > maxScore) {
                  maxScore = score;
                  dominantMdiId = id;
                }
              }
            }

            const mdi = dominantMdiId ? frequencyData.find(f => f.id === parseInt(dominantMdiId)) : null;
            const date = new Date(entry.date);

            return (
              <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                
                {/* Date & Basic Info */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="bg-zinc-900 rounded-lg p-3 text-center min-w-[80px]">
                    <div className="text-xs text-zinc-500 uppercase">{format(date, 'MMM', { locale: de })}</div>
                    <div className="text-xl font-bold text-white">{format(date, 'dd')}</div>
                    <div className="text-[10px] text-zinc-600">{format(date, 'yyyy')}</div>
                  </div>
                  
                  {mdi ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: mdi.hex }}
                        />
                        <span className="text-sm font-bold text-white">{mdi.colorName}</span>
                      </div>
                      <div className="text-xs text-zinc-400">
                        Typ {mdi.id} • {getToneNameFromMdiId(mdi.id.toString())} • {entry.result.fundamentalFreq.toFixed(1)} Hz
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-500">Unvollständige Daten</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-zinc-700 hover:bg-zinc-800 text-xs"
                    onClick={() => {
                      // Note: Re-generating the full certificate requires rendering the CertificateView.
                      // For a simple history, we might just show an alert or a simplified view.
                      // Since we can't easily re-render the whole complex Home state here without refactoring,
                      // we'll guide the user to the current result if it's the latest.
                      alert("Diese Funktion (Zertifikat aus Historie herunterladen) wird in einem kommenden Update verfügbar sein. Bitte nutze vorerst den Download-Button direkt nach deiner Messung.");
                    }}
                  >
                    <Download className="w-3 h-3 mr-2" /> Info
                  </Button>
                </div>

              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
