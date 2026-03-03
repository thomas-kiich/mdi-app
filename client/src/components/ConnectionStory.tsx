import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, SkipForward } from "lucide-react";

// Canvas component for the pointillism effect
const PointillismCanvas = ({ 
  act
}: { 
  act: number
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  
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
    
    // Create particles
    const particleCount = 2000;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        originX: Math.random() * canvas.width,
        originY: Math.random() * canvas.height,
        targetX: 0,
        targetY: 0,
        formationTarget: null, // Will be set in loop
        size: Math.random() * 2 + 0.5,
        color: 'white',
        alpha: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2,
        group: Math.random() > 0.5 ? 'A' : 'B' // A = Left/Blue, B = Right/Red
      });
    }
    
    particlesRef.current = particles;
    
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
    const rectWidth = 200;
    const rectHeight = 300;
    
    const animate = (time: number) => {
      // Clear with slight fade for trails? No, strict clear for pointillism
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      
      // Update and draw particles based on current ACT
      particles.forEach((p, i) => {
        // ACT 1: White Noise (The Source)
        if (act === 1) {
          p.targetX = p.originX;
          p.targetY = p.originY;
          p.color = `rgba(255, 255, 255, ${p.alpha})`;
          
          // Drift slightly
          p.x += Math.sin(time * 0.001 + p.phase) * 0.5;
          p.y += Math.cos(time * 0.001 + p.phase) * 0.5;
        }
        
        // ACT 2: Formation (The Human Shape)
        else if (act === 2) {
          // Target a rounded rectangle in the center
          if (!p.formationTarget) {
            p.formationTarget = {
              x: centerX + (Math.random() - 0.5) * rectWidth,
              y: centerY + (Math.random() - 0.5) * rectHeight
            };
          }
          p.targetX = p.formationTarget.x;
          p.targetY = p.formationTarget.y;
          p.color = `rgba(255, 255, 255, ${p.alpha * 1.5})`; // Brighter
        }
        
        // ACT 3: The Split (Polarity)
        else if (act === 3) {
          if (p.group === 'A') {
            // Left half goes Top-Left
            p.targetX = centerX - 150 + (Math.random() - 0.5) * 100;
            p.targetY = centerY - 150 + (Math.random() - 0.5) * 150;
            p.color = `rgba(0, 100, 255, ${p.alpha})`; // Blue
          } else {
            // Right half goes Bottom-Right
            p.targetX = centerX + 150 + (Math.random() - 0.5) * 100;
            p.targetY = centerY + 150 + (Math.random() - 0.5) * 150;
            p.color = `rgba(255, 50, 50, ${p.alpha})`; // Red
          }
        }
        
        // ACT 4: The Longing (Connection Waves)
        else if (act === 4) {
          if (p.group === 'A') {
            p.targetX = centerX - 150 + (Math.random() - 0.5) * 100;
            p.targetY = centerY - 150 + (Math.random() - 0.5) * 150;
            p.color = `rgba(0, 100, 255, ${p.alpha})`;
          } else {
            p.targetX = centerX + 150 + (Math.random() - 0.5) * 100;
            p.targetY = centerY + 150 + (Math.random() - 0.5) * 150;
            p.color = `rgba(255, 50, 50, ${p.alpha})`;
          }
          
          // Add vibration
          p.x += (Math.random() - 0.5) * 2;
          p.y += (Math.random() - 0.5) * 2;
        }
        
        // ACT 5: The Union (Fusion -> Magenta)
        else if (act === 5) {
          // Back to center
          if (!p.formationTarget) {
             p.formationTarget = {
              x: centerX + (Math.random() - 0.5) * rectWidth,
              y: centerY + (Math.random() - 0.5) * rectHeight
            };
          }
          p.targetX = p.formationTarget.x;
          p.targetY = p.formationTarget.y;
          
          // Color becomes Magenta (Red + Blue)
          p.color = `rgba(255, 0, 255, ${p.alpha})`; // Magenta
        }
        
        // Move particle towards target
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        p.x += dx * 0.05; // Ease in
        p.y += dy * 0.05;
        
        // Draw particle
        ctx.beginPath();
        ctx.fillStyle = p.color;
        
        // Add glow for Act 5
        if (act === 5) {
           ctx.shadowBlur = 5;
           ctx.shadowColor = "magenta";
        } else {
           ctx.shadowBlur = 0;
        }
        
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw Connection Waves in Act 4 (The Longing)
      if (act === 4) {
        ctx.shadowBlur = 5;
        ctx.shadowColor = "white";
        
        const waveCount = 8;
        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time * 0.003 + w) * 0.1})`;
          ctx.lineWidth = 1.5;
          
          const startX = centerX - 100; // From Blue Group
          const startY = centerY - 100;
          const endX = centerX + 100;   // To Red Group
          const endY = centerY + 100;
          
          ctx.moveTo(startX, startY);
          
          // Bezier curve for wave
          // Control points oscillate to create wave motion
          const cp1x = centerX - 50 + Math.sin(time * 0.005 + w) * 30;
          const cp1y = centerY + Math.cos(time * 0.005 + w) * 30;
          const cp2x = centerX + 50 + Math.sin(time * 0.005 + w + Math.PI) * 30;
          const cp2y = centerY + Math.cos(time * 0.005 + w + Math.PI) * 30;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
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

  // Auto-advance logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Act 1: Source (4s)
    if (act === 1) {
      timer = setTimeout(() => setAct(2), 4000);
    }
    // Act 2: Formation (4s)
    else if (act === 2) {
      timer = setTimeout(() => setAct(3), 4000);
    }
    // Act 3: Split (5s)
    else if (act === 3) {
      timer = setTimeout(() => setAct(4), 5000);
    }
    // Act 4: Longing (6s)
    else if (act === 4) {
      timer = setTimeout(() => setAct(5), 6000);
    }
    // Act 5: Union (Stays until closed)
    
    return () => clearTimeout(timer);
  }, [act]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden font-sans">
      
      {/* Canvas Layer */}
      <PointillismCanvas act={act} />
      
      {/* Text Overlay Layer */}
      <AnimatePresence mode="wait">
        {act === 1 && (
          <motion.div
            key="act1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="relative z-10 text-center max-w-2xl px-6 pointer-events-none"
          >
            <h2 className="text-4xl font-light text-white mb-4 tracking-[0.2em]">DAS SEINSFELD</h2>
            <p className="text-xl text-gray-400 font-light">
              Im weißen Rauschen sind alle Möglichkeiten enthalten.
            </p>
          </motion.div>
        )}

        {act === 2 && (
          <motion.div
            key="act2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center pointer-events-none"
          >
            <p className="text-2xl text-white/90 font-light tracking-wide">
              Das Bewusstsein verdichtet sich zur Form.
            </p>
          </motion.div>
        )}

        {act === 3 && (
          <motion.div
            key="act3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center pointer-events-none"
          >
            <h2 className="text-3xl font-light text-white mb-2 tracking-widest">POLARITÄT</h2>
            <p className="text-lg text-gray-300">
              Die Einheit zerfällt. <br/>
              Blau und Rot. Oben und Unten.
            </p>
          </motion.div>
        )}

        {act === 4 && (
          <motion.div
            key="act4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 text-center pointer-events-none"
          >
            <h2 className="text-3xl font-light text-white mb-2 tracking-widest">VERBINDUNG</h2>
            <p className="text-lg text-gray-300">
              In der Trennung entsteht Sehnsucht. <br/>
              Schwingungswellen suchen das Gegenüber.
            </p>
          </motion.div>
        )}

        {act === 5 && (
          <motion.div
            key="act5"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            className="relative z-10 text-center bg-black/60 backdrop-blur-md p-12 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(255,0,255,0.3)]"
          >
            <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 tracking-tighter">
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
                Zurück zur Analyse <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Button */}
      {act < 5 && (
        <Button 
          variant="ghost" 
          className="absolute top-8 right-8 text-white/30 hover:text-white hover:bg-white/10 z-50 uppercase tracking-widest text-xs"
          onClick={() => setAct(5)}
        >
          Überspringen <SkipForward className="ml-2 h-4 w-4" />
        </Button>
      )}
      
      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-50">
        {[1, 2, 3, 4, 5].map((step) => (
          <div 
            key={step}
            className={`h-1 rounded-full transition-all duration-700 ${
              step === act ? "w-12 bg-white shadow-[0_0_10px_white]" : "w-2 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function RotateCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" />
      <path d="M3 3v9h9" />
    </svg>
  )
}
