import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToneData } from "@/lib/tones";
import { INTERPRETATIONS } from "@/lib/interpretations";
import { X, ArrowRight, Sparkles, Lock } from "lucide-react";
import { motion } from "framer-motion";

interface InterpretationViewProps {
  innerTone: ToneData;
  outerTone: ToneData;
  onClose: () => void;
}

export function InterpretationView({ innerTone, outerTone, onClose }: InterpretationViewProps) {
  const innerText = INTERPRETATIONS[innerTone.name];
  const outerText = INTERPRETATIONS[outerTone.name];

  if (!innerText || !outerText) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <Card className="w-full max-w-4xl max-h-[90vh] bg-zinc-950 border-zinc-800 shadow-2xl overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-6 bg-zinc-900/50">
          <div>
            <CardTitle className="text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Deine Analyse-Deutung
            </CardTitle>
            <p className="text-zinc-400 mt-1">
              Was dein Klangbild über deine aktuelle Lebensphase verrät.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800 rounded-full">
            <X className="w-6 h-6 text-zinc-400" />
          </Button>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="grid md:grid-cols-2 gap-8 pb-8">
            {/* INNER FIELD */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black shadow-lg"
                  style={{ backgroundColor: innerTone.color }}
                >
                  {innerTone.name}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Dein Innenfeld</h3>
                  <p className="text-zinc-400 text-sm">Deine vorhandene Ressource</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  {innerText.innerPower.heading}
                </h4>
                <p className="text-zinc-300 leading-relaxed">
                  {innerText.innerPower.text}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {innerText.keywords.map(k => (
                  <span key={k} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>

            {/* OUTER FIELD */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-black shadow-lg ring-2 ring-white/20"
                  style={{ backgroundColor: outerTone.color }}
                >
                  {outerTone.name}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Dein Außenfeld</h3>
                  <p className="text-zinc-400 text-sm">Dein Wachstumspotenzial</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Lock className="w-24 h-24 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  {outerText.outerPotential.heading}
                </h4>
                <p className="text-zinc-300 leading-relaxed relative z-10">
                  {outerText.outerPotential.text}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {outerText.keywords.map(k => (
                  <span key={k} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-400">
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 text-center">
            <h4 className="text-orange-500 font-semibold mb-2">Die Synthese</h4>
            <p className="text-zinc-300">
              Die wahre Meisterschaft liegt in der Verbindung dieser beiden Pole. 
              Nutze die Kraft deines Innenfeldes ({innerTone.name}), um das Potenzial deines Außenfeldes ({outerTone.name}) zu erschließen.
            </p>
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  );
}
