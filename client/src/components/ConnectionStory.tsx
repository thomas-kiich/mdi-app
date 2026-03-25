import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward, RotateCcw } from "lucide-react";

// Canvas component for the pointillism effect
const PointillismCanvas = ({ 
  act
}: { 
  act: number
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const backgroundParticlesRef = useRef<any[]>([]);
  
  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    // Create BACKGROUND particles (The Eternal Field)
    const bgParticleCount = 800;
    const bgParticles = [];
    for (let i = 0; i < bgParticleCount; i++) {
      bgParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.05,
        speed: Math.random() * 0.02 + 0.01,
        phase: Math.random() * Math.PI * 2
      });
    }
    backgroundParticlesRef.current = bgParticles;

    // Create FORM particles (The Manifestation)
    const formParticleCount = 3000;
    const formParticles = [];
    
    for (let i = 0; i < formParticleCount; i++) {
      formParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        originX: Math.random() * canvas.width,
        originY: Math.random() * canvas.height,
        targetX: 0,
        targetY: 0,
        formationTarget: null,
        size: Math.random() * 2 + 0.5,
        color: 'white',
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2,
        group: 'unknown'
      });
    }
    
    particlesRef.current = formParticles;
    
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);
  
  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Rectangle dimensions for "Human Shape"
    const rectWidth = 220;
    const rectHeight = 340;
    
    const animate = (time: number) => {
      // Clear canvas
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 1. Draw Background Field (Eternal)
      const bgParticles = backgroundParticlesRef.current;
      ctx.fillStyle = 'white';
      
      bgParticles.forEach(p => {
        p.x += Math.sin(time * 0.0005 + p.phase) * 0.2;
        p.y += Math.cos(time * 0.0005 + p.phase) * 0.2;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 2. Draw Form Particles
      const particles = particlesRef.current;
      
      particles.forEach((p, i) => {
        // Set formation target if missing
        if (!p.formationTarget) {
           p.formationTarget = {
              x: centerX + (Math.random() - 0.5) * rectWidth,
              y: centerY + (Math.random() - 0.5) * rectHeight
           };
           
           // Geometric Split Logic: Diagonal Wave
           const relX = p.formationTarget.x - centerX;
           const relY = p.formationTarget.y - centerY;
           
           // Split line: y = x + wave
           const splitY = relX + 20 * Math.sin(relX * 0.04);
           
           if (relY < splitY) {
             p.group = 'A'; // Top-Left (Blue)
           } else {
             p.group = 'B'; // Bottom-Right (Red)
           }
        }

        // ACT 1: White Noise
        if (act === 1) {
          p.targetX = p.originX;
          p.targetY = p.originY;
          p.color = `rgba(255, 255, 255, ${p.alpha})`;
          p.x += Math.sin(time * 0.002 + p.phase) * 0.8;
          p.y += Math.cos(time * 0.002 + p.phase) * 0.8;
        }
        
        // ACT 2: Formation
        else if (act === 2) {
          p.targetX = p.formationTarget.x;
          p.targetY = p.formationTarget.y;
          p.color = `rgba(255, 255, 255, ${p.alpha + 0.2})`;
          p.targetX += (Math.random() - 0.5) * 2;
          p.targetY += (Math.random() - 0.5) * 2;
        }
        
        // ACT 3: The Split
        else if (act === 3) {
          const separationDistance = 180;
          if (p.group === 'A') {
            p.targetX = p.formationTarget.x - separationDistance;
            p.targetY = p.formationTarget.y - separationDistance * 0.6;
            p.color = `rgba(0, 100, 255, ${p.alpha})`;
          } else {
            p.targetX = p.formationTarget.x + separationDistance;
            p.targetY = p.formationTarget.y + separationDistance * 0.6;
            p.color = `rgba(255, 50, 50, ${p.alpha})`;
          }
        }
        
        // ACT 4: The Longing
        else if (act === 4) {
          const separationDistance = 180;
          if (p.group === 'A') {
            p.targetX = p.formationTarget.x - separationDistance;
            p.targetY = p.formationTarget.y - separationDistance * 0.6;
            p.color = `rgba(0, 100, 255, ${p.alpha})`;
          } else {
            p.targetX = p.formationTarget.x + separationDistance;
            p.targetY = p.formationTarget.y + separationDistance * 0.6;
            p.color = `rgba(255, 50, 50, ${p.alpha})`;
          }
          p.targetX += (Math.random() - 0.5) * 4;
          p.targetY += (Math.random() - 0.5) * 4;
        }
        
        // ACT 5: The Union
        else if (act === 5) {
          p.targetX = p.formationTarget.x;
          p.targetY = p.formationTarget.y;
          p.color = `rgba(255, 0, 255, ${p.alpha})`;
        }
        
        // Move particle towards target (Easing)
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * 0.03;
        p.y += dy * 0.03;
        
        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = p.color;
        if (act === 5) {
           ctx.shadowBlur = 8;
           ctx.shadowColor = "magenta";
        } else {
           ctx.shadowBlur = 0;
        }
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw Connection Waves in Act 4
      if (act === 4) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "white";
        const waveCount = 12;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          const opacity = 0.15 + Math.sin(time * 0.002 + w) * 0.1;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 1.5;
          
          const startX = centerX - 180; 
          const startY = centerY - 100;
          const endX = centerX + 180;   
          const endY = centerY + 100;
          
          const waveOffsetY = (w - waveCount/2) * 20;
          ctx.moveTo(startX, startY + waveOffsetY);
          
          const cp1x = centerX - 50 + Math.sin(time * 0.003 + w) * 60;
          const cp1y = centerY + Math.cos(time * 0.004 + w) * 60;
          const cp2x = centerX + 50 + Math.sin(time * 0.003 + w + Math.PI) * 60;
          const cp2y = centerY + Math.cos(time * 0.004 + w + Math.PI) * 60;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY + waveOffsetY);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [act]);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
};

export function ConnectionStory({ onClose }: { onClose: () => void }) {
  const [act, setAct] = useState<number>(1);

  // Auto-advance logic - SLOWER PACING
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Act 1: Source (8s)
    if (act === 1) {
      timer = setTimeout(() => setAct(2), 8000);
    }
    // Act 2: Formation (8s)
    else if (act === 2) {
      timer = setTimeout(() => setAct(3), 8000);
    }
    // Act 3: Split (10s)
    else if (act === 3) {
      timer = setTimeout(() => setAct(4), 10000);
    }
    // Act 4: Longing (10s)
    else if (act === 4) {
      timer = setTimeout(() => setAct(5), 10000);
    }
    
    return () => clearTimeout(timer);
  }, [act]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-sans">
      
      {/* Canvas Layer */}
      <PointillismCanvas act={act} />
      
      {/* Text Overlay Layer - MOVED TO BOTTOM */}
      <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center justify-end h-1/3 pb-8 pointer-events-none">
        <AnimatePresence mode="wait">
          {act === 1 && (
            <motion.div
              key="act1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 2 }}
              className="text-center max-w-2xl px-6"
            >
              <h2 className="text-3xl font-light text-white mb-4 tracking-[0.2em] uppercase">Das Seinsfeld</h2>
              <p className="text-lg text-gray-400 font-light leading-relaxed">
                Im weißen Rauschen sind alle Möglichkeiten enthalten. <br/>
                Der Urgrund des Bewusstseins.
              </p>
            </motion.div>
          )}

          {act === 2 && (
            <motion.div
              key="act2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="text-center max-w-2xl px-6"
            >
              <p className="text-2xl text-white/90 font-light tracking-wide leading-relaxed">
                Aus dem Feld verdichtet sich die Form. <br/>
                Identität entsteht.
              </p>
            </motion.div>
          )}

          {act === 3 && (
            <motion.div
              key="act3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="text-center max-w-2xl px-6"
            >
              <h2 className="text-3xl font-light text-white mb-2 tracking-widest uppercase">Polarität</h2>
              <p className="text-lg text-gray-300 font-light">
                Die Einheit zerfällt in zwei Teile. <br/>
                Blau und Rot. Oben und Unten. <br/>
                Wie Puzzleteile eines Ganzen.
              </p>
            </motion.div>
          )}

          {act === 4 && (
            <motion.div
              key="act4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="text-center max-w-2xl px-6"
            >
              <h2 className="text-3xl font-light text-white mb-2 tracking-widest uppercase">Verbindung</h2>
              <p className="text-lg text-gray-300 font-light">
                In der Trennung entsteht Sehnsucht. <br/>
                Schwingungswellen suchen das Gegenüber. <br/>
                Das Dazwischen wird spürbar.
              </p>
            </motion.div>
          )}

          {act === 5 && (
            <motion.div
              key="act5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2 }}
              className="text-center pointer-events-auto"
            >
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 tracking-tighter">
                MAGENTA
              </h2>
              <p className="text-xl text-white mb-8 max-w-lg mx-auto leading-relaxed font-light">
                Die Pole verschmelzen. <br/>
                Aus Zwei wird Eins. <br/>
                Das Leuchten der Ganzheit kehrt zurück.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => setAct(1)} 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Wiederholen
                </Button>
                <Button 
                  onClick={onClose} 
                  className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto font-medium"
                >
                  ZUR HAUPTSEITE <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute top-8 right-8 flex gap-3 z-50">
        {act < 5 && (
          <Button 
            variant="ghost" 
            className="text-white/20 hover:text-white hover:bg-white/10 uppercase tracking-widest text-xs"
            onClick={() => setAct(5)}
          >
            Überspringen <SkipForward className="ml-2 h-4 w-4" />
          </Button>
        )}
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
        >
          ZUR HAUPTSEITE
        </Button>
      </div>
      
      {/* Progress Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-50 opacity-30">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={`h-1 rounded-full transition-all duration-1000 ${
              step === act ? "w-12 bg-white" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
