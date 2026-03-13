import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white p-4 animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Ups, ein Fehler.</h2>
              <p className="text-zinc-400 text-sm">
                Ein unerwarteter Fehler ist aufgetreten. Wir haben das Problem protokolliert.
              </p>
            </div>

            <div className="bg-black/50 p-4 rounded-lg text-left overflow-auto max-h-32 text-xs font-mono text-red-400 border border-red-900/30">
              {this.state.error?.message || "Unbekannter Fehler"}
            </div>

            <Button 
              onClick={this.handleReload} 
              className="w-full bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Seite neu laden
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
