import { useEffect, useState } from 'react';

// El service worker (vite-plugin-pwa, registerType:'autoUpdate') se
// actualiza solo en segundo plano, pero la pestaña que ya está abierta
// sigue con el JS viejo en memoria hasta que se recarga. 'controllerchange'
// es el aviso de que un SW nuevo ya ha tomado el control — a partir de ahí
// solo falta que el usuario recargue para usar la versión nueva de verdad.
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export function useAppUpdate() {
    const [updateAvailable, setUpdateAvailable] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        let registration = null;
        let refreshing = false;

        const checkForUpdate = () => {
            registration?.update().catch(() => {});
        };

        navigator.serviceWorker.getRegistration().then((reg) => {
            registration = reg;
            checkForUpdate();
        });

        const onControllerChange = () => {
            if (refreshing) return;
            refreshing = true;
            setUpdateAvailable(true);
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') checkForUpdate();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);

        const interval = setInterval(checkForUpdate, CHECK_INTERVAL_MS);

        return () => {
            navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
            document.removeEventListener('visibilitychange', onVisibilityChange);
            clearInterval(interval);
        };
    }, []);

    return { updateAvailable, reloadApp: () => window.location.reload() };
}
