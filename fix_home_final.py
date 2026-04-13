"""
Finale Version des Skripts.

Ziel: 
1. Szenario-Vorschau direkt nach PodcastFeature einfügen (UNTERHALB der freigeschalteten Episoden)
2. Kühlschrankfoto entfernen
3. Korrekte JSX-Struktur beibehalten

Aktuelle Struktur (Checkpoint):
  [PodcastFeature-Container] (Zeile 640-696)
  [App-Install-Button] (Zeile 697-705)
  [Dashboard] (Zeile 706-720)
  [vorschau-april-2026 Container] (Zeile 722-978)
    [Szenario-Vorschau] (Zeile 722-792)
    [Kühlschrankfoto] (Zeile 794-839) ← wird entfernt
    [Premium-Angebote] (Zeile 841-929)
    [Feedback] (Zeile 931-957)
    [Newsletter] (Zeile 959-975)
  [/vorschau-april-2026] (Zeile 977)
  [/space-y-8] (Zeile 978)
  );

Gewünschte Struktur nach Änderung:
  [PodcastFeature-Container]
  [vorschau-april-2026 Container]  ← direkt nach Podcast
    [Szenario-Vorschau]            ← unter den Episoden
    [Premium-Angebote]
    [Feedback]
    [Newsletter]
  [/vorschau-april-2026]
  [App-Install-Button]
  [Dashboard]
  [/space-y-8]
  );
"""

with open('client/src/pages/Home.tsx', 'r') as f:
    content = f.read()

# === MARKER-DEFINITIONEN ===
# Ende des PodcastFeature-Containers (die letzten Zeilen des Containers)
podcast_end = '                />\n              </div>\n'

# App-Install-Button Container
app_install = '              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">'

# Dashboard Container  
dashboard_start = '              <div className="container max-w-6xl mx-auto px-4">\n                <Dashboard '

# Szenario-Container-Start
szenario_start = '              <div id="vorschau-april-2026" className="container max-w-6xl mx-auto px-4 mt-12 mb-24">'

# Kühlschrankfoto-Start
kuehl_start = '\n                {/* ===== KÜHLSCHRANKTÜR MARKETING-ELEMENT ===== */}'

# Premium-Angebote-Start
premium_start = '                {/* ===== PREMIUM ANGEBOTE SEKTION ===== */}'

# Ende des vorschau-containers + space-y-8 + );
# Das Muster ist: </div>(schließt vorschau) + </div>(schließt space-y-8) + );
end_of_dashboard_case = '            </div>\n            </div>\n        );\n'

# === POSITIONEN FINDEN ===
pos_podcast_end = content.find(podcast_end)
pos_app_install = content.find(app_install)
pos_szenario_start = content.find(szenario_start)
pos_kuehl_start = content.find(kuehl_start)
pos_premium_start = content.find(premium_start)
pos_end_dashboard = content.find(end_of_dashboard_case)

print(f"Podcast-Ende: {pos_podcast_end}")
print(f"App-Install: {pos_app_install}")
print(f"Szenario-Start: {pos_szenario_start}")
print(f"Kühlschrank-Start: {pos_kuehl_start}")
print(f"Premium-Start: {pos_premium_start}")
print(f"Ende Dashboard-Case: {pos_end_dashboard}")

# Validierung
markers = {
    'podcast_end': pos_podcast_end,
    'app_install': pos_app_install,
    'szenario_start': pos_szenario_start,
    'kuehl_start': pos_kuehl_start,
    'premium_start': pos_premium_start,
    'end_dashboard': pos_end_dashboard,
}
for name, pos in markers.items():
    if pos == -1:
        print(f"FEHLER: Marker '{name}' nicht gefunden!")
        exit(1)

# === TEILE EXTRAHIEREN ===

# Teil A: Alles bis nach dem PodcastFeature-Container-Ende
part_A = content[:pos_podcast_end + len(podcast_end)]

# Teil B: Szenario-Vorschau-Block (ohne Kühlschrankfoto)
# Beginnt mit dem Container-Start, endet vor dem Kühlschrankfoto
part_B_szenario = content[pos_szenario_start:pos_kuehl_start]
print(f"\nSzenario-Block endet mit: {repr(part_B_szenario[-80:])}")

# Teil C: Premium-Angebote + Feedback + Newsletter + Ende des Containers
# Beginnt mit Premium, endet mit dem Ende des vorschau-containers
# Das Ende ist: "              </div>\n" (schließt vorschau-container)
# gefolgt von "            </div>\n" (schließt space-y-8)
# gefolgt von "        );\n"
part_C_premium_to_end = content[pos_premium_start:pos_end_dashboard + len(end_of_dashboard_case)]
print(f"Premium+Rest beginnt mit: {repr(part_C_premium_to_end[:80])}")
print(f"Premium+Rest endet mit: {repr(part_C_premium_to_end[-80:])}")

# Teil D: App-Install-Button + Dashboard
# Beginnt mit App-Install, endet vor dem Szenario-Container
part_D_app_dashboard = content[pos_app_install:pos_szenario_start]
print(f"\nApp+Dashboard Länge: {len(part_D_app_dashboard)}")

# Teil E: Rest der Datei nach dem Ende des dashboard-case
part_E_rest = content[pos_end_dashboard + len(end_of_dashboard_case):]
print(f"Rest der Datei beginnt mit: {repr(part_E_rest[:80])}")

# === NEUE DATEI ZUSAMMENBAUEN ===
# Reihenfolge:
# A: Alles bis nach PodcastFeature
# B: Szenario-Vorschau (innerhalb des vorschau-containers)
# C: Premium-Angebote + Feedback + Newsletter + Ende des Containers (schließt vorschau + space-y-8 + );)
# D: App-Install + Dashboard ← ABER: Diese müssen VOR dem Ende des space-y-8 sein!

# PROBLEM: Das Ende des dashboard-case (end_of_dashboard_case) schließt BEIDE Container:
# - vorschau-container (</div>)
# - space-y-8 (</div>)
# - );
# Wenn ich D nach C einfüge, sind App-Install und Dashboard nach dem );

# LÖSUNG: Ich muss das Ende des Containers aufteilen:
# - C endet mit: Newsletter + </div>(schließt mt-16) + </div>(schließt vorschau) 
# - Dann kommt D: App-Install + Dashboard
# - Dann: </div>(schließt space-y-8) + );

# Finde das Ende des vorschau-containers (nur 1 </div>)
# Das Muster am Ende des Checkpoints:
# "                  </div>\n" (schließt newsletter-section)
# "                </div>\n" (schließt mt-16 flex)
# "              </div>\n" (schließt vorschau-container)
# "            </div>\n" (schließt space-y-8)
# "        );\n"

# In Teil C muss ich das Ende des vorschau-containers finden
# und dann D (App+Dashboard) + </div>(space-y-8) + ); einfügen

# Finde das Ende des vorschau-containers in Teil C
# Das ist das letzte "              </div>\n" vor "            </div>\n"
vorschau_close = '              </div>\n'
space_y8_close = '            </div>\n'
case_end = '        );\n'

# Suche das Muster im content nach dem premium_start
search_area = content[pos_premium_start:]
# Das Ende des vorschau-containers ist: "              </div>\n            </div>\n        );\n"
vorschau_end_pattern = '              </div>\n            </div>\n        );\n'
pos_vorschau_end_in_search = search_area.find(vorschau_end_pattern)
print(f"\nVorschau-Ende in Suchbereich: {pos_vorschau_end_in_search}")

if pos_vorschau_end_in_search == -1:
    print("FEHLER: Vorschau-Ende nicht gefunden!")
    exit(1)

# Absoluter Positionswert
pos_vorschau_end = pos_premium_start + pos_vorschau_end_in_search
print(f"Vorschau-Ende absolut: {pos_vorschau_end}")

# Teil C_neu: Premium + Feedback + Newsletter + </div>(schließt vorschau)
# Endet mit "              </div>\n" (schließt vorschau-container)
part_C_new = content[pos_premium_start:pos_vorschau_end + len(vorschau_close)]
print(f"\nC_new endet mit: {repr(part_C_new[-100:])}")

# Teil F: </div>(schließt space-y-8) + );
part_F_end = space_y8_close + case_end
print(f"F_end: {repr(part_F_end)}")

# === FINALE ZUSAMMENSETZUNG ===
new_content = (
    part_A +           # Alles bis nach PodcastFeature
    part_B_szenario +  # Szenario-Vorschau (öffnet vorschau-container, enthält Szenario)
    '\n' +             # Leerzeile
    part_C_new +       # Premium + Feedback + Newsletter + </div>(schließt vorschau)
    part_D_app_dashboard +  # App-Install + Dashboard
    part_F_end +       # </div>(schließt space-y-8) + );
    part_E_rest        # Rest der Datei
)

print(f"\nOriginal Länge: {len(content)}")
print(f"Neue Länge: {len(new_content)}")

# Schreibe die neue Datei
with open('client/src/pages/Home.tsx', 'w') as f:
    f.write(new_content)

print("\nDatei erfolgreich geschrieben!")
