import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());

  useEffect(() => {
    if (isStandalone()) {
      window.localStorage.setItem('shaktii_installed', '1');
      setInstalled(true);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      if (!isStandalone()) {
        window.localStorage.removeItem('shaktii_installed');
        setInstalled(false);
        setPromptEvent(event as InstallPromptEvent);
      }
    };
    const onInstalled = () => {
      window.localStorage.setItem('shaktii_installed', '1');
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed || isStandalone() || !promptEvent) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      window.localStorage.setItem('shaktii_installed', '1');
      setInstalled(true);
    }
    setPromptEvent(null);
  }

  return <button onClick={() => void install()} className="rounded-md border border-white/10 px-3 py-2 text-xs text-white/65 hover:bg-white/5 hover:text-white">Install app</button>;
}
