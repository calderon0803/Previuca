// Utilidades de color compartidas por el chrome del rediseño.

/** Convierte `#rrggbb` (o `#rgb`) en `rgba(r, g, b, alpha)`. */
export function withAlpha(hex, alpha) {
    const raw = String(hex || '').replace('#', '');
    const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    if (full.length !== 6) return hex;
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Halo radial por defecto de un color de firma (alfa .2). */
export function glowOf(hex, alpha = 0.2) {
    return withAlpha(hex, alpha);
}

/** Luminancia percibida 0-255, para decidir texto claro u oscuro encima. */
export function luminance(hex) {
    const raw = String(hex || '').replace('#', '').padEnd(6, '0');
    return (
        0.299 * parseInt(raw.slice(0, 2), 16) +
        0.587 * parseInt(raw.slice(2, 4), 16) +
        0.114 * parseInt(raw.slice(4, 6), 16)
    );
}
