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
      <Route path="/momentaufnahme" component={Momentaufnahme} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <MDIProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </MDIProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
