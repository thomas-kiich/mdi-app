import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToneData } from "@/lib/tones";
import { INTERPRETATIONS } from "@/lib/interpretations";
import { X, ArrowRight, Sparkles, Lock, Download } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from "react";

interface InterpretationViewProps {
  innerTone: ToneData;
  outerTone: ToneData;
  onClose: () => void;
}

export function InterpretationView({ innerTone, outerTone, onClose }: InterpretationViewProps) {
  const innerText = INTERPRETATIONS[innerTone.name];
  const outerText = INTERPRETATIONS[outerTone.name];
  const contentRef = useRef<HTMLDivElement>(null);

  if (!innerText || !outerText) return null;

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#09090b', // zinc-950
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`MDI-Analyse-${innerTone.name}-${outerTone.name}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

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
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              className="hidden md:flex gap-2 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
            >
              <Download className="w-4 h-4" />
              PDF Speichern
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-zinc-800 rounded-full">
              <X className="w-6 h-6 text-zinc-400" />
            </Button>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-6">
          <div ref={contentRef} className="bg-zinc-950 p-8 rounded-xl"> {/* Wrapper for PDF capture */}
            
            {/* PDF Header - Visible only in PDF ideally, but here part of layout */}
            <div className="mb-8 text-center border-b border-zinc-800 pb-8">
               <h1 className="text-3xl font-bold text-white mb-2">MDI SYSTEM</h1>
               <p className="text-zinc-500 uppercase tracking-widest text-sm">Persönliche Frequenz-Analyse</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 pb-8">
              {/* INNER FIELD */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg"
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
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {innerText.innerPower.heading}
                  </h4>
                  <p className="text-zinc-300 leading-relaxed">
                    {innerText.innerPower.text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {innerText.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-400">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* OUTER FIELD */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg ring-2 ring-white/20"
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
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Lock className="w-24 h-24 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {outerText.outerPotential.heading}
                  </h4>
                  <p className="text-zinc-300 leading-relaxed relative z-10">
                    {outerText.outerPotential.text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {outerText.keywords.map((k, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-400">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-8 text-center mt-4">
              <h4 className="text-orange-500 font-semibold mb-3 text-lg">Die Synthese</h4>
              <p className="text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                Die wahre Meisterschaft liegt in der Verbindung dieser beiden Pole. 
                Nutze die Kraft deines Innenfeldes ({innerTone.name}), um das Potenzial deines Außenfeldes ({outerTone.name}) zu erschließen.
              </p>
            </div>
            
            <div className="mt-12 text-center text-zinc-600 text-xs font-mono">
                MDI SYSTEM • Multidimensionales Identitätssystem • mdi-system.com
            </div>
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  );
}
