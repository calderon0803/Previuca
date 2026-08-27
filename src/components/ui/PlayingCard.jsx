import React from 'react';
import styled, { css } from 'styled-components';
import { Spade, Heart, Diamond, Club } from 'lucide-react';
import { withAlpha } from '../../utils/color';

// Carta de baraja compartida por los tres juegos que usan cartas (Rey de
// Copas, Pico Palo, Illuminati). El reverso lo pinta este componente, no
// quien lo usa: los cuatro palos de la baraja (♠♥♦♣), siempre en el mismo
// sitio y el mismo color, para que ningún juego pueda acabar con un reverso
// distinto a los demás. Lo único que varía con el tamaño es cuánto sitio hay
// para el texto y para los propios palos.
//
//   lg   — carta única a pantalla completa (Rey de Copas: la carta robada)
//   md   — carta única de tamaño medio (Pico Palo: la carta en juego)
//   deck — reverso para elegir del mazo (Rey de Copas: las 5 cartas a robar)
//   sm   — carta pequeña en rejilla (Illuminati: la pirámide)
//   xs   — carta diminuta de historial (Pico Palo: cartas ya jugadas; nunca
//          se muestra boca abajo)
const SIZES = {
    lg: { w: 150, h: 210, radius: 8, shadow: '0 16px 40px rgba(0, 0, 0, 0.65)', value: 62, suit: 36, glyph: 18, gap: 6 },
    md: { w: 132, h: 188, radius: 8, shadow: '0 6px 18px rgba(0, 0, 0, 0.55)', value: 46, suit: 38, glyph: 15, gap: 5 },
    deck: { w: 88, h: 124, radius: 8, shadow: '0 6px 18px rgba(0, 0, 0, 0.55)', value: 0, suit: 0, glyph: 12, gap: 4 },
    sm: { w: 46, h: 62, radius: 6, shadow: 'none', value: 15, suit: 13, glyph: 8, gap: 2 },
    xs: { w: 34, h: 46, radius: 4, shadow: 'none', value: 12, suit: 12, glyph: 0, gap: 0 },
};

const CardShell = styled.div`
  position: relative;
  flex-shrink: 0;
  width: ${({ $size }) => SIZES[$size].w}px;
  height: ${({ $size }) => SIZES[$size].h}px;
  border-radius: ${({ $size }) => SIZES[$size].radius}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  opacity: ${({ $dim }) => ($dim ? 0.55 : 1)};
  transition: transform ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    opacity ${({ theme }) => theme.transitions.fast};

  ${({ $face, $size, theme }) =>
        $face
            ? css`
          background: ${theme.colors.text.primary};
          box-shadow: ${SIZES[$size].shadow};
        `
            : css`
          background: linear-gradient(160deg, #2b2741, #1c1e2c);
          box-shadow: ${SIZES[$size].shadow};
        `}

  border: 1px solid
    ${({ $face, $selected, $clickable, theme }) =>
        $face
            ? 'transparent'
            : $selected
                ? theme.colors.accent
                : $clickable
                    ? '#5d5294'
                    : withAlpha(theme.colors.accent, 0.4)};

  &:hover {
    ${({ $face, $clickable, theme }) =>
        !$face &&
        $clickable &&
        css`
        transform: translateY(-4px);
        border-color: ${theme.colors.accent};
      `}
  }

  &:active {
    ${({ $face, $clickable }) =>
        !$face &&
        $clickable &&
        css`
        transform: translateY(0);
      `}
  }
`;

const BackPattern = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ $size }) => SIZES[$size].gap}px;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.accentText};
`;

/**
 * Carta de baraja. Boca arriba (`$face`) muestra lo que se le pase como
 * `children` (valor y palo); boca abajo siempre pinta ella misma los cuatro
 * palos de la baraja — nadie más decide el reverso.
 */
export function PlayingCard({ $size, $face, children, ...rest }) {
    const glyph = SIZES[$size].glyph;
    return (
        <CardShell $size={$size} $face={$face} {...rest}>
            {$face ? (
                children
            ) : (
                glyph > 0 && (
                    <BackPattern $size={$size} aria-hidden="true">
                        <Spade size={glyph} />
                        <Heart size={glyph} />
                        <Diamond size={glyph} />
                        <Club size={glyph} />
                    </BackPattern>
                )
            )}
        </CardShell>
    );
}

export const CardValue = styled.span`
  position: relative;
  font-size: ${({ $size }) => SIZES[$size].value}px;
  line-height: 1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ $ink }) => $ink};
`;

export const CardSuit = styled.span`
  position: relative;
  font-size: ${({ $size }) => SIZES[$size].suit}px;
  margin-top: ${({ $size }) => ($size === 'lg' ? '6px' : $size === 'md' ? '4px' : '1px')};
  color: ${({ $ink }) => $ink};
`;

export default PlayingCard;
