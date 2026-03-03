import { ToneData } from "./tones";

export interface ToneInterpretation {
  tone: string;
  title: string;
  keywords: string[];
  
  // Inner Field: What does it mean if this is your dominant tone?
  innerPower: {
    heading: string;
    text: string;
  };
  
  // Outer Field: What does it mean if this is your missing/complementary tone?
  outerPotential: {
    heading: string;
    text: string;
  };
}

export const INTERPRETATIONS: Record<string, ToneInterpretation> = {
  "C": {
    tone: "C",
    title: "Der Erd-Ton (Jahreston)",
    keywords: ["Stabilität", "Urvertrauen", "Verwurzelung"],
    innerPower: {
      heading: "Deine Stärke: Die Wurzel",
      text: "Du ruhst in dir selbst. Wie ein Baum hast du tiefe Wurzeln geschlagen und lässt dich nicht leicht aus der Ruhe bringen. Deine Präsenz gibt anderen Halt und Sicherheit."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Erdung",
      text: "Dir fehlt manchmal der Boden unter den Füßen. Du neigst dazu, dich in Gedanken oder Träumen zu verlieren. Die Frequenz C hilft dir, im Hier und Jetzt anzukommen und deine Ideen in die Tat umzusetzen."
    }
  },
  "C#": {
    tone: "C#",
    title: "Der Mond-Ton (Siderischer Mond)",
    keywords: ["Gefühl", "Weiblichkeit", "Zyklus"],
    innerPower: {
      heading: "Deine Stärke: Die Intuition",
      text: "Du hast einen direkten Zugang zu deinen Gefühlen und denen anderer. Deine emotionale Intelligenz ist deine Superkraft. Du verstehst Dinge, ohne dass Worte nötig sind."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Emotionaler Fluss",
      text: "Vielleicht unterdrückst du deine weiche Seite oder hast Angst vor Gefühlschaos. Die Frequenz C# lädt dich ein, deine Emotionen nicht zu bewerten, sondern sie als Kraftquelle zu nutzen."
    }
  },
  "D": {
    tone: "D",
    title: "Der Wasser-Ton (Platonisches Jahr)",
    keywords: ["Fließen", "Kreativität", "Loslassen"],
    innerPower: {
      heading: "Deine Stärke: Der Fluss",
      text: "Du bist immer in Bewegung. Starrheit ist dir fremd. Du findest immer einen Weg, wie Wasser, das Hindernisse einfach umfließt. Deine Kreativität sprudelt unaufhörlich."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Hingabe",
      text: "Du versuchst oft, Dinge mit dem Kopf zu kontrollieren, statt sie geschehen zu lassen. Die Frequenz D hilft dir, loszulassen und darauf zu vertrauen, dass das Leben dich trägt."
    }
  },
  "D#": {
    tone: "D#",
    title: "Der Venus-Ton",
    keywords: ["Liebe", "Harmonie", "Ästhetik"],
    innerPower: {
      heading: "Deine Stärke: Die Harmonie",
      text: "Du bringst Schönheit in die Welt. Wo Streit ist, schaffst du Ausgleich. Du hast ein tiefes Verständnis für Kunst, Partnerschaft und das Schöne im Leben."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Selbstliebe",
      text: "Vielleicht opferst du dich zu sehr für die Harmonie im Außen auf. Die Frequenz D# erinnert dich daran, dass wahre Liebe immer bei dir selbst beginnt."
    }
  },
  "E": {
    tone: "E",
    title: "Der Sonnen-Ton",
    keywords: ["Willenskraft", "Ich-Stärke", "Strahlkraft"],
    innerPower: {
      heading: "Deine Stärke: Das Strahlen",
      text: "Du bist ein natürlicher Mittelpunkt. Du hast die Kraft, Dinge zu initiieren und andere mitzureißen. Deine Energie ist warm, vital und unerschöpflich."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Selbstbewusstsein",
      text: "Du stellst dein Licht oft unter den Scheffel. Die Frequenz E hilft dir, dich zu zeigen, Raum einzunehmen und stolz auf das zu sein, was du bist."
    }
  },
  "F": {
    tone: "F",
    title: "Der Erd-Ton (Tageston)",
    keywords: ["Vitalität", "Tatkraft", "Materie"],
    innerPower: {
      heading: "Deine Stärke: Die Macher-Qualität",
      text: "Du bist ein Pragmatiker. Du redest nicht lange, du tust es. Du hast eine starke Verbindung zur physischen Welt und kannst Ideen manifestieren."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Aktivität",
      text: "Vielleicht fühlst du dich oft müde oder antriebslos. Die Frequenz F weckt deine Lebensgeister und hilft dir, aus der Passivität in die aktive Gestaltung zu kommen."
    }
  },
  "F#": {
    tone: "F#",
    title: "Der Mars-Ton",
    keywords: ["Durchsetzung", "Energie", "Neuanfang"],
    innerPower: {
      heading: "Deine Stärke: Der Krieger",
      text: "Du hast den Mut, für deine Ziele zu kämpfen. Hindernisse spornen dich erst richtig an. Du bist ein Pionier, der neue Wege geht, wo andere zögern."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Mut",
      text: "Du weichst Konflikten oft aus oder schluckst deinen Ärger herunter. Die Frequenz F# gibt dir die Kraft, für dich einzustehen und gesunde Grenzen zu setzen."
    }
  },
  "G": {
    tone: "G",
    title: "Der Jupiter-Ton",
    keywords: ["Expansion", "Glück", "Sinnsuche"],
    innerPower: {
      heading: "Deine Stärke: Der Optimist",
      text: "Du siehst immer das große Ganze. Dein Glas ist halb voll. Du hast ein Talent dafür, Wachstumschancen zu erkennen und andere zu inspirieren."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Vertrauen",
      text: "Vielleicht zweifelst du oft am Sinn oder hast Angst vor der Zukunft. Die Frequenz G verbindet dich wieder mit dem Urvertrauen, dass alles einen Sinn hat."
    }
  },
  "G#": {
    tone: "G#",
    title: "Der Saturn-Ton",
    keywords: ["Struktur", "Verantwortung", "Konzentration"],
    innerPower: {
      heading: "Deine Stärke: Der Hüter",
      text: "Auf dich ist Verlass. Du bringst Ordnung ins Chaos. Du hast die Ausdauer, auch schwierige Projekte zu Ende zu bringen und Verantwortung zu tragen."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Disziplin",
      text: "Du fühlst dich oft überfordert oder chaotisch. Die Frequenz G# hilft dir, dich auf das Wesentliche zu fokussieren und Schritt für Schritt voranzugehen."
    }
  },
  "A": {
    tone: "A",
    title: "Der Uranus-Ton",
    keywords: ["Freiheit", "Innovation", "Geistesblitz"],
    innerPower: {
      heading: "Deine Stärke: Der Visionär",
      text: "Du denkst anders als alle anderen. Du liebst die Freiheit und brichst gerne alte Strukturen auf. Deine Ideen sind oft ihrer Zeit voraus."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Befreiung",
      text: "Du fühlst dich eingeengt in Konventionen. Die Frequenz A ermutigt dich, deine Einzigartigkeit zu leben und dich von alten Fesseln zu lösen."
    }
  },
  "A#": {
    tone: "A#",
    title: "Der Neptun-Ton",
    keywords: ["Spiritualität", "Traum", "All-Eins"],
    innerPower: {
      heading: "Deine Stärke: Der Mystiker",
      text: "Du hast einen Zugang zu Welten jenseits des Sichtbaren. Deine Fantasie ist grenzenlos. Du spürst die Verbundenheit aller Dinge."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Transzendenz",
      text: "Du suchst nach mehr Tiefe im Leben. Die Frequenz A# öffnet dein Bewusstsein für die feinstofflichen Ebenen und hilft dir, Meditation und Stille zu finden."
    }
  },
  "B": {
    tone: "B",
    title: "Der Pluto-Ton",
    keywords: ["Transformation", "Macht", "Tiefe"],
    innerPower: {
      heading: "Deine Stärke: Der Alchemist",
      text: "Du scheust dich nicht vor den Schattenseiten. Du weißt, dass in jeder Krise eine Chance zur Wandlung liegt. Du hast eine enorme psychische Kraft."
    },
    outerPotential: {
      heading: "Dein Wachstumspotenzial: Wandlung",
      text: "Du hältst vielleicht an Altem fest, obwohl es dir nicht mehr dient. Die Frequenz B hilft dir, loszulassen und wie ein Phönix aus der Asche neu zu erstehen."
    }
  }
};
