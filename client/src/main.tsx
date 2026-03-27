import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 1000 * 60 * 60); // Every hour

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, force update
              console.log('New version available, reloading...');
              window.location.reload();
            }
          });
        }
      });
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });

    // Handle service worker taking control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
