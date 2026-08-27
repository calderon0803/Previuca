import React from 'react';
import styled from 'styled-components';
import { withAlpha } from '../../utils/color';

// Línea de firma y halo: el patrón que da variedad a las tarjetas y paneles
// sin ensuciar la pantalla. El contenedor necesita `position: relative;
// overflow: hidden` y los hijos de contenido `position: relative`.

export const SignatureLine = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    transparent,
    ${({ $color }) => $color} 40px,
    ${({ $color }) => $color} calc(100% - 40px),
    transparent
  );
`;

export const SignatureHalo = styled.span`
  position: absolute;
  right: ${({ $right = '-10px' }) => $right};
  top: ${({ $top = 'auto' }) => $top};
  bottom: ${({ $top, $bottom = '-24px' }) => ($top ? 'auto' : $bottom)};
  width: ${({ $size = '110px' }) => $size};
  height: ${({ $size = '110px' }) => $size};
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, ${({ $glow }) => $glow}, transparent 70%);
`;

/** Línea + halo de un color de firma. `glow` es opcional (se deriva del color). */
export default function Signature({ color, glow, haloSize, haloRight, haloBottom }) {
    if (!color) return null;
    return (
        <>
            <SignatureLine $color={color} aria-hidden="true" />
            <SignatureHalo
                $glow={glow || withAlpha(color, 0.2)}
                $size={haloSize}
                $right={haloRight}
                $bottom={haloBottom}
                aria-hidden="true"
            />
        </>
    );
}
