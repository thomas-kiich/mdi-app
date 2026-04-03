import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the available modules in our neuronal network
export type MDIModule = 'dashboard' | 'analysis' | 'training' | 'podcast' | 'scanner' | 'praxis01';

// Define the global state structure (The "Nervous System")
interface MDIState {
  activeModule: MDIModule;
  detectedFrequency: number | null;
  detectedTone: string | null;
}

// Define the actions to update the global state
interface MDIActions {
  setActiveModule: (module: MDIModule) => void;
  setAnalysisResult: (frequency: number, tone: string) => void;
  resetAnalysis: () => void;
}

// Combine state and actions for the context
type MDIContextType = MDIState & MDIActions;

// Create the context
const MDIContext = createContext<MDIContextType | undefined>(undefined);

// Provider component to wrap the application (or the Hub)
export const MDIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<MDIModule>('dashboard');
  const [detectedFrequency, setDetectedFrequency] = useState<number | null>(null);
  const [detectedTone, setDetectedTone] = useState<string | null>(null);

  const setAnalysisResult = (frequency: number, tone: string) => {
    setDetectedFrequency(frequency);
    setDetectedTone(tone);
  };

  const resetAnalysis = () => {
    setDetectedFrequency(null);
    setDetectedTone(null);
  };

  return (
    <MDIContext.Provider
      value={{
        activeModule,
        detectedFrequency,
        detectedTone,
        setActiveModule,
        setAnalysisResult,
        resetAnalysis,
      }}
    >
      {children}
    </MDIContext.Provider>
  );
};

// Custom hook for easy access to the MDI context (The "Synapse" connection)
export const useMDI = () => {
  const context = useContext(MDIContext);
  if (context === undefined) {
    throw new Error('useMDI must be used within an MDIProvider');
  }
  return context;
};
