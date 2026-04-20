import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface VornameContextType {
  vorname: string | null;
  isLoading: boolean;
  /** true wenn Nutzer eingeloggt aber noch kein Vorname gesetzt */
  needsOnboarding: boolean;
  /** Nach erfolgreichem Onboarding aufrufen */
  setVornameLocal: (v: string) => void;
}

const VornameContext = createContext<VornameContextType>({
  vorname: null,
  isLoading: false,
  needsOnboarding: false,
  setVornameLocal: () => {},
});

export function VornameProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [vorname, setVorname] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const { data, isLoading } = trpc.profil.getVorname.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isAuthenticated || authLoading || isLoading) return;
    if (data?.vorname) {
      setVorname(data.vorname);
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
  }, [data, isAuthenticated, authLoading, isLoading]);

  const setVornameLocal = (v: string) => {
    setVorname(v);
    setNeedsOnboarding(false);
  };

  return (
    <VornameContext.Provider value={{
      vorname,
      isLoading: authLoading || isLoading,
      needsOnboarding,
      setVornameLocal,
    }}>
      {children}
    </VornameContext.Provider>
  );
}

export function useVorname() {
  return useContext(VornameContext);
}
