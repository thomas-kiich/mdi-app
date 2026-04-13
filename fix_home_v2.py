"""
Dieses Skript führt zwei Änderungen an Home.tsx durch:
1. Szenario-Vorschau-Block (id="vorschau-april-2026") wird direkt nach dem PodcastFeature-Block eingefügt
   (aber OHNE den schließenden </div> des Containers zu verschieben)
2. Kühlschrankfoto-Block (KÜHLSCHRANKTÜR MARKETING-ELEMENT) wird entfernt

Wichtig: Im Checkpoint ist die Struktur:
- PodcastFeature (in eigenem Container, schließt auf Zeile 696)
- App-Install-Button (eigener Container)
- Dashboard (eigener Container)
- vorschau-april-2026 Container (öffnet auf Zeile 722)
  - Szenario-Vorschau (Zeilen 725-792)
  - Kühlschrankfoto (Zeilen 794-839) ← wird entfernt
  - Premium-Angebote (Zeilen 841-929)
  - Feedback (Zeilen 931-957)
  - Newsletter (Zeilen 959-975)
- </div> schließt vorschau-april-2026 (Zeile 977)
- </div> schließt space-y-8 (Zeile 978)

Nach der Änderung:
- PodcastFeature (in eigenem Container)
- vorschau-april-2026 Container (direkt nach PodcastFeature)
  - Szenario-Vorschau
  - Premium-Angebote
  - Feedback
  - Newsletter
- </div> schließt vorschau-april-2026
- App-Install-Button (eigener Container)
- Dashboard (eigener Container)
- </div> schließt space-y-8
"""

with open('client/src/pages/Home.tsx', 'r') as f:
    content = f.read()

# Marker-Definitionen
podcast_container_end = '                />\n              </div>\n'  # Ende des PodcastFeature-Containers
app_install_start = '              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">'
szenario_container_start = '              <div id="vorschau-april-2026" className="container max-w-6xl mx-auto px-4 mt-12 mb-24">'
kuehl_start = '                {/* ===== KÜHLSCHRANKTÜR MARKETING-ELEMENT ===== */}'
premium_start = '                {/* ===== PREMIUM ANGEBOTE SEKTION ===== */}'
szenario_container_end = '            </div>\n        );'  # Ende des vorschau-containers + schließendes div für space-y-8

# Positionen finden
pos_podcast_end = content.find(podcast_container_end)
pos_app_install = content.find(app_install_start)
pos_szenario_start = content.find(szenario_container_start)
pos_kuehl_start = content.find(kuehl_start)
pos_premium_start = content.find(premium_start)

print(f"Podcast-Ende: {pos_podcast_end}")
print(f"App-Install-Start: {pos_app_install}")
print(f"Szenario-Container-Start: {pos_szenario_start}")
print(f"Kühlschrank-Start: {pos_kuehl_start}")
print(f"Premium-Start: {pos_premium_start}")

# Validierung
if any(p == -1 for p in [pos_podcast_end, pos_app_install, pos_szenario_start, pos_kuehl_start, pos_premium_start]):
    print("FEHLER: Marker nicht gefunden!")
    exit(1)

# Extrahiere die Teile:
# 1. Alles bis zum Ende des PodcastFeature-Containers (inkl. dem </div>)
part1 = content[:pos_podcast_end + len(podcast_container_end)]
print(f"\nPart1 endet mit: ...{repr(part1[-100:])}")

# 2. App-Install-Button + Dashboard (zwischen podcast_end und szenario_start)
part2_app_dashboard = content[pos_app_install:pos_szenario_start]
print(f"\nPart2 (App+Dashboard) Länge: {len(part2_app_dashboard)}")

# 3. Szenario-Vorschau-Block (vom Container-Start bis zum Kühlschrankfoto-Start)
# Enthält: <div id="vorschau-april-2026"> + <h2> + <div className="grid"> ... </div>
szenario_block = content[pos_szenario_start:pos_kuehl_start]
print(f"\nSzenario-Block Länge: {len(szenario_block)}")
print(f"Szenario-Block endet mit: ...{repr(szenario_block[-100:])}")

# 4. Premium-Angebote + Feedback + Newsletter + Ende des Containers
# Von premium_start bis zum Ende des vorschau-containers
# Das Ende ist: "            </div>\n        );\n"
part4_rest = content[pos_premium_start:]
print(f"\nPart4 (Premium+Rest) beginnt mit: {repr(part4_rest[:100])}")

# Neue Datei zusammenbauen:
# Part1 (bis nach PodcastFeature-Container-Ende)
# + Szenario-Block (vorschau-container öffnet, Szenario-Vorschau)
# + Part4 (Premium + Feedback + Newsletter + Container-Ende + Rest der Datei)
# + Part2 (App-Install + Dashboard) ← NEIN, das ist falsch

# Warte - ich muss die Reihenfolge überdenken.
# Im Checkpoint ist die Reihenfolge:
# 1. PodcastFeature (Zeile 640-696)
# 2. App-Install-Button (Zeile 697-705)
# 3. Dashboard (Zeile 706-720)
# 4. vorschau-april-2026 Container (Zeile 722-978)
#    - Szenario-Vorschau
#    - Kühlschrankfoto
#    - Premium-Angebote
#    - Feedback
#    - Newsletter
# 5. </div> schließt space-y-8 (Zeile 978)

# Nach der Änderung soll die Reihenfolge sein:
# 1. PodcastFeature (Zeile 640-696)
# 2. vorschau-april-2026 Container (direkt nach PodcastFeature)
#    - Szenario-Vorschau
#    - Premium-Angebote
#    - Feedback
#    - Newsletter
# 3. App-Install-Button
# 4. Dashboard
# 5. </div> schließt space-y-8

# Das bedeutet:
# Part1 = Alles bis nach PodcastFeature-Container-Ende (bis Zeile 696)
# Part_szenario_open = <div id="vorschau-april-2026"> + Szenario-Vorschau
# Part_premium_etc = Premium-Angebote + Feedback + Newsletter + </div> (schließt vorschau-container)
# Part_app_dashboard = App-Install + Dashboard
# Part_end = </div> schließt space-y-8 + );

# Finde das Ende des vorschau-containers
# Im Checkpoint: Zeile 977 = "            </div>" (schließt vorschau-container)
#                Zeile 978 = "            </div>" (schließt space-y-8)
#                Zeile 979 = "        );"

# In der aktuellen Datei suche ich nach dem Muster am Ende des dashboard-case
end_pattern = '            </div>\n            </div>\n        );'
pos_end = content.find(end_pattern)
print(f"\nEnde-Pattern Position: {pos_end}")

if pos_end == -1:
    # Versuche alternatives Muster
    end_pattern = '            </div>\n        );'
    pos_end = content.find(end_pattern)
    print(f"Alternatives Ende-Pattern Position: {pos_end}")

# Zeige die letzten 200 Zeichen vor dem case "preparation"
prep_pos = content.find('      case "preparation":')
print(f"\ncase preparation Position: {prep_pos}")
print(f"Letzte 200 Zeichen vor preparation: {repr(content[prep_pos-200:prep_pos])}")
