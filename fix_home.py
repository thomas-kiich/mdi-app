"""
Dieses Skript führt zwei Änderungen an Home.tsx durch:
1. Szenario-Vorschau-Block (id="vorschau-april-2026") wird direkt nach dem PodcastFeature-Block eingefügt
2. Kühlschrankfoto-Block (KÜHLSCHRANKTÜR MARKETING-ELEMENT) wird aus dem Szenario-Container entfernt
"""

with open('client/src/pages/Home.tsx', 'r') as f:
    content = f.read()

# === SCHRITT 1: Szenario-Vorschau-Block finden ===
# Der Block beginnt mit '<div id="vorschau-april-2026"' und endet mit dem schließenden </div>
# Danach kommt der Kühlschrankfoto-Block

szenario_start_marker = '              <div id="vorschau-april-2026" className="container max-w-6xl mx-auto px-4 mt-12 mb-24">'
kuehl_start_marker = '                {/* ===== KÜHLSCHRANKTÜR MARKETING-ELEMENT ===== */}'
kuehl_end_marker = '                {/* ===== PREMIUM ANGEBOTE SEKTION ===== */}'

# Finde die Positionen
pos_szenario = content.find(szenario_start_marker)
pos_kuehl_start = content.find(kuehl_start_marker)
pos_kuehl_end = content.find(kuehl_end_marker)

print(f"Szenario-Start: {pos_szenario}")
print(f"Kühlschrank-Start: {pos_kuehl_start}")
print(f"Kühlschrank-Ende (Premium-Start): {pos_kuehl_end}")

if pos_szenario == -1 or pos_kuehl_start == -1 or pos_kuehl_end == -1:
    print("FEHLER: Marker nicht gefunden!")
    exit(1)

# Extrahiere den Szenario-Block (ohne Kühlschrankfoto)
# Der Szenario-Block endet bei kuehl_start_marker
szenario_block = content[pos_szenario:pos_kuehl_start]
print(f"\nSzenario-Block Länge: {len(szenario_block)} Zeichen")
print(f"Szenario-Block endet mit: ...{repr(szenario_block[-100:])}")

# Der Szenario-Block endet mit:
# "                </div>\n              </div>\n              \n              "
# Wir müssen das Ende des Szenario-Blocks (das schließende </div> für den Container) finden
# Der Block hat: <div id="vorschau-april-2026"> ... <div className="grid"> ... </div> ... </div>
# Das letzte </div> schließt den vorschau-april-2026 Container

# Finde das Ende des Szenario-Blocks (das schließende </div> für den Container)
# Wir suchen nach dem letzten </div> vor dem Kühlschrankfoto-Block
szenario_end_search = content[pos_szenario:pos_kuehl_start]
# Das Ende des Szenario-Blocks ist das letzte </div> + Newline
last_div_close = szenario_end_search.rfind('</div>')
szenario_clean = szenario_end_search[:last_div_close + len('</div>')]
print(f"\nSzenario-Block (bereinigt) endet mit: ...{repr(szenario_clean[-100:])}")

# === SCHRITT 2: Podcast-Feature-Ende finden ===
# Nach dem PodcastFeature kommt:
# "                />\n              </div>\n              <div className=\"container max-w-6xl mx-auto px-4 flex justify-center mb-4\">"
podcast_end_marker = '                />\n              </div>\n              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">'
pos_podcast_end = content.find(podcast_end_marker)
print(f"\nPodcast-Ende: {pos_podcast_end}")

if pos_podcast_end == -1:
    print("FEHLER: Podcast-Ende-Marker nicht gefunden!")
    exit(1)

# === SCHRITT 3: Neue Datei zusammenbauen ===
# Aufbau:
# [Anfang bis nach Podcast-Ende] + [Szenario-Block] + [Rest ab App-Install-Button]

# Einfügestelle: nach dem Podcast-Ende (nach dem ersten </div>)
insert_after = '                />\n              </div>\n'
insert_pos = content.find(insert_after, pos_podcast_end)
insert_pos_end = insert_pos + len(insert_after)

print(f"\nEinfüge-Position: {insert_pos_end}")

# Szenario-Block für Einfügung vorbereiten (mit angepasster Einrückung)
# Im Checkpoint hat der Block 14 Spaces Einrückung (7 Ebenen)
# Wir wollen ihn direkt nach dem Podcast einfügen, auf gleicher Ebene
szenario_insert = '\n' + szenario_clean + '\n'

# Neue Datei zusammenbauen:
# 1. Alles bis zur Einfügestelle
# 2. Szenario-Block einfügen
# 3. Rest der Datei (ab App-Install-Button, OHNE den alten Szenario-Block und Kühlschrankfoto)

before_insert = content[:insert_pos_end]
after_insert_start = content.find('              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">', insert_pos_end)

# Der Rest der Datei beginnt ab dem App-Install-Button
# Wir müssen den alten Szenario-Block + Kühlschrankfoto überspringen
# Der alte Szenario-Block beginnt bei pos_szenario
# Das Kühlschrankfoto endet bei pos_kuehl_end (wo Premium-Angebote beginnt)

# Finde den Beginn des alten Szenario-Blocks im "Rest"
# Der Rest enthält: [App-Install-Button] ... [Szenario-Block] ... [Kühlschrankfoto] ... [Premium-Angebote] ...
# Wir wollen: [App-Install-Button] ... [Premium-Angebote] ...

# Finde den App-Install-Button im Rest
app_install_marker = '              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">'
pos_app_install = content.find(app_install_marker, insert_pos_end)
print(f"\nApp-Install-Button Position: {pos_app_install}")

# Finde den alten Szenario-Block im Rest
pos_old_szenario_in_rest = content.find(szenario_start_marker, pos_app_install)
print(f"Alter Szenario-Block in Rest: {pos_old_szenario_in_rest}")

if pos_old_szenario_in_rest == -1:
    print("FEHLER: Alter Szenario-Block nicht im Rest gefunden!")
    exit(1)

# Rest vor dem alten Szenario-Block (App-Install-Button bis vor Szenario)
rest_before_old_szenario = content[pos_app_install:pos_old_szenario_in_rest]

# Rest nach dem Kühlschrankfoto (ab Premium-Angebote)
rest_after_kuehl = content[pos_kuehl_end:]

# Neue Datei zusammenbauen
new_content = before_insert + szenario_insert + rest_before_old_szenario + rest_after_kuehl

print(f"\nOriginal Länge: {len(content)}")
print(f"Neue Länge: {len(new_content)}")
print(f"Differenz: {len(new_content) - len(content)}")

# Schreibe die neue Datei
with open('client/src/pages/Home.tsx', 'w') as f:
    f.write(new_content)

print("\nDatei erfolgreich geschrieben!")
