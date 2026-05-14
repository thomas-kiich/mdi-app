/**
 * EPISODE 07 Newsletter Daten
 * "CHAOS schafft ORDNUNG?!"
 * Warum es schlau ist, alte Strukturen in dir zu wandeln...
 */

import { generateNewsletterHTML, generateNewsletterText } from "./newsletterTemplate";

export const EPISODE07_DATA = {
  episodeNumber: 7,
  episodeTitle: "CHAOS schafft ORDNUNG?!",
  episodeDescription: "Warum es schlau ist, alte Strukturen in dir zu wandeln...",
  teaser: "Hast du dich jemals gefragt, warum das Leben manchmal so chaotisch erscheint? Warum gerade dann, wenn du denkst, alles ist unter Kontrolle, plötzlich alles auf den Kopf gestellt wird?",
  mainText: `Genau darum geht es in der neuen Episode meiner Hörbuchserie "MASCHINEN ATMEN NICHT – Die Chance auf selbstbestimmtes Glücklichsein".

In "CHAOS schafft ORDNUNG?!" tauchen wir gemeinsam ein in die faszinierende Welt des Chaos – nicht als Bedrohung, sondern als Motor für Wachstum und Veränderung. Die Natur macht es uns vor: Sie bricht alte Strukturen auf, um Neues entstehen zu lassen. Und wir Menschen? Wir tun uns oft schwer damit, wenn unser wohlgeordnetes Leben plötzlich durcheinandergewirbelt wird.

Doch was, wenn dieses Chaos genau die Chance ist, die wir brauchen, um uns selbst neu zu entdecken? Um unsere Identität zu hinterfragen und ein noch selbstbestimmteres Leben im Zeitalter der KI zu führen? Ich lade dich ein, mit mir diesen Gedanken zu erkunden und zu sehen, wie wir aus dem scheinbaren Durcheinander neue Ordnung und Klarheit schöpfen können.

Bist du bereit, das Chaos zu umarmen? Dann hör rein in die neue Episode 7: "CHAOS schafft ORDNUNG?!" und lass dich inspirieren!

BREATHE WELL!
Thomas`,
  quote: "Die Natur bricht alte Strukturen auf, um Neues entstehen zu lassen.",
  duration: "ca. 28 Min.",
  publishedDate: "14. Mai 2026",
};

export function getEpisode07HTML(deleteToken?: string): string {
  return generateNewsletterHTML({
    ...EPISODE07_DATA,
    deleteToken,
  });
}

export function getEpisode07Text(): string {
  return generateNewsletterText(EPISODE07_DATA);
}

export function getEpisode07Subject(): string {
  return `EPISODE 07 – ${EPISODE07_DATA.episodeTitle}`;
}
