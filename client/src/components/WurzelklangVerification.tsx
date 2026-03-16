import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Square, Volume2, VolumeX } from 'lucide-react';
import { getToneFromFrequency, TONES } from '@/lib/tones';
import frequencyData from '@/lib/frequencyData.json';

interface WurzelklangVerificationProps {
  analyzedToneId: number;
  onClose: () => void;
  onVerificationComplete: (isValid: boolean) => void;
}

export function WurzelklangVerification({ analyzedToneId, onClose, onVerificationComplete }: WurzelklangVerificationProps) {
  const [step, setStep] = useState<'info' | 'training' | 'feedback'>('info');
  const [attemptCount, setAttemptCount] = useState(0);
  const [attemptResults, setAttemptResults] = useState<Array<{ attempt: number; result: 'correct' | 'too_high' | 'too_low' }>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentAttemptResult, setCurrentAttemptResult] = useState<'correct' | 'too_high' | 'too_low' | null>(null);
  const [isPlayingGlissando, setIsPlayingGlissando] = useState(false);
  const [glissandoTime, setGlissandoTime] = useState(0);
  const [glissandoDuration, setGlissandoDuration] = useState(8);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const glissandoAudioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate Wurzelklang (Lebensklang + 10 in the 24-tone scale)
  const wurzelklangToneId = ((analyzedToneId - 1 + 10) % 24) + 1;
  const wurzelklangTone = frequencyData.find(t => t.id === wurzelklangToneId);
  const lebensklangTone = frequencyData.find(t => t.id === analyzedToneId);

  if (!wurzelklangTone || !lebensklangTone) {
    return null;
  }

  // Glissando audio URL mapping
  const glissandoUrls: Record<number, string> = {
    1: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone01_to_wurzelklang11_1298609c.wav',
    2: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone02_to_wurzelklang12_b7eb5d27.wav',
    3: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone03_to_wurzelklang13_df2b47c0.wav',
    4: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone04_to_wurzelklang14_ff500178.wav',
    5: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone05_to_wurzelklang15_a40202ca.wav',
    6: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone06_to_wurzelklang16_4dc80f8d.wav',
    7: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone07_to_wurzelklang17_4d2e3553.wav',
    8: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone08_to_wurzelklang18_b0454bda.wav',
    9: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone09_to_wurzelklang19_3562a40c.wav',
    10: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone10_to_wurzelklang20_90c31bac.wav',
    11: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone11_to_wurzelklang21_83c43a9f.wav',
    12: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone12_to_wurzelklang22_caf23a44.wav',
    13: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone13_to_wurzelklang23_53e755a0.wav',
    14: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone14_to_wurzelklang24_bb49b47a.wav',
    15: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone15_to_wurzelklang01_be704f49.wav',
    16: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone16_to_wurzelklang02_59bcd6dc.wav',
    17: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone17_to_wurzelklang03_650ea32e.wav',
    18: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone18_to_wurzelklang04_620d5a1f.wav',
    19: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone19_to_wurzelklang05_1baf5ef1.wav',
    20: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone20_to_wurzelklang06_af87436d.wav',
    21: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone21_to_wurzelklang07_ee235c61.wav',
    22: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone22_to_wurzelklang08_3aaeafab.wav',
    23: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone23_to_wurzelklang09_51909a34.wav',
    24: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/glissando_tone24_to_wurzelklang10_bd8af334.wav'
  };

  const glissandoUrl = glissandoUrls[analyzedToneId];

  // Get frequency range for Wurzelklang (frequency field)
  const wurzelklangFreqMin = wurzelklangTone.frequency * 0.97; // ±3% tolerance
  const wurzelklangFreqMax = wurzelklangTone.frequency * 1.03;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyzer = audioContext.createAnalyser();
      analyzerRef.current = analyzer;
      analyzer.fftSize = 4096;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyzer);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      let recordedChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => recordedChunks.push(e.data);
      mediaRecorder.onstop = async () => {
        // Analyze the recorded frequency
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray);

        // Find dominant frequency
        let maxValue = 0;
        let maxIndex = 0;
        for (let i = 0; i < dataArray.length; i++) {
          if (dataArray[i] > maxValue) {
            maxValue = dataArray[i];
            maxIndex = i;
          }
        }

        const nyquist = audioContext.sampleRate / 2;
        const detectedFreq = (maxIndex * nyquist) / analyzer.frequencyBinCount;

        // Validate against Wurzelklang frequency field
        let result: 'correct' | 'too_high' | 'too_low';
        if (detectedFreq >= wurzelklangFreqMin && detectedFreq <= wurzelklangFreqMax) {
          result = 'correct';
        } else if (detectedFreq < wurzelklangFreqMin) {
          result = 'too_low';
        } else {
          result = 'too_high';
        }

        setCurrentAttemptResult(result);
        setAttemptResults([...attemptResults, { attempt: attemptCount + 1, result }]);
        setAttemptCount(attemptCount + 1);
        setIsRecording(false);
        setStep('feedback');

        // Stop recording
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playGlissando = () => {
    if (glissandoAudioRef.current) {
      glissandoAudioRef.current.currentTime = 0;
      glissandoAudioRef.current.play();
      setIsPlayingGlissando(true);
    }
  };

  const stopGlissando = () => {
    if (glissandoAudioRef.current) {
      glissandoAudioRef.current.pause();
      glissandoAudioRef.current.currentTime = 0;
      setIsPlayingGlissando(false);
    }
  };

  const handleContinue = () => {
    if (attemptCount < 3) {
      setCurrentAttemptResult(null);
      setStep('training');
    } else {
      // All 3 attempts done
      const correctCount = attemptResults.filter((r: { attempt: number; result: string }) => r.result === 'correct').length;
      onVerificationComplete(correctCount >= 2); // At least 2 out of 3 correct
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 pt-40 overflow-y-auto">
      {/* Hidden audio element for glissando playback */}
      <audio 
        ref={glissandoAudioRef}
        src={glissandoUrl}
        crossOrigin="anonymous"
        onEnded={() => setIsPlayingGlissando(false)}
      />
      
      <div className="w-full max-w-2xl mx-auto py-12 pt-20">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="text-zinc-400 hover:text-white mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Zurück
        </Button>

        {step === 'info' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Wurzelklang-Verifikation</h2>
              <p className="text-zinc-400">Überprüfe deinen analysierten Lebensklang</p>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8">
                <div className="text-zinc-300 space-y-4 leading-relaxed">
                  <p>
                    Kontrolliere jetzt, ob dein <span className="text-orange-500 font-semibold">LEBENSKLANG</span> richtig analysiert wurde. 
                    Dazu musst du wissen, dass dein LEBENSKLANG nicht der tiefste Ton ist, den du in deinem Körper intonieren kannst. 
                    Er muss sich entfalten können und hat daher einen Klangraum nach oben und nach unten.
                  </p>
                  
                  <p>
                    Der tiefste Ton ist dein <span className="text-blue-500 font-semibold">WURZELKLANG</span>. 
                    Er schwingt und stimuliert deinen Ankerpunkt im Steißbein. 
                    Dieser Ton liegt meistens eine reine Quarte tiefer als dein LEBENSKLANG.
                  </p>
                  
                  <p>
                    Daher folgt nun eine Intervallübung die dich von deinem Lebensklang ausgehend in die Tiefe zu deinem Wurzelklang führt. 
                    Du hast möglicherweise noch nie in deinem Leben die Tiefen deines Stimmklangs bewusst erfahren und erlebt. 
                    Daher genieße diese Übung und spüre die tiefen Vibrationen, welche sich in deinem System ausbreiten.
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-300">
                      <span className="font-semibold">Die Intervallübung wird insgesamt dreimal eingespielt.</span>
                    </p>
                    <ul className="text-sm text-blue-300 mt-2 space-y-1 ml-4">
                      <li>• Schließe deine Augen und atme entspannt tief in deinen Unterbauch ein</li>
                      <li>• Töne deinen LEBENSKLANG und leite deine Stimme fließend in die Tiefe</li>
                      <li>• Du erhältst jeweils sofort eine Information ob du den Wurzelklang erreicht hast</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-700">
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Dein Lebensklang</div>
                      <div className="text-2xl font-bold text-orange-500">{lebensklangTone.id}</div>
                      <div className="text-xs text-zinc-400">{lebensklangTone.frequency.toFixed(1)} Hz</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-zinc-500 uppercase mb-1">Dein Wurzelklang</div>
                      <div className="text-2xl font-bold text-blue-500">{wurzelklangTone.id}</div>
                      <div className="text-xs text-zinc-400">{wurzelklangTone.frequency.toFixed(1)} Hz</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={() => setStep('training')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              Verifikation starten
            </Button>
          </div>
        )}

        {step === 'training' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Versuch {attemptCount + 1} von 3</h2>
              <p className="text-zinc-400">Höre den Glissando und folge ihm mit deiner Stimme</p>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center space-y-6">
                {/* Glissando Playback */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 mb-6">
                  <p className="text-sm text-blue-300 mb-4">Zuerst: Höre den Glissando-Ton</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={isPlayingGlissando ? stopGlissando : playGlissando}
                      className={isPlayingGlissando ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                      size="lg"
                    >
                      {isPlayingGlissando ? (
                        <>
                          <Square className="w-5 h-5 mr-2" />
                          Stopp
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Glissando abspielen
                        </>
                      )}
                    </Button>
                  </div>
                  {isPlayingGlissando && (
                    <div className="flex justify-center gap-1 mt-4">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1 h-6 bg-blue-500 rounded animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Recording Section */}
                <div className="border-t border-zinc-700 pt-6">
                  <p className="text-sm text-zinc-300 mb-4">Dann: Töne selbst nach</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                      size="lg"
                    >
                      {isRecording ? (
                        <>
                          <Square className="w-5 h-5 mr-2" />
                          Stopp
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Aufnahme starten
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => setIsMuted(!isMuted)}
                      variant="outline"
                      className="border-zinc-700"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {isRecording && (
                    <div className="flex justify-center gap-1 mt-4">
                      {[0, 1, 2].map(i => (
                        <div
                          key={i}
                          className="w-1 h-8 bg-red-500 rounded animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'feedback' && currentAttemptResult && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Versuch {attemptCount} von 3</h2>
              <p className="text-zinc-400">Ergebnis</p>
            </div>

            <Card className={`border-2 ${
              currentAttemptResult === 'correct' ? 'border-green-500 bg-green-500/10' :
              currentAttemptResult === 'too_high' ? 'border-yellow-500 bg-yellow-500/10' :
              'border-blue-500 bg-blue-500/10'
            }`}>
              <CardContent className="p-8 text-center space-y-4">
                <div className="text-4xl font-bold mb-4">
                  {currentAttemptResult === 'correct' ? '✓' :
                   currentAttemptResult === 'too_high' ? '↑' :
                   '↓'}
                </div>
                
                <div className="text-2xl font-bold">
                  {currentAttemptResult === 'correct' ? (
                    <span className="text-green-400">Wurzelklang erreicht!</span>
                  ) : currentAttemptResult === 'too_high' ? (
                    <span className="text-yellow-400">Zu hoch</span>
                  ) : (
                    <span className="text-blue-400">Zu tief</span>
                  )}
                </div>

                <p className="text-zinc-300 text-sm">
                  {currentAttemptResult === 'correct' 
                    ? 'Perfekt! Du hast den Wurzelklang erreicht. Dein Lebensklang ist korrekt analysiert.'
                    : currentAttemptResult === 'too_high'
                    ? 'Dein Ton war noch zu hoch. Versuche tiefer zu gehen.'
                    : 'Dein Ton war zu tief. Versuche etwas höher zu gehen.'}
                </p>
              </CardContent>
            </Card>

            <Button 
              onClick={handleContinue}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              size="lg"
            >
              {attemptCount < 3 ? `Versuch ${attemptCount + 1}` : 'Verifikation abschließen'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
