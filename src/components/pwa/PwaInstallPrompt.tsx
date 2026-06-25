'use client';

import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI to show the install button
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Hide if already running in standalone/app mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA install prompt outcome: ${outcome}`);
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-card border border-border p-4 rounded-2xl shadow-xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Install LibSphere App</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Access the library directly from your home screen as a mobile/desktop app.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Close prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg shadow-md shadow-primary/10 hover:opacity-90 transition-all"
        >
          Install App
        </button>
        <button
          onClick={() => setShowPrompt(false)}
          className="px-4 py-2 border border-border text-xs font-semibold rounded-lg hover:bg-accent text-foreground transition-all"
        >
          Not Now
        </button>
      </div>
    </div>
  );
}
