import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Music2, Play, CheckCircle2, ArrowRight, X } from "lucide-react";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('mdi_onboarding_completed');
    if (!hasSeenTour) {
      // Small delay to not overwhelm the user immediately
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem('mdi_onboarding_completed', 'true');
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const steps = [
    {
      title: "Willkommen bei METHODE 36",
      description: "Entdecke deine wahre Frequenz und bringe Körper & Geist in Einklang.",
      icon: <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
              <span className="text-3xl">👋</span>
            </div>,
      content: (
        <div className="text-center space-y-4">
          <p className="text-zinc-400">
            Schön, dass du da bist! Diese App hilft dir, deine energetische Signatur zu finden und zu harmonisieren.
          </p>
        </div>
      )
    },
    {
      title: "Schritt 1: Die Analyse",
      description: "Finde deinen Grundton.",
      icon: <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500">
              <Mic className="w-8 h-8" />
            </div>,
      content: (
        <div className="text-center space-y-4">
          <p className="text-zinc-400">
            Wir starten mit einer kurzen Stimm-Analyse. Sprich einfach natürlich – unser Algorithmus erkennt deine einzigartige Frequenz.
          </p>
        </div>
      )
    },
    {
      title: "Schritt 2: Das Training",
      description: "Harmonisiere dein System.",
      icon: <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6 text-green-500">
              <Music2 className="w-8 h-8" />
            </div>,
      content: (
        <div className="text-center space-y-4">
          <p className="text-zinc-400">
            Nach der Analyse kannst du dich mit geführten Tönungs-Sessions (7, 12 oder 21 Min) auf deine Frequenz einschwingen.
          </p>
        </div>
      )
    },
    {
      title: "Dein Begleiter",
      description: "Video-Einführung (Bald verfügbar)",
      icon: <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-purple-500">
              <Play className="w-8 h-8 ml-1" />
            </div>,
      content: (
        <div className="space-y-4">
          <div className="aspect-video bg-zinc-900 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-orange-500/10 opacity-50" />
            <div className="text-center p-6">
               <p className="text-sm text-zinc-500 mb-2">Hier erscheint bald dein persönliches Einführungsvideo.</p>
               <div className="inline-flex items-center gap-2 text-xs text-orange-500 border border-orange-500/30 px-3 py-1 rounded-full">
                 Coming Soon
               </div>
            </div>
          </div>
          <p className="text-zinc-400 text-center text-sm">
            In Kürze findest du hier ein Video, das dir die Methode 36 persönlich vorstellt.
          </p>
        </div>
      )
    }
  ];

  const currentStepData = steps[step - 1];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-900 w-full">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 to-purple-500 transition-all duration-300"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        <div className="p-8 flex flex-col items-center">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={handleComplete}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {currentStepData.icon}
          
          <h2 className="text-2xl font-bold text-center mb-2">{currentStepData.title}</h2>
          <p className="text-zinc-500 text-center mb-6 font-medium">{currentStepData.description}</p>
          
          {currentStepData.content}

          <div className="flex w-full gap-3 mt-8">
            {step > 1 && (
              <Button 
                variant="outline" 
                className="flex-1 border-zinc-800 hover:bg-zinc-900"
                onClick={() => setStep(step - 1)}
              >
                ZURÜCK
              </Button>
            )}
            <Button 
              className="flex-1 bg-white text-black hover:bg-zinc-200"
              onClick={handleNext}
            >
              {step === steps.length ? (
                <>
                  Los geht's <CheckCircle2 className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Weiter <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
          
          <div className="flex gap-1.5 mt-6">
            {steps.map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i + 1 === step ? 'bg-white' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
