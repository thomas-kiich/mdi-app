import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Wissen from "@/pages/Wissen";
import { Impressum } from "@/pages/Impressum";
import { Datenschutz } from "@/pages/Datenschutz";

function App() {
  return (
    <ThemeProvider>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/wissen" component={Wissen} />
        <Route path="/impressum" component={Impressum} />
        <Route path="/datenschutz" component={Datenschutz} />
        <Route>404 Page Not Found</Route>
      </Switch>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
