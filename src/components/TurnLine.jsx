import styled from 'styled-components';

// A quién le toca, en una sola línea compacta. Antes cada partida lo decía
// de una forma distinta: un bloque grande de 30px en el centro (Rey de
// Copas, Impostor, Asesino), solo en la cabecera con redacción distinta en
// cada juego (Pico Palo, Illuminati, Dados, Ruleta), o no se decía en ningún
// sitio visible. Ahora es el mismo componente, con el mismo tamaño y el
// mismo texto, en los siete.
const Line = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(5)};
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Name = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export default function TurnLine({ name }) {
    return (
        <Line>
            Turno de <Name>{name}</Name>
        </Line>
    );
}
