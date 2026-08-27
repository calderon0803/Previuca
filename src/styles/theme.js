// Design tokens — single source of truth for the app's visual language.
// Every styled-component should read from here instead of hardcoding values.
//
// Rediseño «Previuca, de noche»: fondo casi negro, una sola familia de acento
// (blurple) para el chrome, y el color saturado reservado para identificar cada
// juego o actividad (ver `src/data/games.js`).

// Escala neutra oscura: 50 = más claro (texto), 950 = más oscuro (fondo).
const neutral = {
    50: '#e9e9ed',
    100: '#cfd3e5',
    200: '#b2b6ca',
    300: '#9397ab',
    400: '#75798c',
    500: '#595d6c',
    600: '#3f424d',
    700: '#292b31',
    800: '#232532',
    900: '#1c1e2c',
    950: '#161826',
};

// Acento único del chrome — blurple.
const accent = {
    base: '#9184d9',
    text: '#b5abfc',
    tint: 'rgba(145, 132, 217, 0.14)',
    tintStrong: 'rgba(145, 132, 217, 0.2)',
    surface: '#2b2741',
};

// Paleta de peñas (18 valores) — la que ya usa CreatePena.
export const penaColors = [
    '#E5484D', '#D9455B', '#B23A63', '#D9377E', '#C23FA0', '#8A5FD9',
    '#6E56CF', '#3F8CD9', '#3FA0D9', '#3FA9A0', '#3FA772', '#5FA83F',
    '#8FB93F', '#D9C23F', '#D9A54B', '#D97C3F', '#D95F5F', '#7C818C',
];

// Colores de firma de las actividades del evento.
export const activityColors = {
    penas: { color: '#3FA772', glow: 'rgba(63, 167, 114, 0.2)', kicker: '#3FA772' },
    album: { color: '#C9862E', glow: 'rgba(201, 134, 46, 0.2)', kicker: '#D8B45E' },
    flechazo: { color: '#D9377E', glow: 'rgba(217, 55, 126, 0.2)', kicker: '#E67BA6' },
    salseo: { color: '#3F8CD9', glow: 'rgba(63, 140, 217, 0.2)', kicker: '#7FB4EC' },
    event: { color: accent.base, glow: 'rgba(145, 132, 217, 0.2)', kicker: accent.text },
};

export const theme = {
    colors: {
        neutral,
        penaColors,
        activityColors,

        // El acento del chrome hace de «primary» para todo el interfaz.
        primary: accent.base,
        primaryHover: accent.text,
        primaryActive: accent.base,
        primaryMuted: accent.tint,
        accent: accent.base,
        accentText: accent.text,
        accentTint: accent.tint,
        accentTintStrong: accent.tintStrong,
        accentSurface: accent.surface,
        accentMuted: accent.tint,

        background: '#161826',
        backgroundDeep: '#12131c',
        backgroundApp: '#0f1018',
        surface: '#1c1e2c',
        surfaceHover: '#232532',
        surfaceRaised: '#232532',
        surfaceInput: '#161826',

        overlay: 'rgba(10, 11, 18, 0.72)',
        overlayStrong: 'rgba(10, 11, 18, 0.86)',

        border: '#292b31',
        borderStrong: '#3f424d',
        borderHover: '#595d6c',

        text: {
            primary: '#e9e9ed',
            secondary: '#b2b6ca',
            muted: '#9397ab',
            faint: '#75798c',
            disabled: '#595d6c',
        },

        success: '#7fc39a',
        error: '#e08a8f',
        errorBorder: '#7a3a40',
        errorTint: 'rgba(160, 60, 66, 0.14)',
        danger: '#e08a8f',
        dangerBorder: '#7a3a40',
        dangerTint: 'rgba(160, 60, 66, 0.14)',
        warning: '#D8B45E',
    },

    // Radio único de 8px en todo; lg reservado a hojas inferiores.
    radii: {
        sm: '8px',
        md: '8px',
        lg: '14px',
        pill: '999px',
    },

    // Elevación = borde + oscuridad ambiental, nunca sombras apiladas.
    shadows: {
        hairline: '0 0 0 1px #292b31',
        sm: '0 0 0 1px #292b31',
        md: '0 6px 18px rgba(0, 0, 0, 0.55)',
        lg: '0 0 0 1px #3f424d, 0 16px 40px rgba(0, 0, 0, 0.65)',
        sheet: '0 0 0 1px #3f424d, 0 16px 40px rgba(0, 0, 0, 0.65)',
    },

    transitions: {
        fast: '150ms ease',
        base: '220ms ease',
    },

    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        monoFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        fontSize: {
            xs: '11.5px',
            sm: '12.5px',
            md: '15px',
            lg: '19px',
            xl: '22px',
            xxl: '30px',
            display: '34px',
        },
        // Nunca por encima de 600.
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 600,
        },
        letterSpacing: {
            tight: '-0.03em',
            snug: '-0.02em',
            normal: '-0.01em',
            wide: '0.1em',
            wider: '0.14em',
        },
    },

    spacing: (factor) => `${0.25 * factor}rem`,

    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
    },
};
