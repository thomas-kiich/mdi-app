"""
Verschiebt den Block STIMMEN AUS DEM FELD bis NEWSLETTER
von innerhalb des vorschau-april-2026-Containers
direkt nach dem Hero-Bereich (als eigener Container).
"""

with open('client/src/pages/Home.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Zeilen 707-752 (0-indexed: 706-751) enthalten den Block
# Zeile 753 (0-indexed: 752) ist </div> – das schließt den vorschau-Container, bleibt!

# Exakte Zeilennummern (1-indexed):
# 707: {/* Resonanz / Feedback Section */}
# 752: </div>  ← letztes </div> des Feedback-Blocks (schließt mt-16 flex div)
# 753: </div>  ← schließt vorschau-april-2026 Container – BLEIBT!

# Finde die Zeilen
start_line = None
end_line = None

for i, line in enumerate(lines):
    if '{/* Resonanz / Feedback Section */}' in line and start_line is None:
        start_line = i
    if start_line is not None and i > start_line:
        # Suche das Ende: die zweite </div> nach dem Newsletter
        if '<NewsletterSignup source="podcast" />' in line:
            # Ende ist 3 Zeilen später (</div>, </div>, </div>)
            end_line = i + 3  # inkl. der drei schließenden divs
            break

print(f"Block: Zeile {start_line+1} bis {end_line+1}")
print(f"Erste Zeile: {repr(lines[start_line])}")
print(f"Letzte Zeile: {repr(lines[end_line])}")

# Extrahiere den Block (ohne das schließende </div> des vorschau-Containers)
block_lines = lines[start_line:end_line+1]

# Finde den Einfügepunkt: nach "END KIICH HERO"
insert_after = None
for i, line in enumerate(lines):
    if '{/* ===== END KIICH HERO ===== */}' in line:
        insert_after = i
        break

print(f"Einfügepunkt nach Zeile {insert_after+1}: {repr(lines[insert_after])}")

# Neuen Inhalt zusammenbauen
# Den Block in einen eigenen Container wrappen
wrapped_block = [
    '\n',
    '              <div className="container max-w-6xl mx-auto px-4 mt-8">\n',
] + ['  ' + l for l in block_lines] + [
    '              </div>\n',
    '\n',
]

new_lines = (
    lines[:insert_after+1] +
    wrapped_block +
    lines[insert_after+1:start_line] +
    lines[end_line+1:]
)

with open('client/src/pages/Home.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fertig!")
