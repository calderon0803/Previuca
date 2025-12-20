export const theme = {
    colors: {
        primary: '#BA0057', // Deep Pink/Magenta
        secondary: '#FFD800', // Gold/Yellow
        background: '#0F0109', // Deep Dark Purple (Nearly Black)
        surface: 'rgba(255, 255, 255, 0.05)', // Subtle glass surface
        error: '#FF3B30',
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.6)',
            disabled: 'rgba(255, 255, 255, 0.3)',
        },
        border: 'rgba(255, 255, 255, 0.1)', // Subtle layout borders
        background: '#222B56',
    },
    typography: {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        fontSize: {
            small: '0.875rem',
            medium: '1rem',
            large: '1.25rem',
            xlarge: '1.5rem',
            xxlarge: '2rem',
        },
        fontWeight: {
            regular: 400,
            medium: 500,
            bold: 700,
        },
    },
    spacing: (factor) => `${0.25 * factor}rem`,
    breakpoints: {
        mobile: '768px',
        tablet: '1024px',
    },
};
