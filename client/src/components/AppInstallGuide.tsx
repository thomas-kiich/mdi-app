import { X, Smartphone, Apple, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppInstallGuideProps {
  onClose: () => void;
}

export function AppInstallGuide({ onClose }: AppInstallGuideProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 md:p-8 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            MDI als App installieren
          </h2>
          <p className="text-zinc-400">
            Du kannst diese Anwendung direkt auf deinem Homescreen speichern, um sie wie eine native App zu nutzen – ganz ohne App Store.
          </p>
        </div>

        <div className="space-y-8">
          {/* iOS Guide */}
          <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Apple className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white">Für iPhone / iPad (Safari)</h3>
            </div>
            <ol className="space-y-4 text-zinc-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">1</span>
                <span>Tippe unten in der Safari-Menüleiste auf das <strong>Teilen-Symbol</strong> (Viereck mit Pfeil nach oben).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">2</span>
                <span>Scrolle in der Liste etwas nach unten und wähle <strong>"Zum Home-Bildschirm"</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">3</span>
                <span>Bestätige oben rechts mit <strong>"Hinzufügen"</strong>.</span>
              </li>
            </ol>
          </div>

          {/* Android Guide */}
          <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700/50">
            <div className="flex items-center gap-3 mb-4">
              <MonitorSmartphone className="w-6 h-6 text-white" />
              <h3 className="text-xl font-bold text-white">Für Android (Chrome)</h3>
            </div>
            <ol className="space-y-4 text-zinc-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">1</span>
                <span>Tippe oben rechts im Browser auf das <strong>Menü-Symbol</strong> (drei Punkte).</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">2</span>
                <span>Wähle im Menü die Option <strong>"App installieren"</strong> oder <strong>"Zum Startbildschirm zufügen"</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm">3</span>
                <span>Bestätige den Vorgang mit <strong>"Installieren"</strong> bzw. <strong>"Hinzufügen"</strong>.</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 w-full sm:w-auto px-8"
          >
            Verstanden, zurück zur Seite
          </Button>
        </div>
      </div>
    </div>
  );
}
