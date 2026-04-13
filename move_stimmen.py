"""
Verschiebt den Block STIMMEN AUS DEM FELD bis NEWSLETTER
von seiner aktuellen Position (nach PREMIUM ANGEBOTE)
direkt nach dem Hero-Bereich (nach END KIICH HERO).
"""

with open('client/src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Der Block der verschoben werden soll (Zeile 707-752 + leere Zeile davor)
BLOCK_TO_MOVE = '''
                {/* Resonanz / Feedback Section */}
                <div className="mt-24 mb-16 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-900/5 to-transparent pointer-events-none" />
                  <div className="relative z-10 text-center mb-12">
                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">STIMMEN AUS DEM FELD</h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">Die Reise ins Jahr 2026 hat bereits begonnen. Hier teilen Pioniere ihre ersten Erkenntnisse und Erfahrungen auf dem Weg zu mehr Selbstbestimmung.</p>
                  </div>
                  
                  <div className="max-w-4xl mx-auto">
                    <div className="bg-zinc-900/40 border border-orange-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-600" />
                      <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" />
                      
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                          <span className="text-orange-400 font-bold text-lg">JE</span>
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Johannes E.</h4>
                          <p className="text-zinc-500 text-sm">D-Regensburg • 03.04.2026</p>
                        </div>
                      </div>
                      
                      <JohannesStatement />
                    </div>
                  </div>
                </div>

                <div className="mt-16 flex flex-col items-center justify-center space-y-6">
                  <div className="text-center">
                    <p className="text-zinc-400 mb-4 max-w-lg">
                      Wie hat dir die aktuelle EPISODE gefallen? Teile gerne deine Gedanken mit uns.
                    </p>
                    <a 
                      href="mailto:LKRforschung@gmail.com?subject=Meine Eindrücke zur aktuellen Episode"
                      className="inline-flex items-center justify-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium rounded-lg transition-colors shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Meine Eindrücke.
                    </a>
                  </div>
                  
                  <div id="newsletter-section" className="border-t border-zinc-800 pt-8 mt-4">
                    <NewsletterSignup source="podcast" />
                  </div>
                </div>
              </div>'''

# Ziel: direkt nach END KIICH HERO einfügen
# Danach kommt: BETA LAUNCH BANNER und der Podcast-Block
ANCHOR_AFTER = '              {/* ===== END KIICH HERO ===== */}'

# Prüfen ob Block vorhanden
if BLOCK_TO_MOVE not in content:
    print("FEHLER: Block nicht gefunden!")
    # Debug: zeige was um Zeile 707 steht
    lines = content.split('\n')
    for i, line in enumerate(lines[705:715], start=706):
        print(f"{i}: {repr(line)}")
else:
    print("Block gefunden – verschiebe...")
    # 1. Block aus aktueller Position entfernen
    content = content.replace(BLOCK_TO_MOVE, '', 1)
    
    # 2. Block nach dem Hero-Bereich einfügen
    if ANCHOR_AFTER not in content:
        print("FEHLER: Anker nicht gefunden!")
    else:
        content = content.replace(
            ANCHOR_AFTER,
            ANCHOR_AFTER + '\n' + BLOCK_TO_MOVE,
            1
        )
        with open('client/src/pages/Home.tsx', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fertig! Block erfolgreich verschoben.")
