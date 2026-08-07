// Design tokens — single source of truth for the app's visual language.
// Every styled-component should read from here instead of hardcoding values.

// Escala neutra clara, tono ciruela/gris muy desaturado — ni negro puro
// (texto) ni blanco puro (fondo). 50 = más claro, 950 = más oscuro.
const neutral = {
    50: '#F8F5F6',
    100: '#EFEAEC',
    200: '#D2C5CB',
    300: '#B5A6AE',
    400: '#A79DA5',
    500: '#847A83',
    600: '#665D65',
    700: '#4A424A',
    800: '#332C33',
    900: '#241F26',
    950: '#171317',
};

// Fondo de página: pastel cálido (blush), distinto de la rampa gris de
// arriba — así las tarjetas (blancas) resaltan sobre un fondo con color,
// en vez de un blanco/gris plano.
const pastelBackground = '#F7ECE7';

const primary = {
    base: '#B23A63',
    hover: '#C4507A',
    active: '#8F2C4E',
    muted: 'rgba(178, 58, 99, 0.12)',
};

const accent = {
    base: '#996022',
    muted: 'rgba(153, 96, 34, 0.16)',
};

export const theme = {
    colors: {
        neutral,
        primary: primary.base,
        primaryHover: primary.hover,
        primaryActive: primary.active,
        primaryMuted: primary.muted,
        accent: accent.base,
        accentMuted: accent.muted,

        background: pastelBackground,
        surface: '#FFFFFF',
        surfaceHover: neutral[50],
        surfaceRaised: neutral[50],

        border: neutral[200],
        borderStrong: neutral[300],

        text: {
            primary: neutral[900],
            secondary: neutral[600],
            disabled: neutral[400],
        },

        success: '#297D50',
        error: '#D2373D',
        warning: accent.base,
    },

    // sm: controls (buttons, inputs, tags). md: cards/tiles. lg: large sheets/modals only.
    radii: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        pill: '999px',
    },

    shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.28)',
        md: '0 4px 14px rgba(0, 0, 0, 0.32)',
        lg: '0 12px 28px rgba(0, 0, 0, 0.36)',
    },

    transitions: {
        fast: '150ms ease',
        base: '200ms ease',
    },

    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.5rem',
            xxl: '2rem',
            display: '2.75rem',
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
        letterSpacing: {
            tight: '-0.03em',
            snug: '-0.01em',
            normal: '0',
            wide: '0.06em',
            wider: '0.1em',
        },
    },

    spacing: (factor) => `${0.25 * factor}rem`,

    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
        desktop: '1440px',
    },
};
