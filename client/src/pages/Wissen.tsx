import React from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';

// Example video data - REPLACE WITH REAL VIDEOS LATER
const VIDEOS = [
  {
    id: 'placeholder-1',
    title: 'Einführung in die Methode 36',
    description: 'Grundlagen der multidimensionalen Identität und wie Frequenzen unser Wohlbefinden beeinflussen.',
    category: 'Grundlagen',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder ID
    thumbnail: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'placeholder-2',
    title: 'Hormone & Stimmfrequenzen',
    description: 'Wie unsere Stimme den Hormonhaushalt widerspiegelt und beeinflusst.',
    category: 'Wissenschaft',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder ID
    thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'placeholder-3',
    title: 'Die 24 Farbtypen erklärt',
    description: 'Eine Reise durch das Farbspektrum und die Bedeutung der einzelnen Typen.',
    category: 'Vertiefung',
    youtubeId: 'dQw4w9WgXcQ', // Placeholder ID
    thumbnail: 'https://images.unsplash.com/photo-1520690214124-2405c5217036?auto=format&fit=crop&q=80&w=800'
  }
];

export function Wissen() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/')}
              className="text-zinc-400 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-light tracking-wider text-white">
                WISSENS<span className="font-bold text-blue-500">POOL</span>
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Hintergründe, Erklärungen und Vertiefung zur Methode 36
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="hidden md:flex gap-2 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300"
            onClick={() => window.open('https://www.youtube.com/@KIICH', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Zum KIICH Kanal
          </Button>
        </header>

        {/* Introduction */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-light mb-4">Verstehen Sie die Zusammenhänge</h2>
          <p className="text-zinc-400 leading-relaxed max-w-3xl">
            Hier finden Sie kuratierte Erklärvideos, die Ihnen helfen, die tieferen Zusammenhänge zwischen 
            Stimme, Frequenzen, Farben und Ihrem körperlichen Wohlbefinden zu verstehen. 
            Diese Inhalte stammen direkt aus unserem Forschungslabor und dem KIICH YouTube-Kanal.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((video) => (
            <Card key={video.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden group hover:border-blue-500/50 transition-colors">
              {/* Thumbnail Container */}
              <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-blue-500/90 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-xs font-medium text-blue-400 border border-blue-500/20">
                  {video.category}
                </div>
                
                {/* Click Handler (Opens YouTube) */}
                <a 
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10"
                  aria-label={`Video ansehen: ${video.title}`}
                />
              </div>

              <CardHeader className="p-5">
                <CardTitle className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">
                  {video.title}
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-2 line-clamp-2">
                  {video.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* Footer Call to Action */}
        <div className="flex justify-center mt-12 pb-12">
          <Button 
            variant="ghost" 
            className="text-zinc-500 hover:text-white"
            onClick={() => window.open('https://www.youtube.com/@KIICH', '_blank')}
          >
            Mehr Videos auf YouTube ansehen <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
