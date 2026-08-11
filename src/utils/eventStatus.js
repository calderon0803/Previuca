const DAY_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_GRACE_MS = 48 * 60 * 60 * 1000;
const EARLY_VISIBILITY_MS = 7 * DAY_MS;

// eventos.start_date/end_date llegan como "YYYY-MM-DD" (columna DATE, sin
// hora). new Date(esaCadena) las interpreta como medianoche UTC, no
// medianoche en la hora local del usuario — con eso el día de inicio
// empieza tarde y el de fin se corta antes de tiempo. Aquí se parsean a
// mano para anclarlas a las 00:00 o 23:59:59 en la hora local, para que
// el día completo (de principio a fin) cuente como parte del evento.
const parseLocalDateBoundary = (dateString, endOfDay) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return endOfDay
        ? new Date(year, month - 1, day, 23, 59, 59, 999)
        : new Date(year, month - 1, day, 0, 0, 0, 0);
};

// Un evento pasa a "archivado" 48h después de acabar su fecha de fin (a
// las 23:59:59 de ese día). Sin fecha de fin no hay forma de archivarlo
// automáticamente, así que se queda activo.
export const isEventArchived = (evento) => {
    if (!evento?.end_date) return false;
    return Date.now() > parseLocalDateBoundary(evento.end_date, true).getTime() + ARCHIVE_GRACE_MS;
};

export const getEventStatus = (evento) => (isEventArchived(evento) ? 'archivado' : 'activo');

// El evento "empieza" a las 00:00 de su start_date; sin fecha, se
// considera siempre empezado (no hay dato con el que bloquear nada).
export const hasEventStarted = (evento) => {
    if (!evento?.start_date) return true;
    return Date.now() >= parseLocalDateBoundary(evento.start_date, false).getTime();
};

// Visible en el menú desde una semana antes de empezar, hasta que se archiva.
export const isEventVisibleInMenu = (evento) => {
    if (isEventArchived(evento)) return false;
    if (!evento?.start_date) return true;
    return Date.now() >= parseLocalDateBoundary(evento.start_date, false).getTime() - EARLY_VISIBILITY_MS;
};
