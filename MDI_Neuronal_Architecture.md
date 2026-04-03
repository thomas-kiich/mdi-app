# Die Neuronale Architektur des MDI-Projekts

Das MDI-Projekt (Multidimensionales Identitätssystem) basiert auf einer "neuronalen Architektur". Dies bedeutet, dass jedes Modul (jede "Zelle" oder jedes "Universum") unabhängig existiert und funktioniert. Die Module sind jedoch durch klar definierte "Synapsen" (Schnittstellen oder APIs) miteinander verbunden, wodurch ein dynamisches, erweiterbares Netzwerk entsteht.

Diese Architektur spiegelt das philosophische Prinzip der **Autonomie und Verbundenheit** wider.

## 1. Das Kernkonzept: Entkopplung durch Schnittstellen

Anstatt dass Modul A direkt Modul B aufruft und dessen internen Zustand verändert (was zu einer starren, fehleranfälligen Struktur führt), kommunizieren die Module über standardisierte "Nachrichten" (Events) und geteilte, aber streng typisierte Datenstrukturen.

Das Dashboard (`Home.tsx`) fungiert als das zentrale Nervensystem (der Hub). Es verwaltet den globalen Zustand, leitet ihn aber nur über definierte "Stecker" (Props) an die einzelnen Neuronen (Komponenten) weiter.

## 2. Die Synapsen: Typisierte Schnittstellen (TypeScript Interfaces)

Um sicherzustellen, dass die "Stecker" immer passen, definieren wir strikte TypeScript-Interfaces.

### 2.1 Der Globale MDI-Kontext (Das Nervensystem)

Der zentrale Zustand, der potenziell von allen Modulen benötigt wird, wird in einem React Context (`MDIContext`) oder einem zentralen Zustandsobjekt verwaltet.

```typescript
// client/src/types/mdi.ts

/**
 * Der zentrale Zustand des MDI-Netzwerks.
 * Repräsentiert die aktuellen, global relevanten Daten.
 */
export interface MDIState {
  // Die zuletzt durch die Stimmklanganalyse ermittelte Grundfrequenz
  detectedFrequency: number | null;
  // Der daraus resultierende Grundton (z.B. 'C', 'F#')
  detectedTone: string | null;
  // Das aktuell aktive Modul (für die Navigation im Hub)
  activeModule: 'dashboard' | 'analysis' | 'training' | 'podcast' | 'scanner';
}
```

### 2.2 Schnittstelle: Stimmklanganalyse (Der Sensor)

Die Stimmklanganalyse fungiert als Sensor. Sie nimmt Daten auf, analysiert sie und "feuert" ein Event ab, wenn ein Ergebnis vorliegt. Sie muss nicht wissen, was danach mit diesem Ergebnis passiert.

```typescript
/**
 * Props für das Stimmklanganalyse-Modul.
 */
export interface VoiceAnalysisProps {
  // Callback-Funktion (Synapse), die gefeuert wird, wenn die Analyse abgeschlossen ist.
  // Das Modul übergibt die ermittelte Frequenz und den Ton an das Netzwerk.
  onAnalysisComplete: (frequency: number, tone: string) => void;
  // Optional: Callback zum Abbrechen/Zurückkehren zum Hub
  onCancel: () => void;
}
```

### 2.3 Schnittstelle: Method 36 Training (Der Aktor)

Das Trainingsmodul ist ein Aktor. Es benötigt eine Eingabe (die Frequenz), um seine Aufgabe auszuführen. Es holt sich diese Eingabe nicht selbst, sondern sie wird ihm über seinen "Stecker" übergeben.

```typescript
/**
 * Props für das Method 36 Trainings-Modul.
 */
export interface Method36TrainingProps {
  // Die Grundfrequenz, auf der das Training basieren soll.
  // Wenn null, kann das Modul einen Standardwert verwenden oder den Benutzer auffordern, zuerst eine Analyse durchzuführen.
  baseFrequency: number | null;
  // Callback zum Beenden des Trainings und Rückkehr zum Hub
  onFinish: () => void;
}
```

### 2.4 Schnittstelle: Live Scanner (Der Visualisierer)

Der Scanner kann entweder unabhängig (mit dem Mikrofon) oder gekoppelt (mit einer vorgegebenen Frequenz) arbeiten.

```typescript
/**
 * Props für den Live Spectral Scanner.
 */
export interface SpectralScannerProps {
  // Optionale Frequenz, die hervorgehoben oder erzwungen werden soll
  targetFrequency?: number | null;
  // Callback zur Rückkehr
  onClose: () => void;
}
```

## 3. Der Hub (`Home.tsx`): Verschaltung der Neuronen

Das Dashboard (`Home.tsx`) ist der Ort, an dem diese Schnittstellen verbunden werden. Es hält den `MDIState` und reicht die entsprechenden Teile an die Module weiter.

*Beispielhafte Verschaltung im Hub:*

```tsx
// Im Hub (Home.tsx)

// 1. Der Hub hält den Zustand
const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
const [detectedTone, setDetectedTone] = useState<string | null>(null);

// 2. Das Analyse-Neuron wird angeschlossen
<VoiceAnalysis 
  onAnalysisComplete={(freq, tone) => {
    // Die Synapse feuert: Der Hub speichert das Ergebnis
    setDetectedFreq(freq);
    setDetectedTone(tone);
    // Und schaltet vielleicht automatisch zum nächsten Modul um
    setActiveModule('training');
  }} 
/>

// 3. Das Trainings-Neuron wird angeschlossen
<Method36Trainer 
  // Es bekommt die Daten, die das Analyse-Neuron zuvor geliefert hat
  baseFrequency={detectedFreq} 
  onFinish={() => setActiveModule('dashboard')}
/>
```

## 4. Vorteile dieser Architektur

1.  **Sicherheit:** Wenn wir das Trainingsmodul komplett neu schreiben, bleibt die Stimmklanganalyse unberührt.
2.  **Testbarkeit:** Wir können das Trainingsmodul isoliert testen, indem wir ihm einfach eine "künstliche" Frequenz über den Stecker (`baseFrequency={432}`) übergeben.
3.  **Wachstum:** Wenn ein neues "Stockwerk" (z.B. ein neues KIICHwerke-Modul) hinzugefügt wird, definieren wir einfach eine neue Schnittstelle (`KiichModuleProps`) und schließen es an den Hub an.

Diese Struktur stellt sicher, dass das MDI-Projekt beliebig wachsen kann, ohne unter seiner eigenen Komplexität zusammenzubrechen. Es ist ein lebendiges, atmendes System – ganz im Sinne von "Pulsation statt Takt".
