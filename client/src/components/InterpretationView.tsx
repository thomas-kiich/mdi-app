import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import frequencyData from "@/lib/frequencyData.json";
import { X, ArrowRight, ArrowLeft, Sparkles, Lock, Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface InterpretationViewProps {
  mdiResult: typeof frequencyData[0];
  onClose: () => void;
}

export function InterpretationView({ mdiResult, onClose }: InterpretationViewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `Ich habe meine wahre Frequenz gefunden: Mein Grundton ist ${mdiResult.id} (${mdiResult.frequency} Hz). Entdecke auch du deine Frequenz mit Methode 36!`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Meine MDI Frequenz-Analyse',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for desktop: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast({
          title: "Ergebnis kopiert!",
          description: "Der Text wurde in deine Zwischenablage kopiert.",
        });
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  if (!mdiResult) return null;

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
      pdf.save(`MDI-Analyse-Typ-${mdiResult.id}.pdf`);
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
              Deine MDI-Analyse
            </CardTitle>
            <p className="text-zinc-400 mt-1">
              Dein Ergebnis im 24-stufigen Frequenzsystem.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="hidden md:flex gap-2 border-zinc-700 hover:bg-zinc-800 text-zinc-300 mr-2"
            >
              <Share2 className="w-4 h-4" />
              Teilen
            </Button>
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
          <div ref={contentRef} className="bg-zinc-950 p-8 rounded-xl min-h-[600px] flex flex-col items-center">
            
            {/* PDF Header */}
            <div className="mb-12 text-center border-b border-zinc-800 pb-8 w-full">
               <h1 className="text-3xl font-bold text-white mb-2">MDI SYSTEM</h1>
               <p className="text-zinc-500 uppercase tracking-widest text-sm">Persönliche Frequenz-Analyse</p>
            </div>

            {/* Main Result */}
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
                
                {/* Color Circle / Visual */}
                <div 
                    className="w-48 h-48 rounded-full shadow-[0_0_100px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center border-4 border-white/10"
                    style={{ 
                        backgroundColor: mdiResult.hex,
                        boxShadow: `0 0 80px ${mdiResult.hex}40`
                    }}
                >
                    <span className="text-4xl font-bold text-white drop-shadow-md">{mdiResult.id}</span>
                    <span className="text-sm text-white/80 mt-1">{mdiResult.frequency} Hz</span>
                    <span className="text-xs text-white/60 mt-1 font-mono">{mdiResult.toneRange}</span>
                </div>

                {/* Title & Color Name */}
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-bold text-white">{mdiResult.tone} - {mdiResult.colorName}</h2>
                    <p className="text-2xl font-bold drop-shadow-md" style={{ color: mdiResult.hex }}>
                        {mdiResult.metaphor}
                    </p>
                    <div className="flex items-center justify-center gap-4 text-zinc-400 text-sm mt-2">
                        <span className="font-mono">Licht: {mdiResult.lightRange}</span>
                        <span>•</span>
                        <span className="font-mono">Ton: {mdiResult.toneRange}</span>
                    </div>
                </div>

                {/* Description Box */}
                <div className="bg-zinc-900/50 rounded-xl p-8 border border-zinc-800 w-full mt-4 space-y-8">
                    <div>
                        <h4 className="text-zinc-500 font-semibold mb-3 uppercase text-xs tracking-wider border-b border-zinc-800 pb-2">Bedeutung & Wirkung</h4>
                        <p className="text-zinc-200 leading-relaxed text-lg">
                            {mdiResult.description}
                        </p>
                    </div>
                    
                    <div>
                        <h4 className="text-zinc-500 font-semibold mb-3 uppercase text-xs tracking-wider border-b border-zinc-800 pb-2">Assoziationen & Synonyme</h4>
                        <div className="flex flex-wrap gap-2">
                            {mdiResult.talent.split('|').map((word, i) => (
                                <span key={i} className="bg-zinc-800/50 text-zinc-300 px-4 py-2 rounded-full text-sm border border-zinc-700/50">
                                    {word.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
            
            <div className="mt-12 flex justify-center w-full">
                <div className="flex gap-4">
                    <Button 
                        size="lg" 
                        onClick={handleShare}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Teilen
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={onClose}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Zurück zur Übersicht
                    </Button>
                </div>
            </div>
            
            <div className="mt-auto pt-16 text-center text-zinc-600 text-xs font-mono w-full">
                MDI SYSTEM • Multidimensionales Identitätssystem • mdi-system.com
            </div>
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  );
}
