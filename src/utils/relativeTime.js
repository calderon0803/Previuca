const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

// "hace Xm/h/d"; más allá de una semana, muestra la fecha corta.
export const formatRelativeTime = (isoDate) => {
    if (!isoDate) return '';
    const diff = Date.now() - new Date(isoDate).getTime();

    if (diff < MINUTE_MS) return 'ahora';
    if (diff < HOUR_MS) return `hace ${Math.floor(diff / MINUTE_MS)}m`;
    if (diff < DAY_MS) return `hace ${Math.floor(diff / HOUR_MS)}h`;
    if (diff < 7 * DAY_MS) return `hace ${Math.floor(diff / DAY_MS)}d`;

    return new Date(isoDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};
