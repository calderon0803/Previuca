import React from 'react';
import styled from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import IconButton from './IconButton';

// Barra de navegación de pantalla. Dos variantes:
//   1. Con estado (partidas, evento, álbum, flechazo, salseos): kicker en el
//      color del juego + línea de estado debajo.
//   2. Solo título (peñas, escanear, ajustes, admin): h1 de 500 19px.

const Bar = styled.header`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 4px 12px 8px;
  padding-top: calc(4px + env(safe-area-inset-top, 0px));
  background: ${({ theme }) => theme.colors.background};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Center = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 ${({ theme }) => theme.spacing(1)};
`;

const KickerLine = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme, $color }) => $color || theme.colors.accentText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StatusLine = styled.p`
  margin: 0;
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.muted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Title = styled.h1`
  font-size: 19px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
`;

export default function PageHeader({
    title,
    kicker,
    kickerColor,
    status,
    onBack,
    rightAction,
}) {
    return (
        <Bar>
            {onBack && (
                <IconButton variant="ghost" onClick={onBack} aria-label="Volver">
                    <ArrowLeft size={22} />
                </IconButton>
            )}
            <Center>
                {kicker ? (
                    <>
                        <KickerLine $color={kickerColor}>{kicker}</KickerLine>
                        {status && <StatusLine>{status}</StatusLine>}
                    </>
                ) : (
                    title && <Title>{title}</Title>
                )}
            </Center>
            {rightAction && <Actions>{rightAction}</Actions>}
        </Bar>
    );
}
