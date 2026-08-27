import React from 'react';
import styled from 'styled-components';

// Tarjeta de juego. Tres tamaños dan ritmo a la rejilla:
//   wide → dos columnas, 156px    std → una columna, 132px    row → dos columnas, 92px
// La línea de firma y el halo del propio juego son lo que da variedad.

const SIZES = {
    wide: { span: 'span 2', height: '156px', icon: 72, iconTop: '14px', name: '24px' },
    std: { span: 'auto', height: '132px', icon: 46, iconTop: '14px', name: '17px' },
    row: { span: 'span 2', height: '92px', icon: 40, iconTop: '26px', name: '17px' },
};

const Card = styled.button`
  grid-column: ${({ $span }) => $span};
  position: relative;
  overflow: hidden;
  height: ${({ $height }) => $height};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3.5)};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  transition: border-color ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:active {
    transform: scale(0.99);
  }
`;

const Line = styled.span`
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

const Halo = styled.span`
  position: absolute;
  right: -16px;
  bottom: -24px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, ${({ $glow }) => $glow}, transparent 70%);
`;

const Glyph = styled.span`
  position: absolute;
  right: 10px;
  top: ${({ $top }) => $top};
  display: flex;
  opacity: 0.55;
  color: ${({ $color }) => $color};
  pointer-events: none;
`;

const Name = styled.span`
  position: relative;
  font-size: ${({ $size }) => $size};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Tagline = styled.span`
  position: relative;
  margin-top: 3px;
  max-width: 88%;
  font-size: 12px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const NeedsPill = styled.span`
  position: relative;
  margin-top: ${({ theme }) => theme.spacing(2)};
  display: inline-flex;
  align-items: center;
  padding: 3px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
  border: 1px solid #5d5294;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accentText};
`;

export default function GameModeCard({ game, onClick, missing = 0 }) {
    const size = SIZES[game.size] || SIZES.std;
    const Icon = game.icon;

    return (
        <Card
            $span={size.span}
            $height={size.height}
            onClick={onClick}
            aria-label={game.name}
        >
            <Line $color={game.color} aria-hidden="true" />
            <Halo $glow={game.glow} aria-hidden="true" />
            <Glyph $color={game.color} $top={size.iconTop} aria-hidden="true">
                <Icon size={size.icon} strokeWidth={1.5} />
            </Glyph>
            <Name $size={size.name}>{game.name}</Name>
            <Tagline>{game.tagline}</Tagline>
            {missing > 0 && (
                <NeedsPill>
                    {missing === 1 ? 'falta 1 jugador' : `faltan ${missing} jugadores`}
                </NeedsPill>
            )}
        </Card>
    );
}
