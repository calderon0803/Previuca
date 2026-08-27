import styled from 'styled-components';

/** Etiqueta en mayúsculas: `500 11px`, `letter-spacing: .1em`. */
const Kicker = styled.p`
  margin: 0;
  font-size: ${({ $size = '11px' }) => $size};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: ${({ $tracking }) => $tracking || '0.1em'};
  color: ${({ theme, $color }) => $color || theme.colors.text.faint};
  line-height: 1.2;
`;

export default Kicker;
