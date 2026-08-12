import { useRegisterSW } from 'virtual:pwa-register/react';

// Con registerType:'prompt', el service worker nuevo se queda "esperando"
// hasta que el usuario confirma la actualización — a diferencia de
// 'autoUpdate', que recarga la app solo, en segundo plano y sin avisar
// (chocaba con este banner). useRegisterSW distingue la instalación
// inicial de una actualización real, así que el aviso solo sale cuando
// de verdad hay una versión nueva.
const CHECK_INTERVAL_MS = 30 * 60 * 1000;

export function useAppUpdate() {
    const {
        needRefresh: [needRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegisteredSW(swUrl, registration) {
            if (!registration) return;

            const checkForUpdate = () => registration.update().catch(() => {});

            setInterval(checkForUpdate, CHECK_INTERVAL_MS);
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible') checkForUpdate();
            });
        },
    });

    return { updateAvailable: needRefresh, reloadApp: () => updateServiceWorker(true) };
}
