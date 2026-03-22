import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, Share2, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import frequencyData from "@/lib/frequencyData.json";
import { SoundBody } from "./SoundBody";

interface CertificateViewProps {
  mdiResult: typeof frequencyData[0];
  toneDistribution: Record<string, number>;
  onClose: () => void;
}

export function CertificateView({ mdiResult, toneDistribution, onClose }: CertificateViewProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);

    try {
      // Wait for images/fonts to be ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#000000',
        useCORS: true,
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center vertically if it's shorter than A4, or crop/fit if longer
      const yPos = imgHeight < pdfHeight ? (pdfHeight - imgHeight) / 2 : 0;

      pdf.addImage(imgData, 'PNG', 0, yPos, imgWidth, imgHeight);
      pdf.save(`MDI-Zertifikat-${mdiResult.id}.pdf`);
      
    } catch (error) {
      console.error("Certificate generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto"
    >
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Toolbar */}
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <h2 className="text-2xl font-bold text-white">Dein MDI Zertifikat</h2>
          <div className="flex gap-3">
            <Button 
              onClick={handleDownloadPDF} 
              disabled={isGenerating}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              PDF Herunterladen
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-zinc-800">
              <X className="w-6 h-6 text-zinc-400" />
            </Button>
          </div>
        </div>
        
        {/* Back Button for better UX */}
        <div className="w-full max-w-[210mm] mb-4 flex justify-start px-4">
            <Button 
                variant="outline" 
                onClick={onClose}
                className="text-zinc-400 border-zinc-700 hover:text-white hover:bg-zinc-800"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Analyse
            </Button>
        </div>

        {/* Certificate Preview Area */}
        <div className="relative w-full max-w-[210mm] bg-zinc-900 rounded-lg shadow-2xl overflow-hidden border border-zinc-800">
          
          {/* This div is what gets captured */}
          <div 
            ref={certificateRef}
            className="w-full aspect-[1/1.4142] bg-black text-white p-[15mm] flex flex-col relative overflow-hidden"
            style={{ 
                backgroundImage: `radial-gradient(circle at 50% 30%, ${mdiResult.hex}15, transparent 70%)`
            }}
          >
            {/* Background Texture/Noise */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
                 style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
            />

            {/* Header */}
            <header className="flex justify-between items-start border-b border-white/10 pb-8 mb-8 relative z-10">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">MDI SYSTEM</h1>
                    <p className="text-zinc-400 text-sm uppercase tracking-[0.2em]">Multidimensionales Identitätssystem</p>
                </div>
                <div className="text-right">
                    <div className="text-sm text-zinc-500 mb-1">Datum der Analyse</div>
                    <div className="text-lg font-mono">{new Date().toLocaleDateString()}</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative z-10">
                
                {/* Result Identity */}
                <div className="flex items-center gap-12 mb-12">
                    {/* Color Circle */}
                    <div 
                        className="w-40 h-40 rounded-full flex items-center justify-center relative shrink-0"
                        style={{ 
                            backgroundColor: mdiResult.hex,
                            boxShadow: `0 0 60px ${mdiResult.hex}40`
                        }}
                    >
                        <div className="absolute inset-0 rounded-full border border-white/20" />
                        <span className="text-4xl font-bold drop-shadow-lg">{mdiResult.id}</span>
                    </div>

                    {/* Text Details */}
                    <div>
                        <div className="text-sm text-orange-500 uppercase tracking-widest mb-2 font-semibold">Deine Signatur</div>
                        <h2 className="text-6xl font-bold mb-4 leading-none">{mdiResult.colorName}</h2>
                        <div className="flex gap-8 text-lg text-zinc-300 font-mono">
                            <div>
                                <span className="text-zinc-500 text-xs block mb-1">FREQUENZ</span>
                                {mdiResult.frequency} Hz
                            </div>
                            <div>
                                <span className="text-zinc-500 text-xs block mb-1">TON</span>
                                {mdiResult.toneRange}
                            </div>
                            <div>
                                <span className="text-zinc-500 text-xs block mb-1">LICHT</span>
                                {mdiResult.lightRange}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aura Visualization Section */}
                <div className="flex-1 bg-zinc-900/30 rounded-2xl border border-white/5 p-8 mb-8 relative overflow-hidden">
                    <div className="absolute top-4 left-4 text-xs text-zinc-500 uppercase tracking-widest">Klang-Körper Resonanzfeld</div>
                    
                    {/* Render SoundBody in a constrained container tailored for PDF */}
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-[400px] h-[600px] pointer-events-none relative">
                            {/* Force SoundBody to be visible and static for capture */}
                            <SoundBody 
                                toneDistribution={toneDistribution} 
                                dominantToneName={mdiResult.toneRange}
                            />
                        </div>
                    </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-8">
                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-orange-500 text-xs uppercase tracking-widest mb-3 font-semibold">Detailbeschreibung</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {mdiResult.description}
                        </p>
                    </div>
                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-orange-500 text-xs uppercase tracking-widest mb-3 font-semibold">Talent & Potenzial</h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                            {mdiResult.talent}
                        </p>
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-white/10 flex justify-between items-center text-xs text-zinc-600 font-mono relative z-10">
                <div>ZERTIFIKAT-ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                <div>METHODE 36 • mdi-system.com</div>
            </footer>

          </div>
        </div>
      </div>
    </motion.div>
  );
}
