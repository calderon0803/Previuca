import { useEffect, useState } from 'react';

// El evento beforeinstallprompt solo llega si hay un listener puesto ANTES
// de que el navegador decida dispararlo, así que el listener vive a nivel
// de módulo (se registra en cuanto algo importa este archivo, no cuando un
// componente concreto monta) y guarda el evento fuera de React.
let deferredPrompt = null;
const listeners = new Set();

const notify = () => listeners.forEach((cb) => cb());

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event;
        notify();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        notify();
    });
}

export const isStandalone = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone === true);

export const getPlatform = () => {
    if (typeof navigator === 'undefined') return 'other';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'other';
};

export function usePwaInstall() {
    const [canInstall, setCanInstall] = useState(!!deferredPrompt);

    useEffect(() => {
        const update = () => setCanInstall(!!deferredPrompt);
        listeners.add(update);
        return () => listeners.delete(update);
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        deferredPrompt = null;
        notify();
        return choice.outcome === 'accepted';
    };

    return { canInstall, promptInstall };
}
