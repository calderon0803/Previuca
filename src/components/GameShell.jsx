import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CircleQuestionMark, UsersRound } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import PageHeader from './ui/PageHeader';
import IconButton from './ui/IconButton';
import Screen, { Stage, Footer } from './ui/Screen';
import HowToPlayModal from './HowToPlayModal';
import PlayersModal from './PlayersModal';

// Plantilla de partida, común a los 10 juegos:
//
//   [barra con kicker + estado + acciones de 44px]
//   [barra de progreso opcional de 2px]
//   [zona de juego: flex:1, centrada]
//   [pie: acción primaria de 50px a ancho completo]
//
// La cabecera es el único sitio desde el que se editan los jugadores.

const ProgressTrack = styled.div`
  flex-shrink: 0;
  height: 2px;
  margin: 0 ${({ theme }) => theme.spacing(5)};
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 2px;
  background: ${({ $color }) => $color};
  width: ${({ $pct }) => $pct}%;
  transition: width 0.25s ease;
`;

export default function GameShell({
    gameId,
    status,
    onBack,
    progress,
    belowHeader,
    footer,
    stageGap,
    stageJustify,
    extraActions,
    showPlayers = true,
    showHelp = true,
    children,
}) {
    const navigate = useNavigate();
    const { players } = usePlayers();
    const [helpOpen, setHelpOpen] = useState(false);
    const [playersOpen, setPlayersOpen] = useState(false);

    const game = gameById[gameId];

    return (
        <Screen>
            <PageHeader
                kicker={game?.name}
                kickerColor={game?.kicker}
                status={status}
                onBack={onBack || (() => navigate(-1))}
                rightAction={
                    <>
                        {extraActions}
                        {showHelp && (
                            <IconButton onClick={() => setHelpOpen(true)} aria-label="Cómo se juega">
                                <CircleQuestionMark size={21} />
                            </IconButton>
                        )}
                        {showPlayers && (
                            <IconButton
                                badge={players.length}
                                onClick={() => setPlayersOpen(true)}
                                aria-label="Jugadores"
                            >
                                <UsersRound size={20} />
                            </IconButton>
                        )}
                    </>
                }
            />

            {belowHeader}

            {progress != null && (
                <ProgressTrack>
                    <ProgressFill
                        $pct={Math.max(0, Math.min(100, progress * 100))}
                        $color={game?.color}
                    />
                </ProgressTrack>
            )}

            <Stage $gap={stageGap} style={stageJustify ? { justifyContent: stageJustify } : undefined}>
                {children}
            </Stage>

            {footer && <Footer>{footer}</Footer>}

            {showHelp && (
                <HowToPlayModal
                    visible={helpOpen}
                    onClose={() => setHelpOpen(false)}
                    gameId={gameId}
                />
            )}
            {showPlayers && (
                <PlayersModal visible={playersOpen} onClose={() => setPlayersOpen(false)} />
            )}
        </Screen>
    );
}
