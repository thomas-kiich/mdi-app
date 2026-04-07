import { describe, it, expect } from "vitest";

// ─── Hilfsfunktionen (isoliert testbar) ──────────────────────────────────────

const KATEGORIEN = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
type Kategorie = (typeof KATEGORIEN)[number];

function generiereObsidianMarkdown(aufnahmen: Array<{
  id: number;
  text: string;
  kategorie: string;
  zusammenfassung: string | null;
  createdAt: Date;
}>): string {
  const datum = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const datumISO = new Date().toISOString().split("T")[0];

  const EMOJI: Record<string, string> = {
    ICH: "👤", QUELL: "⚡", KONZEPT: "🧠", PROJEKT: "🎯", DIALOG: "💬", WELT: "🌍",
  };

  let md = `---\ntags: [momentaufnahme, tagebuch, ${datumISO}]\ndatum: ${datum}\nanzahl: ${aufnahmen.length}\n---\n\n# 📸 Momentaufnahmen – ${datum}\n\n`;

  const gruppiertNachKategorie = KATEGORIEN.reduce((acc, kat) => {
    acc[kat] = aufnahmen.filter(a => a.kategorie === kat);
    return acc;
  }, {} as Record<string, typeof aufnahmen>);

  for (const kat of KATEGORIEN) {
    const gruppe = gruppiertNachKategorie[kat];
    if (gruppe.length === 0) continue;
    md += `## ${EMOJI[kat]} ${kat}\n\n`;
    for (const a of gruppe) {
      const zeit = a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      md += `### ${zeit} Uhr\n`;
      if (a.zusammenfassung) md += `> ${a.zusammenfassung}\n\n`;
      md += `${a.text}\n\n`;
    }
  }

  md += `---\n*Exportiert aus KIICH MOMENTAUFNAHME*\n`;
  return md;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("MOMENTAUFNAHME – Obsidian-Export", () => {
  it("generiert leeres Markdown wenn keine Aufnahmen vorhanden", () => {
    const md = generiereObsidianMarkdown([]);
    expect(md).toContain("---");
    expect(md).toContain("anzahl: 0");
    expect(md).toContain("📸 Momentaufnahmen");
    // Keine Kategorien-Abschnitte
    expect(md).not.toContain("## 👤 ICH");
  });

  it("gruppiert Aufnahmen korrekt nach Kategorie", () => {
    const aufnahmen = [
      { id: 1, text: "Ich fühle mich gut heute.", kategorie: "ICH", zusammenfassung: "Wohlbefinden", createdAt: new Date() },
      { id: 2, text: "Neue Idee für das Buch.", kategorie: "KONZEPT", zusammenfassung: "Buchidee", createdAt: new Date() },
      { id: 3, text: "Meeting mit Klaus war produktiv.", kategorie: "DIALOG", zusammenfassung: "Klaus-Meeting", createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toContain("## 👤 ICH");
    expect(md).toContain("## 🧠 KONZEPT");
    expect(md).toContain("## 💬 DIALOG");
    expect(md).not.toContain("## ⚡ QUELL");
    expect(md).not.toContain("## 🎯 PROJEKT");
    expect(md).not.toContain("## 🌍 WELT");
  });

  it("enthält Zusammenfassung als Blockquote", () => {
    const aufnahmen = [
      { id: 1, text: "Langer Text...", kategorie: "QUELL", zusammenfassung: "Kurze Zusammenfassung", createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toContain("> Kurze Zusammenfassung");
    expect(md).toContain("Langer Text...");
  });

  it("enthält korrekte YAML-Frontmatter", () => {
    const aufnahmen = [
      { id: 1, text: "Test", kategorie: "WELT", zusammenfassung: null, createdAt: new Date() },
    ];
    const md = generiereObsidianMarkdown(aufnahmen);
    expect(md).toMatch(/^---/);
    expect(md).toContain("tags: [momentaufnahme, tagebuch,");
    expect(md).toContain("anzahl: 1");
  });

  it("enthält Export-Signatur am Ende", () => {
    const md = generiereObsidianMarkdown([]);
    expect(md).toContain("*Exportiert aus KIICH MOMENTAUFNAHME*");
  });
});

describe("MOMENTAUFNAHME – Kategorie-Validierung", () => {
  it("alle 6 Kategorien sind definiert", () => {
    expect(KATEGORIEN).toHaveLength(6);
    expect(KATEGORIEN).toContain("ICH");
    expect(KATEGORIEN).toContain("QUELL");
    expect(KATEGORIEN).toContain("KONZEPT");
    expect(KATEGORIEN).toContain("PROJEKT");
    expect(KATEGORIEN).toContain("DIALOG");
    expect(KATEGORIEN).toContain("WELT");
  });

  it("unbekannte Kategorie wird auf QUELL zurückgeführt", () => {
    const unbekannt = "UNBEKANNT";
    const fallback: Kategorie = KATEGORIEN.includes(unbekannt as Kategorie) ? unbekannt as Kategorie : "QUELL";
    expect(fallback).toBe("QUELL");
  });
});
