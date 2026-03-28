import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export function PWAUpdater() {
  const { toast } = useToast();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
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
                // New content is available, show toast
                toast({
                  title: "Neue Version verfügbar",
                  description: "Eine neue Version der App ist verfügbar. Bitte aktualisieren, um die neuesten Funktionen zu nutzen.",
                  action: (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                      }}
                    >
                      Aktualisieren
                    </Button>
                  )
                });
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
    }
  }, [toast]);

  return null;
}
