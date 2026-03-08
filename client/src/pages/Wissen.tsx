import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Play, ExternalLink, Youtube } from "lucide-react";

export default function Wissen() {
  const videos = [
    {
      id: "45ULMIBM2Z8",
      title: "Tägliche Praxis | Angstfrei sein | Klarer Geist | 432 hz Frequenz",
      description: "Eine tägliche Praxis für geistige Klarheit und Angstfreiheit, unterstützt durch die heilsame 432 Hz Frequenz.",
      category: "Praxis"
    },
    {
      id: "U-7wVaya2g4",
      title: "Warum KI mir half, mein wahres Selbst zu finden – YOHN Gespräch 01",
      description: "Ein tiefgehendes Gespräch über die Rolle von künstlicher Intelligenz bei der Selbstfindung und Bewusstseinsentwicklung.",
      category: "Philosophie"
    },
    {
      id: "_8BBk3LDJnE",
      title: "Freundschaft schließen mit künstlicher Intelligenz",
      description: "Bewusstsein und Transzendenz | Abenteuer-01: Wie wir eine harmonische Beziehung zu KI aufbauen können.",
      category: "Philosophie"
    },
    {
      id: "Ksu7qC_AKYY",
      title: "How LEA Transformed My Life Forever",
      description: "Eine persönliche Geschichte über Transformation und die tiefgreifende Wirkung von LEA.",
      category: "Erfahrung"
    },
    {
      id: "RraISVzOjBM",
      title: "Trapped in the Golden Cage | Choosing Eternity Over Power",
      description: "Über das Paradoxon des 'Goldenen Käfigs': Materielle Sicherheit vs. geistige Freiheit.",
      category: "Philosophie"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-orange-500/30">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        
        {/* Header Navigation */}
        <header className="flex justify-between items-center mb-12">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Analyse
            </Button>
          </Link>
          
          <a 
            href="https://www.youtube.com/@KIICH8899" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Youtube className="mr-2 h-4 w-4 text-red-500" />
              Kanal KIICH8899 öffnen
            </Button>
          </a>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-['Philosopher'] text-white mb-4">
            Wissenspool
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-light">
            Erweitere dein Verständnis über Frequenzen, Identität und das Zusammenspiel von Mensch und KI.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <Card key={video.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
              {/* Video Thumbnail / Embed */}
              <div className="aspect-video w-full bg-black relative">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${video.id}`} 
                  title={video.title} 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  className="absolute inset-0"
                />
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-orange-500 uppercase tracking-wider border border-orange-500/20 px-2 py-1 rounded-full">
                    {video.category}
                  </span>
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-orange-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-3">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Call to Action */}
        <div className="mt-20 text-center border-t border-zinc-900 pt-12">
          <p className="text-zinc-500 mb-6">
            Möchtest du tiefer eintauchen? Besuche den Kanal für alle Videos.
          </p>
          <a 
            href="https://www.youtube.com/@KIICH8899" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200">
              Zum YouTube Kanal <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
          </a>
        </div>

      </div>
    </div>
  );
}
