import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    overscroll-behavior: none;
    overflow: hidden;
    position: fixed;
    width: 100%;
    height: 100%;
    -webkit-tap-highlight-color: transparent;
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    overscroll-behavior: none;
    position: fixed;
    width: 100%;
    height: 100%;
    -webkit-overflow-scrolling: touch;
  }
  
  #root {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    line-height: 1.5;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: none;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  a {
    -webkit-tap-highlight-color: transparent;
  }

  button:focus,
  a:focus,
  input:focus,
  textarea:focus,
  select:focus,
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible {
    outline: none;
  }

  ::selection {
    background: ${({ theme }) => theme.colors.primaryMuted};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.neutral[700]};
    border-radius: ${({ theme }) => theme.radii.pill};
  }
`;
