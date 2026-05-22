import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MDIProvider } from "@/contexts/MDIContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "@/pages/Home";
import Wissen from "@/pages/Wissen";
import { Impressum } from "@/pages/Impressum";
import { Datenschutz } from "@/pages/Datenschutz";
import AdminNewsletter from "@/pages/AdminNewsletter";
import UeberKiich from "@/pages/UeberKiich";
import NewsletterBestaetigen from "@/pages/NewsletterBestaetigen";
import NewsletterAbmelden from "@/pages/NewsletterAbmelden";
import NotFound from "@/pages/NotFound";
import Momentaufnahme from "@/pages/Momentaufnahme";
import MomentaufnahmeTeaser from "@/pages/MomentaufnahmeTeaser";
import MomentaufnahmeArchiv from "@/pages/MomentaufnahmeArchiv";
import ObsidianVerbinden from "@/pages/ObsidianVerbinden";
import Episoden from "@/pages/Episoden";
import AdminPremium from "@/pages/AdminPremium";
import AdminTraining from "@/pages/AdminTraining";
import AdminTrainingEinheiten from "@/pages/AdminTrainingEinheiten";
import EinschlafBibliothek from "@/pages/EinschlafBibliothek";
import AdminTts from "@/pages/AdminTts";
import AdminMaStimme from "@/pages/AdminMaStimme";
import FAQ from "@/pages/FAQ";
import Abo from "@/pages/Abo";
import AdminFaq from "@/pages/AdminFaq";
import AdminGeo from "@/pages/AdminGeo";
import AdminBacklog from "@/pages/AdminBacklog";
import AdminEpisoden from "@/pages/AdminEpisoden";
import AdminBenutzer from "@/pages/AdminBenutzer";
import AdminHub from "@/pages/AdminHub";
import AdminStatistik from "@/pages/AdminStatistik";
import Befindlichkeit from "@/pages/Befindlichkeit";
import { Nutzungsbedingungen } from "@/pages/Nutzungsbedingungen";
import { RechtsCheckliste } from "@/pages/RechtsCheckliste";
import CoachingDashboard from "@/pages/CoachingDashboard";
import Raum36 from "@/pages/Raum36";
import AdminZahlungen from "@/pages/AdminZahlungen";
import AdminRaum36 from "@/pages/AdminRaum36";
import WasIstKIICH from "@/pages/WasIstKIICH";
import KIICHFaq from "@/pages/KIICHFaq";
import Stimmklanganalyse from "@/pages/Stimmklanganalyse";
import HealthAttestation from "@/pages/HealthAttestation";
import { VornameProvider, useVorname } from "@/contexts/VornameContext";
import { OnboardingNameModal } from "@/components/OnboardingNameModal";
import { UpdateBanner } from "@/components/UpdateBanner";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wissen" component={Wissen} />
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
      <Route path="/newsletter/bestaetigen" component={NewsletterBestaetigen} />
      <Route path="/newsletter/abmelden" component={NewsletterAbmelden} />
      <Route path="/ueber-kiich" component={UeberKiich} />
      <Route path="/momentaufnahme" component={MomentaufnahmeTeaser} />
      <Route path="/momentaufnahme/app" component={Momentaufnahme} />
      <Route path="/momentaufnahme/archiv" component={MomentaufnahmeArchiv} />
      <Route path="/momentaufnahme/obsidian" component={ObsidianVerbinden} />
      <Route path="/obsidian" component={ObsidianVerbinden} />
      <Route path="/episoden" component={Episoden} />
      <Route path="/admin/premium" component={AdminPremium} />
      <Route path="/admin/training" component={AdminTraining} />
      <Route path="/admin/training-einheiten" component={AdminTrainingEinheiten} />
      <Route path="/admin/tts" component={AdminTts} />
      <Route path="/admin/ma-stimme" component={AdminMaStimme} />
      <Route path="/einschlafen" component={EinschlafBibliothek} />
      <Route path="/faq" component={FAQ} />
      <Route path="/abo" component={Abo} />
      <Route path="/admin/faq" component={AdminFaq} />
      <Route path="/admin/geo" component={AdminGeo} />
      <Route path="/admin/backlog" component={AdminBacklog} />
      <Route path="/admin/episoden" component={AdminEpisoden} />
      <Route path="/admin/benutzer" component={AdminBenutzer} />
      <Route path="/admin/statistik" component={AdminStatistik} />
      <Route path="/admin" component={AdminHub} />
      <Route path="/befindlichkeit" component={Befindlichkeit} />
      <Route path="/nutzungsbedingungen" component={Nutzungsbedingungen} />
      <Route path="/rechts-checkliste" component={RechtsCheckliste} />
      <Route path="/admin/coaching" component={CoachingDashboard} />
      <Route path="/admin/zahlungen" component={AdminZahlungen} />
      <Route path="/admin/raum36" component={AdminRaum36} />
      <Route path="/raum36" component={Raum36} />
      <Route path="/stimmklanganalyse" component={Stimmklanganalyse} />
      <Route path="/was-ist-kiich" component={WasIstKIICH} />
      <Route path="/kiich-faq" component={KIICHFaq} />
      <Route path="/account/health-attestation" component={HealthAttestation} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { needsOnboarding, setVornameLocal } = useVorname();
  return (
    <>
      <Router />
      <OnboardingNameModal
        open={needsOnboarding}
        onComplete={setVornameLocal}
      />
      <UpdateBanner />
      <PwaInstallBanner />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <MDIProvider>
          <TooltipProvider>
            <Toaster />
            <VornameProvider>
              <AppInner />
            </VornameProvider>
          </TooltipProvider>
        </MDIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
