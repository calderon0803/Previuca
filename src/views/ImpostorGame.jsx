import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { VenetianMask } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { randomTopic } from '../data/impostorWords';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import TurnLine from '../components/TurnLine';
import HoldToReveal from '../components/HoldToReveal';
import Button from '../components/ui/Button';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import { SignatureLine } from '../components/ui/Signature';

const GAME = gameById.impostor;

// Kicker siempre neutro: el contraste con la palabra/rol en grande es lo que
// da jerarquía. Si el kicker también se tiñe de rojo, todo el bloque se ve
// como una mancha monocroma sin foco.
const RoleLabel = styled.span`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.14em;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

// Mismo dato, misma etiqueta en las dos caras: es el tema del que sale la
// palabra, y le sirve de pista al impostor solo porque no tiene la palabra —
// llamarlo "pista" únicamente en su cara sugeriría que es una información
// distinta. Antes el impostor tenía además una frase de relleno ("Tira por
// ahí...") que no aportaba nada — esa indicación ya está en las reglas.
const ThemeNote = styled.span`
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding: 0 ${({ theme }) => theme.spacing(5)};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
`;

// Mismo tamaño en las dos caras: para el impostor esto ya no es la temática
// (que puede ser larga y variar de longitud) sino la palabra fija "Impostor",
// así que no necesita encogerse para no desbordar.
const SecretWord = styled.span`
  font-size: 34px;
  line-height: 1.2;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: -0.02em;
  text-align: center;
  padding: 0 ${({ theme }) => theme.spacing(5)};
  color: ${({ theme, $impostor }) => ($impostor ? '#e0777c' : theme.colors.text.primary)};
`;

const DebateTitle = styled.h2`
  align-self: flex-start;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 26px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const DebateText = styled.p`
  align-self: flex-start;
  margin: 0 0 ${({ theme }) => theme.spacing(5)};
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const PlayerList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const PlayerRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2.5)};
  height: 52px;
  padding: 0 ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  border: 1px solid
    ${({ theme, $out }) => ($out ? theme.colors.border : theme.colors.borderStrong)};
  color: ${({ theme, $out }) => ($out ? theme.colors.text.disabled : theme.colors.text.primary)};
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-align: left;
  cursor: ${({ $out }) => ($out ? 'default' : 'pointer')};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ $out }) => ($out ? undefined : GAME.color)};
  }
`;

const RowNote = styled.span`
  font-size: 12.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
  color: ${({ theme }) => theme.colors.text.faint};
`;

const ResultCard = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(6.5)};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  animation: pv-pop 0.22s ease;
`;

const ResultKicker = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(2.5)};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.kicker};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const ResultTitle = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 28px;
  line-height: 1.2;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const ResultText = styled.p`
  position: relative;
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export default function ImpostorGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [round, setRound] = useState(null);
    const [phase, setPhase] = useState('reveal');
    const [index, setIndex] = useState(0);
    const [seen, setSeen] = useState(false);
    const [eliminated, setEliminated] = useState([]);
    const [caught, setCaught] = useState(null);
    const [confirm, setConfirm] = useState(null);

    const deal = () => {
        if (players.length < GAME.min) return;
        setRound({
            ...randomTopic(),
            impostor: Math.floor(Math.random() * players.length),
        });
        setPhase('reveal');
        setIndex(0);
        setSeen(false);
        setEliminated([]);
        setCaught(null);
    };

    useEffect(() => {
        if (players.length >= GAME.min && !round) deal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [players.length]);

    if (players.length < GAME.min) {
        return (
            <GameShell
                gameId="impostor"
                status={`Hacen falta ${GAME.min} jugadores`}
                footer={
                    <Button size="lg" fullWidth onClick={() => navigate('/games')}>
                        Volver a los juegos
                    </Button>
                }
            >
                <DebateTitle>Faltan jugadores</DebateTitle>
                <DebateText>
                    Impostor se juega con {GAME.min} o más. Añádelos desde el chip de la cabecera.
                </DebateText>
            </GameShell>
        );
    }

    if (!round) return null;

    const isImpostor = index === round.impostor;
    const alive = players.length - eliminated.length;

    const askAccuse = (i) => {
        setConfirm({
            title: `¿Acusáis a ${players[i].name}?`,
            text: 'Hacedlo solo si estáis de acuerdo. Si no es el impostor, queda eliminado y la partida sigue.',
            cta: 'Acusar',
            run: () => {
                if (i === round.impostor) {
                    setCaught(i);
                    setPhase('result');
                } else {
                    // Sin duplicar: un doble toque en «Acusar» no debe restar
                    // dos jugadores del recuento.
                    setEliminated((prev) => (prev.includes(i) ? prev : [...prev, i]));
                }
            },
        });
    };

    const nextReveal = () => {
        if (index < players.length - 1) {
            setIndex((prev) => prev + 1);
            setSeen(false);
        } else {
            setPhase('debate');
        }
    };

    const status =
        phase === 'reveal'
            ? `Reparto ${index + 1} de ${players.length}`
            : phase === 'debate'
                ? `Debate · ${alive} en juego`
                : 'Resultado';

    const footer =
        phase === 'reveal' ? (
            <Button size="lg" color={GAME.color} fullWidth disabled={!seen} onClick={nextReveal}>
                {index < players.length - 1
                    ? `Pásale el móvil a ${players[index + 1]?.name || ''}`
                    : 'Ya lo hemos visto todos'}
            </Button>
        ) : phase === 'debate' ? (
            <Button variant="secondary" size="md" fullWidth onClick={deal}>
                Cancelar partida
            </Button>
        ) : (
            <Button size="lg" color={GAME.color} fullWidth onClick={deal}>
                Otra partida
            </Button>
        );

    return (
        <GameShell
            gameId="impostor"
            status={status}
            footer={footer}
            stageGap={0}
            stageJustify={phase === 'debate' ? 'flex-start' : 'center'}
        >
            {phase === 'reveal' && (
                <>
                    <TurnLine name={players[index].name} />
                    <HoldToReveal
                        color={GAME.color}
                        ring="#423a6a"
                        glyph={<VenetianMask size={30} />}
                        onSeen={() => setSeen(true)}
                    >
                        <RoleLabel>{isImpostor ? 'Tu rol' : 'Vuestra palabra'}</RoleLabel>
                        <SecretWord $impostor={isImpostor}>
                            {isImpostor ? 'Impostor' : round.word}
                        </SecretWord>
                        <ThemeNote>
                            {`Tema: ${round.theme}`}
                        </ThemeNote>
                    </HoldToReveal>
                </>
            )}

            {phase === 'debate' && (
                <>
                    <DebateTitle>A debatir</DebateTitle>
                    <DebateText>
                        Describid vuestra palabra por turnos, sin decirla. Cuando os pongáis de
                        acuerdo, acusad a alguien.
                    </DebateText>
                    <PlayerList>
                        {players.map((player, i) => {
                            const out = eliminated.includes(i);
                            return (
                                <PlayerRow
                                    key={player.id ?? i}
                                    $out={out}
                                    disabled={out}
                                    onClick={() => (out ? null : askAccuse(i))}
                                >
                                    <span>{player.name}</span>
                                    <RowNote>{out ? 'eliminado' : 'acusar'}</RowNote>
                                </PlayerRow>
                            );
                        })}
                    </PlayerList>
                </>
            )}

            {phase === 'result' && (
                <ResultCard>
                    <SignatureLine $color={GAME.color} aria-hidden="true" />
                    <ResultKicker>Resultado</ResultKicker>
                    <ResultTitle>{players[caught]?.name} era el impostor</ResultTitle>
                    <ResultText>
                        Que beba. La palabra era «{round.word}», del tema «{round.theme}».
                    </ResultText>
                </ResultCard>
            )}

            <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />
        </GameShell>
    );
}
