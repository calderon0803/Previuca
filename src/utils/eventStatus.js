const DAY_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_GRACE_MS = 48 * 60 * 60 * 1000;
const EARLY_VISIBILITY_MS = 7 * DAY_MS;

// Un evento pasa a "archivado" 48h después de su fecha de fin. Sin fecha
// de fin no hay forma de archivarlo automáticamente, así que se queda activo.
export const isEventArchived = (evento) => {
    if (!evento?.end_date) return false;
    return Date.now() > new Date(evento.end_date).getTime() + ARCHIVE_GRACE_MS;
};

export const getEventStatus = (evento) => (isEventArchived(evento) ? 'archivado' : 'activo');

// El evento "empieza" en su start_date; sin fecha, se considera siempre
// empezado (no hay dato con el que bloquear nada).
export const hasEventStarted = (evento) => {
    if (!evento?.start_date) return true;
    return Date.now() >= new Date(evento.start_date).getTime();
};

// Visible en el menú desde una semana antes de empezar, hasta que se archiva.
export const isEventVisibleInMenu = (evento) => {
    if (isEventArchived(evento)) return false;
    if (!evento?.start_date) return true;
    return Date.now() >= new Date(evento.start_date).getTime() - EARLY_VISIBILITY_MS;
};
