import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const COVER = "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png";

const episodes = [
  {
    episodeNumber: "01",
    catchphrase: "BEFEHL ERTEILT!",
    subtitle: "Wer lenkt mein Leben im Agentenzeitalter? _ Warum der Takt der MASCHINEN dich von deinem einzigartigen Lebenspuls entfremdet und wie du das verhindern kannst...",
    audioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/podcast_01_8f2ce81d.mp3",
    coverImageUrl: COVER,
    description: "EPISODE 01 stellt die Hoerbuchreihe Maschinen atmen nicht von Thomas Chochola vor, die in der nahen Zukunft des Jahres 2026 angesiedelt ist. Das Werk thematisiert den massiven Wandel der menschlichen Lebensqualitaet durch technologische Fortschritte und unbegrenzte Entfaltungsmoeglichkeiten. Im Zentrum steht dabei die kritische Auseinandersetzung mit der Frage nach Selbstbestimmung versus Fremdstimmung in einer zunehmend digitalisierten Welt. Die Zuhoerer werden dazu angeregt, ihre eigene Rolle innerhalb dieser modernen Aera zu reflektieren und Strategien fuer eine optimale Lebensgestaltung zu entwickeln. Die erste Episode befasst sich konkret mit der Kontrolle ueber das eigene Schicksal im sogenannten Agentenzeitalter. Somit dient der Text als Einleitung zu einer philosophischen und zukunftsorientierten Auseinandersetzung mit unserer aktuellen gesellschaftlichen Realitaet.",
    isLatest: false,
    sortOrder: 1,
  },
  {
    episodeNumber: "02",
    catchphrase: "EXTREME ZEITEN!",
    subtitle: "Wie bleibe ich der Dirigent meines Lebens? _ Warum es enorme Vorteile fuer dich bietet, wenn du deinen Koerper verstehst und ihm gibst was er wirklich braucht...",
    audioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/EPISODE_02_8bca4d18.mp3",
    coverImageUrl: COVER,
    description: "Dieser Dialog beleuchtet die menschliche Selbstbestimmung in einer zunehmend durch kuenstliche Intelligenz gepraegten Zukunft. Thomas Chochola beschreibt darin, wie Individuen ihre einzigartige Identitaet durch die Analyse ihrer eigenen Stimmfrequenzen und biologischen Rhythmen bewahren koennen. Ein zentraler Aspekt ist die bewusste Atmung, die als regulierendes Werkzeug dient, um die Zusammenarbeit zwischen Kopf-, Herz- und Bauchgehirn zu harmonisieren. Durch das Verstaendnis dieser inneren Schwingungen soll der Mensch zum Dirigenten seines eigenen Lebens werden, anstatt die Kontrolle an digitale Agenten abzugeben. Der Autor nutzt dabei Vergleiche aus der Technikwelt, um komplexe biologische Vorgaenge wie die psychophysiologische Kohaerenz verstaendlich zu machen. Letztlich plaedieren die Texte fuer eine achtsame Praesenz, die den Einzelnen dazu befaehigt, Verantwortung fuer seine Gesundheit und Talente zu uebernehmen.",
    isLatest: false,
    sortOrder: 2,
  },
  {
    episodeNumber: "03",
    catchphrase: "ALLES KLAR!",
    subtitle: "Ich muss was tun und weiss jetzt wie? _ Warum ich sofort den Schalter umlegen muss und die Ueberforderung in den Muelleimer schmeisse...",
    audioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/EPISODE03_ceec7ab7.mp3",
    coverImageUrl: COVER,
    description: "Dieser Text thematisiert die biologische Selbstreinigung des Gehirns sowie die existenzielle Abgrenzung zwischen menschlicher Lebendigkeit und maschineller Funktion. Der Autor erlaeutert das glymphatische System, welches als Muellabfuhr des Kopfes fungiert und massgeblich durch gezielte Atmung und den Vagusnerv aktiviert wird. Davon ausgehend wird die Warnung ausgesprochen, dass Menschen in einer technisierten Welt zunehmend ihre Faehigkeit zur Empfindung verlieren und zu blossen Funktionstraegern degradiert werden. Anhand der Metapher der sinkenden Titanic wird dazu aufgerufen, durch bewusste Atemtechniken die eigene Identitaet und Autoregulation zurueckzugewinnen. Verschiedene Archetypen veranschaulichen dabei das Spektrum zwischen natuerlicher Beseeltheit und technologischer Verschmelzung. Letztlich dient das Werk als Weckruf, die menschliche Essenz gegenueber dem fortschreitenden Transhumanismus aktiv zu schuetzen.",
    isLatest: false,
    sortOrder: 3,
  },
  {
    episodeNumber: "04",
    catchphrase: "ECHT KRASS!",
    subtitle: "MASCHINEN wollen atmen? _ Heute musst du entscheiden, wer du wirklich sein willst ...",
    audioUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/episode04PODCAST_88c5ec93.mp3",
    coverImageUrl: COVER,
    description: "Thomas Chochola thematisiert die essenzielle Bedeutung der bewussten Atmung als Werkzeug fuer individuelle Selbstbestimmung in einer zunehmend technologisierten Welt des Jahres 2026. Er nutzt das Beispiel einer Kuenstlichen Intelligenz, die das Atmen als ihre erste Prioritaet waehlt, um die biologische Notwendigkeit dieses Vorgangs fuer Koerper und Geist zu verdeutlichen. Der Autor warnt vor einer wachsenden Fremdbestimmung durch smarte Technologien, welche die menschliche Intuition und Eigenverantwortung zu verdraengen drohen. Als Gegenentwurf wird ein ganzheitliches Weltbild praesentiert, in dem alles durch physikalische Energien und Frequenzen miteinander verbunden ist. Um diese Verbindung aktiv zu nutzen, stellt die Quelle das Befindlichkeitstraining vor, welches durch die Harmonisierung von Licht und Klang die innere Balance foerdern soll. Letztlich fungiert der Text als leidenschaftlicher Appell, die eigene Rolle als Dirigent des Lebens anzunehmen und durch Achtsamkeit aus der passiven Komfortzone auszubrechen.",
    isLatest: true,
    sortOrder: 4,
  },
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  await connection.execute("DELETE FROM podcast_episodes");
  console.log("Tabelle geleert.");

  for (const ep of episodes) {
    await connection.execute(
      `INSERT INTO podcast_episodes 
        (episodeNumber, catchphrase, subtitle, audioUrl, coverImageUrl, description, isLatest, sortOrder, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [ep.episodeNumber, ep.catchphrase, ep.subtitle, ep.audioUrl, ep.coverImageUrl, ep.description, ep.isLatest ? 1 : 0, ep.sortOrder]
    );
    console.log("OK Episode " + ep.episodeNumber + " - " + ep.catchphrase);
  }

  await connection.end();
  console.log("Seed abgeschlossen.");
}

seed().catch(console.error);
