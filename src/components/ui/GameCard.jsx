import styled from 'styled-components';

/**
 * Tarjeta de contenido dentro de una partida: superficie elevada sobre el
 * fondo, hairline claro y una sombra ambiental. Recorta la línea de firma.
 */
const GameCard = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong},
    0 6px 18px rgba(0, 0, 0, 0.55);
  padding: ${({ theme, $padding }) => $padding || `${theme.spacing(7.5)} ${theme.spacing(6.5)}`};
  box-sizing: border-box;
  animation: pv-pop 0.22s ease;
`;

export default GameCard;
