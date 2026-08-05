// Design tokens — single source of truth for the app's visual language.
// Every styled-component should read from here instead of hardcoding values.

const neutral = {
    950: '#0A0B0E',
    900: '#121317',
    800: '#191B20',
    700: '#23262D',
    600: '#2E323B',
    500: '#454A55',
    400: '#5C616D',
    300: '#7C818C',
    200: '#A6ABB4',
    100: '#D2D4D9',
    50: '#F5F6F7',
};

const primary = {
    base: '#B23A63',
    hover: '#C4507A',
    active: '#8F2C4E',
    muted: 'rgba(178, 58, 99, 0.14)',
};

const accent = {
    base: '#D9A54B',
    muted: 'rgba(217, 165, 75, 0.16)',
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

        background: neutral[950],
        surface: neutral[900],
        surfaceHover: neutral[800],
        surfaceRaised: neutral[800],

        border: neutral[700],
        borderStrong: neutral[600],

        text: {
            primary: neutral[50],
            secondary: neutral[300],
            disabled: neutral[500],
        },

        success: '#3FA772',
        error: '#E5484D',
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
