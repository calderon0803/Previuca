export const theme = {
    colors: {
        primary: '#BA0057', // Deep Pink/Magenta - Main Background
        secondary: '#FFD800', // Gold/Yellow - Borders
        background: '#BA0057', // App Background
        surface: 'rgba(255, 255, 255, 0.1)', // Semi-transparent white for cards
        error: '#FF5252',
        text: {
            primary: '#FFFFFF', // White text for contrast on Pink
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
        },
        border: '#FFD800', // Explicit border color
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
