import styled from 'styled-components';

// Tarjeta / fila / panel: fondo `surface`, borde de 1px y radio de 8px.
// `position: relative; overflow: hidden` para poder recortar la línea de firma
// y el halo (ver `Signature`).
const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, $hairline }) => ($hairline ? theme.colors.border : theme.colors.borderStrong)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme, $padding }) => theme.spacing($padding ?? 5)};
  position: relative;
  overflow: hidden;
  transition: border-color ${({ theme }) => theme.transitions.base},
    background ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  ${({ $interactive, theme }) =>
        $interactive &&
        `
      cursor: pointer;
      &:hover {
        border-color: ${theme.colors.borderHover};
      }
      &:active {
        transform: scale(0.995);
      }
    `}
`;

export default Card;
