import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, Heart, Music2, TrendingUp, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { TONES } from "@/lib/tones";

interface PersonalizedDashboardProps {
  tone: string;
  frequency: number;
  onBack: () => void;
  onStartTraining: () => void;
}

export function PersonalizedDashboard({
  tone,
  frequency,
  onBack,
  onStartTraining,
}: PersonalizedDashboardProps) {
  const toneData = TONES.find(t => t.name === tone);

  if (!toneData) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Ton nicht gefunden</p>
        <Button onClick={onBack} className="mt-4">
          ZUR HAUPTSEITE
        </Button>
      </div>
    );
  }

  const recommendations = {
    training: `Für deinen Ton ${tone} empfehlen wir täglich 7-10 Minuten YOHN-Atmung zur Stabilisierung deiner Grundfrequenz.`,
    bodyArea: `Dein Ton aktiviert primär den Bereich: ${toneData.meaning}`,
    chakra: `Zugeordneter Planet/Zyklus: ${toneData.planet || "Kosmische Harmonie"}`,
    harmony: `Harmonische Intervalle: Alle Töne sind mit dir kompatibel`,
    timing: `Beste Trainingszeit: Morgens zwischen 6-8 Uhr für maximale Wirkung`,
  };

  const similarTones = TONES
    .filter(t => t.name !== tone)
    .slice(0, 3)
    .map(t => ({
      tone: t.name,
      frequency: t.frequency,
      color: t.color,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-6 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ZUR HAUPTSEITE
          </Button>
          <h1 className="text-3xl font-bold text-white">Dein Frequenz-Profil</h1>
          <div className="w-10" />
        </div>

        {/* Tone Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-5xl font-bold text-white mb-2">{tone}</h2>
                  <p className="text-zinc-400 text-lg">
                    Frequenz: {frequency.toFixed(2)} Hz
                  </p>
                </div>
                <div
                  className="w-32 h-32 rounded-full opacity-80"
                  style={{ backgroundColor: toneData.color }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Training Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 h-full hover:border-blue-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Trainingsempfehlung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 mb-4">{recommendations.training}</p>
                <Button
                  onClick={onStartTraining}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Training Starten
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Body Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 h-full hover:border-red-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="w-5 h-5 text-red-500" />
                  Körperliche Zuordnung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 mb-2">{recommendations.bodyArea}</p>
                <p className="text-zinc-400 text-sm">{recommendations.chakra}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Harmony */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 h-full hover:border-purple-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Music2 className="w-5 h-5 text-purple-500" />
                  Harmonische Intervalle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300">{recommendations.harmony}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800 h-full hover:border-green-500/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Optimale Trainingszeit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300">{recommendations.timing}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Similar Tones */}
        {similarTones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Zum Ausprobieren empfohlen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 mb-4">
                  Diese Töne harmonieren gut mit deinem Grundton:
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {similarTones.map((t) => (
                    <div
                      key={t.tone}
                      className="p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors text-center"
                    >
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-2"
                        style={{ backgroundColor: t.color }}
                      />
                      <p className="font-bold text-white">{t.tone}</p>
                      <p className="text-xs text-zinc-500">
                        {t.frequency.toFixed(0)} Hz
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
