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
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wissen" component={Wissen} />
      <Route path="/impressum" component={Impressum} />
      <Route path="/datenschutz" component={Datenschutz} />
      <Route path="/admin/newsletter" component={AdminNewsletter} />
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
