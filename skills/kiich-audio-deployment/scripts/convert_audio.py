#!/usr/bin/env python3
"""
KIICH Audio Konvertierung
Konvertiert eine MP3-Datei auf 128 kbps + ID3v2.3 + Info-Header (Xing).
Der Info-Header ist kritisch damit Browser die Gesamtdauer anzeigen können.

Verwendung:
  python3 convert_audio.py /pfad/zur/eingabe.mp3 /pfad/zur/ausgabe.mp3
"""

import subprocess
import sys
import os


def convert(input_path: str, output_path: str) -> bool:
    if not os.path.exists(input_path):
        print(f"FEHLER: Eingabedatei nicht gefunden: {input_path}")
        return False

    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-codec:a", "libmp3lame",
        "-b:a", "128k",
        "-id3v2_version", "3",
        "-write_xing", "1",   # Info-Header – KRITISCH für Browser-Dauer-Anzeige
        "-map_metadata", "0",
        output_path,
    ]

    print(f"Konvertiere: {input_path}")
    print(f"Ziel:        {output_path}")
    print("Bitte warten...")

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print("FEHLER bei ffmpeg:")
        print(result.stderr[-2000:])
        return False

    # Info-Header verifizieren
    with open(output_path, "rb") as f:
        data = f.read(2000)
    pos = data.find(b"Info")
    if pos >= 0:
        size_mb = os.path.getsize(output_path) / 1024 / 1024
        print(f"OK: Info-Header bei Byte {pos}")
        print(f"OK: Dateigröße {size_mb:.1f} MB")
        return True
    else:
        print("WARNUNG: Kein Info-Header gefunden – Browser zeigt möglicherweise 00:00")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Verwendung: python3 convert_audio.py <eingabe.mp3> <ausgabe.mp3>")
        sys.exit(1)
    success = convert(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
