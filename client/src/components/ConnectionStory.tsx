import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw, X } from "lucide-react";

// Simplified MDI Body component for the story
const StoryBody = ({ color, position, scale = 1, opacity = 1 }: { color: string, position: { x: number, y: number }, scale?: number, opacity?: number }) => (
  <motion.div
    initial={position}
    animate={{ ...position, scale, opacity }}
    transition={{ duration: 2, ease: "easeInOut" }}
    className="absolute w-32 h-64 rounded-full blur-xl"
    style={{ backgroundColor: color }}
  />
);

export function ConnectionStory({ onClose }: { onClose: () => void }) {
  const [act, setAct] = useState<1 | 2 | 3 | 4>(1);

  // Auto-advance story
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (act < 4) {
      timer = setTimeout(() => {
        setAct(prev => (prev + 1) as any);
      }, 5000); // 5 seconds per act
    }
    return () => clearTimeout(timer);
  }, [act]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background - The Seinsfeld */}
      <motion.div 
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: act === 4 ? 1 : 0 }}
        transition={{ duration: 3 }}
      />
      
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-4xl h-[600px] flex items-center justify-center">
        
        {/* ACT 1: SEPARATION */}
        {act === 1 && (
          <>
            <StoryBody color="#FF0000" position={{ x: -150, y: 0 }} />
            <StoryBody color="#0000FF" position={{ x: 150, y: 0 }} />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute bottom-10 text-center text-white/70"
            >
              <h2 className="text-2xl font-light mb-2">Die Trennung</h2>
              <p>Zwei Felder. Zwei Sehnsüchte. Getrennt im Raum.</p>
            </motion.div>
          </>
        )}

        {/* ACT 2: ENCOUNTER */}
        {act === 2 && (
          <>
            <StoryBody color="#FF0000" position={{ x: -20, y: 0 }} scale={1.2} />
            <StoryBody color="#0000FF" position={{ x: 20, y: 0 }} scale={1.2} />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-purple-500/20 mix-blend-screen"
            />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute bottom-10 text-center text-white/90"
            >
              <h2 className="text-2xl font-light mb-2">Die Begegnung</h2>
              <p>Berührung. Ekstase. Die Farben mischen sich.</p>
            </motion.div>
          </>
        )}

        {/* ACT 3: LOSS */}
        {act === 3 && (
          <>
            <StoryBody color="#880000" position={{ x: -200, y: 0 }} scale={0.8} opacity={0.6} />
            <StoryBody color="#000088" position={{ x: 200, y: 0 }} scale={0.8} opacity={0.6} />
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="absolute bottom-10 text-center text-gray-400"
            >
              <h2 className="text-2xl font-light mb-2">Der Verlust</h2>
              <p>Die Distanz kehrt zurück. Die Farben verblassen.</p>
            </motion.div>
          </>
        )}

        {/* ACT 4: REALIZATION */}
        {act === 4 && (
          <>
            {/* Bodies become transparent outlines */}
            <motion.div 
              className="absolute w-32 h-64 rounded-full border-2 border-black/20"
              initial={{ x: -150, opacity: 0 }}
              animate={{ x: -150, opacity: 1 }}
            />
            <motion.div 
              className="absolute w-32 h-64 rounded-full border-2 border-black/20"
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 150, opacity: 1 }}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-10 text-center text-black"
            >
              <h2 className="text-3xl font-bold mb-4">Das Seinsfeld</h2>
              <p className="max-w-md mx-auto mb-8 text-lg text-black/70">
                Erkenne: Du bist nicht das getrennte Quadrat.<br/>
                Du bist der Bildschirm, auf dem alles erscheint.<br/>
                Du bist die Einheit.
              </p>
              <Button onClick={onClose} variant="outline" className="border-black text-black hover:bg-black hover:text-white">
                Zurück zur Analyse
              </Button>
            </motion.div>
          </>
        )}
      </div>

      {/* Skip Button */}
      {act < 4 && (
        <Button 
          variant="ghost" 
          className="absolute top-8 right-8 text-white/50 hover:text-white"
          onClick={() => setAct(4)}
        >
          Überspringen <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
