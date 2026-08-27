import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Movimiento del rediseño: entrada de pantalla, hoja inferior y resultado. */
  @keyframes pv-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }

  @keyframes pv-up {
    from { transform: translateY(100%); }
    to { transform: none; }
  }

  @keyframes pv-pop {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: none; }
  }

  html {
    overscroll-behavior: none;
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    height: 100dvh;
    -webkit-tap-highlight-color: transparent;
    background: ${({ theme }) => theme.colors.background};
    /* Solo panorámica, nunca pellizcar para hacer zoom — el meta viewport ya
       lo pide, pero algunos navegadores de Android lo ignoran salvo que
       también se lo digamos por CSS. */
    touch-action: pan-x pan-y;
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: 15px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    overscroll-behavior: none;
    position: fixed;
    width: 100%;
    height: 100%;
    height: 100dvh;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y;
  }

  #root {
    width: 100%;
    height: 100%;
    height: 100dvh;
    overflow-y: auto;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }

  code {
    font-family: ${({ theme }) => theme.typography.monoFamily};
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  p {
    margin: 0;
    line-height: 1.5;
  }

  a {
    color: inherit;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  button {
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  /* Sin anillo con el ratón; anillo de acento con teclado. */
  button:focus,
  a:focus,
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
  }

  /* box-shadow en vez de outline: el outline del navegador siempre dibuja un
     rectángulo de esquinas cuadradas, sin importar el border-radius del
     elemento — en botones, campos y filas redondeadas se veía un anillo que
     no encajaba con la forma. box-shadow sí sigue el border-radius. */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.accent};
  }

  ::selection {
    background: ${({ theme }) => theme.colors.accentTint};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  ::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;
