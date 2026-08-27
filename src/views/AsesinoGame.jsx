import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Skull, Shield, User } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import TurnLine from '../components/TurnLine';
import HoldToReveal from '../components/HoldToReveal';
import Button from '../components/ui/Button';
import { SignatureLine } from '../components/ui/Signature';

const GAME = gameById.asesino;

const Title = styled.h2`
  align-self: flex-start;
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 28px;
  line-height: 1.15;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const Lede = styled.p`
  align-self: flex-start;
  margin: 0 0 ${({ theme }) => theme.spacing(5)};
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const RoleList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const RoleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 50px;
  padding: 0 ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  color: ${({ $color }) => $color};
`;

const RoleRowLabel = styled.span`
  flex: 1;
  font-size: 15px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RoleName = styled.span`
  font-size: 32px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: -0.02em;
  color: ${({ $color }) => $color};
`;

const RoleDesc = styled.span`
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding: 0 ${({ theme }) => theme.spacing(5)};
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const PlayingCard = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(6.5)};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  animation: pv-pop 0.22s ease;
`;

const CardKicker = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(2.5)};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.kicker};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const CardTitle = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 26px;
  line-height: 1.2;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const CardText = styled.p`
  position: relative;
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ROLE_COLOR = {
    'Asesino': '#e0777c',
    'Policía': '#8FA8DE',
    'Ciudadano': '#e9e9ed',
};

const shuffle = (list) => {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

export default function AsesinoGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [phase, setPhase] = useState('setup');
    const [round, setRound] = useState(null);
    const [index, setIndex] = useState(0);
    const [seen, setSeen] = useState(false);

    const start = () => {
        const indexes = players.map((_, i) => i);
        const order = shuffle(indexes);
        const picks = shuffle(indexes);
        const killer = picks[0];
        const cop = picks[1];
        const roles = players.map((_, i) =>
            i === killer ? 'Asesino' : i === cop ? 'Policía' : 'Ciudadano',
        );
        setRound({ order, roles, killer, cop });
        setIndex(0);
        setSeen(false);
        setPhase('reveal');
    };

    const next = () => {
        if (index < round.order.length - 1) {
            setIndex((prev) => prev + 1);
            setSeen(false);
        } else {
            setPhase('playing');
        }
    };

    if (players.length < GAME.min) {
        return (
            <GameShell
                gameId="asesino"
                status={`Hacen falta ${GAME.min} jugadores`}
                footer={
                    <Button size="lg" fullWidth onClick={() => navigate('/games')}>
                        Volver a los juegos
                    </Button>
                }
            >
                <Title>Faltan jugadores</Title>
                <Lede>
                    Asesino se juega con {GAME.min} o más: uno hace de asesino, otro de policía y el
                    resto de ciudadanos. Añádelos desde el chip de la cabecera.
                </Lede>
            </GameShell>
        );
    }

    const playerIndex = round ? round.order[index] : 0;
    const role = round ? round.roles[playerIndex] : null;
    const roleDesc =
        role === 'Asesino'
            ? `El policía es ${players[round.cop]?.name || ''}. Guiña sin que te vea.`
            : role === 'Policía'
                ? 'Descubre al asesino antes de que se lleve a media mesa.'
                : 'Si te guiñan el ojo, esperas unos segundos y bebes.';

    const status =
        phase === 'reveal'
            ? `Reparto ${index + 1} de ${round.order.length}`
            : phase === 'setup'
                ? `${players.length} jugadores`
                : 'En juego';

    const footer =
        phase === 'setup' ? (
            <Button size="lg" color={GAME.color} fullWidth onClick={start}>
                Repartir roles
            </Button>
        ) : phase === 'reveal' ? (
            <Button size="lg" color={GAME.color} fullWidth disabled={!seen} onClick={next}>
                {index < round.order.length - 1
                    ? `Pásale el móvil a ${players[round.order[index + 1]]?.name || ''}`
                    : 'Ya lo hemos visto todos'}
            </Button>
        ) : (
            <Button size="lg" color={GAME.color} fullWidth onClick={start}>
                Repartir de nuevo
            </Button>
        );

    return (
        <GameShell gameId="asesino" status={status} footer={footer} stageGap={0}>
            {phase === 'setup' && (
                <>
                    <Title>Roles en secreto</Title>
                    <Lede>
                        El móvil pasará de mano en mano y cada uno verá su rol sin que los demás
                        miren.
                    </Lede>
                    <RoleList>
                        <RoleRow $color={ROLE_COLOR['Asesino']}>
                            <Skull size={18} />
                            <RoleRowLabel>1 Asesino</RoleRowLabel>
                        </RoleRow>
                        <RoleRow $color={ROLE_COLOR['Policía']}>
                            <Shield size={18} />
                            <RoleRowLabel>1 Policía</RoleRowLabel>
                        </RoleRow>
                        <RoleRow $color="#9397ab">
                            <User size={18} />
                            <RoleRowLabel>{Math.max(0, players.length - 2)} Ciudadanos</RoleRowLabel>
                        </RoleRow>
                    </RoleList>
                </>
            )}

            {phase === 'reveal' && (
                <>
                    <TurnLine name={players[playerIndex]?.name} />
                    <HoldToReveal
                        color={GAME.color}
                        glyph={<Skull size={30} />}
                        onSeen={() => setSeen(true)}
                    >
                        <RoleName $color={ROLE_COLOR[role]}>{role}</RoleName>
                        <RoleDesc>{roleDesc}</RoleDesc>
                    </HoldToReveal>
                </>
            )}

            {phase === 'playing' && (
                <PlayingCard>
                    <SignatureLine $color={GAME.color} aria-hidden="true" />
                    <CardKicker>En juego</CardKicker>
                    <CardTitle>Que empiece el disimulo</CardTitle>
                    <CardText>
                        A partir de aquí la app no interviene: guiños, tragos y acusaciones los
                        lleváis vosotros.
                    </CardText>
                </PlayingCard>
            )}
        </GameShell>
    );
}
