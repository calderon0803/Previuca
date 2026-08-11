import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Skull, Shield, User, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import HowToPlayModal from '../components/HowToPlayModal';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(8)};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  margin: auto;
  width: 100%;
  max-width: 480px;
  box-sizing: border-box;
`;

const PhaseLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing(5)} 0;
`;

const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.6;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const SecretBox = styled.div`
  background: rgba(0, 0, 0, 0.25);
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(9)};
  width: 100%;
  margin: ${({ theme }) => theme.spacing(4)} 0;
  border: 1px dashed ${({ theme, $isRevealing }) => ($isRevealing ? theme.colors.primary : theme.colors.border)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  user-select: none;
  -webkit-touch-callout: none;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  position: relative;
  overflow: hidden;
`;

const RoleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  z-index: 1;
  opacity: ${props => props.$revealed ? 1 : 0};
  transition: opacity 0.1s;
`;

const roleColor = (role, theme) => {
  if (role === 'Asesino') return theme.colors.error;
  if (role === 'Policía') return '#5B8DEF';
  return theme.colors.text.primary;
};

const SecretText = styled.span`
  font-size: ${props => props.$role === 'Asesino' ? '36px' : props.$role === 'Policía' ? '32px' : '26px'};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${props => roleColor(props.$role, props.theme)};
`;

const RoleDescription = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const SwipeCover = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 19, 23, 0.94);
  backdrop-filter: blur(8px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  cursor: grab;
  z-index: 10;

  &:active {
    cursor: grabbing;
  }
`;

const SwipeText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const PlayerCounter = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CounterValue = styled.span`
  background: ${({ theme }) => theme.colors.surfaceRaised};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ErrorMessage = styled.div`
  background: rgba(229, 72, 77, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const roles = [
    { name: 'Asesino', description: '¡Eres el asesino! Mata sin que te descubran' },
    { name: 'Policía', description: 'Eres el policía. Descubre al asesino' },
    { name: 'Ciudadano', description: 'Ciudadano normal' }
];

export default function AsesinoGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    const [gamePhase, setGamePhase] = useState('setup'); // setup, revealing, playing
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerRoles, setPlayerRoles] = useState([]);
    const [isRevealing, setIsRevealing] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    const helpModal = (
        <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Asesino">
            <p>
                Se reparten roles en secreto: un Asesino, un Policía, y el resto Ciudadanos. El
                móvil pasa de jugador en jugador y cada uno desliza para ver su rol sin que los
                demás lo vean.
            </p>
            <p>
                Luego, disimulando entre todos, el Asesino va guiñando el ojo a los Ciudadanos sin
                que el Policía se dé cuenta. Si te guiñan el ojo, esperas unos segundos y bebes un
                trago — a la tercera vez que bebes, quedas eliminado.
            </p>
            <p>
                El Policía gana si señala correctamente al Asesino. El Asesino gana si elimina a la
                mitad de los jugadores (redondeando hacia arriba). Todo esto se juega de palabra: la
                app solo reparte los roles, el resto lo lleváis vosotros.
            </p>
        </HowToPlayModal>
    );

    useEffect(() => {
        if (players.length >= 5 && gamePhase === 'setup') {
            assignRoles();
        }
    }, [players]);

    const assignRoles = () => {
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        const assassin = shuffledPlayers[0];
        const police = shuffledPlayers[1];
        const assignedRoles = [];

        // El asesino necesita saber quién es el policía para poder evitarlo.
        assignedRoles.push({
            player: assassin,
            role: {
                name: 'Asesino',
                description: `¡Eres el asesino! El policía es ${police.name}. Mata sin que te descubra.`,
            },
        });

        // Asignar Policía
        assignedRoles.push({
            player: police,
            role: roles[1] // Policía
        });

        // Resto son ciudadanos
        for (let i = 2; i < shuffledPlayers.length; i++) {
            assignedRoles.push({
                player: shuffledPlayers[i],
                role: roles[2] // Ciudadano
            });
        }

        // Mezclar el array final para que no estén en orden
        const finalRoles = assignedRoles.sort(() => Math.random() - 0.5);
        setPlayerRoles(finalRoles);
    };

    const startGame = () => {
        setGamePhase('revealing');
        setCurrentPlayerIndex(0);
        setIsRevealing(false);
        setHasRevealed(false);
        setSwipeOffset(0);
    };

    const handleNextPlayer = () => {
        if (currentPlayerIndex < playerRoles.length - 1) {
            setCurrentPlayerIndex(currentPlayerIndex + 1);
            setIsRevealing(false);
            setHasRevealed(false);
            setSwipeOffset(0);
        } else {
            setGamePhase('playing');
        }
    };

    const resetGame = () => {
        setGamePhase('setup');
        setCurrentPlayerIndex(0);
        setIsRevealing(false);
        setHasRevealed(false);
        setSwipeOffset(0);
        assignRoles();
    };

    if (players.length < 5) {
        return (
            <Container>
                <PageHeader
                    title="Asesino"
                    onBack={() => navigate(-1)}
                    rightAction={
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                    }
                />
                {helpModal}
                <Content>
                    <Card>
                        <Title>Jugadores insuficientes</Title>
                        <ErrorMessage>
                            Se necesitan al menos 5 jugadores para jugar.
                            <br />
                            Actualmente hay {players.length} jugador{players.length !== 1 ? 'es' : ''}.
                        </ErrorMessage>
                        <Instruction>
                            Ve al menú de juegos y agrega más jugadores para poder comenzar.
                        </Instruction>
                    </Card>
                </Content>
            </Container>
        );
    }

    if (gamePhase === 'setup') {
        return (
            <Container>
                <PageHeader
                    title="Asesino"
                    onBack={() => navigate(-1)}
                    rightAction={
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                    }
                />
                {helpModal}
                <Content>
                    <Card>
                        <PhaseLabel>Preparación</PhaseLabel>
                        <Title>¿Listos para jugar?</Title>
                        <PlayerCounter>
                            <span>Jugadores:</span>
                            <CounterValue>{players.length}</CounterValue>
                        </PlayerCounter>
                        <Instruction>
                            Se asignarán roles secretos:
                            <br />
                            • 1 Asesino <Skull size={16} style={{ verticalAlign: 'middle' }} />
                            <br />
                            • 1 Policía <Shield size={16} style={{ verticalAlign: 'middle' }} />
                            <br />
                            • {players.length - 2} Ciudadanos <User size={16} style={{ verticalAlign: 'middle' }} />
                            <br /><br />
                            Cada jugador verá su rol en secreto.
                        </Instruction>
                        <Button size="lg" fullWidth onClick={startGame}>
                            Comenzar juego
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }

    if (gamePhase === 'revealing') {
        const currentRole = playerRoles[currentPlayerIndex];

        return (
            <Container>
                <PageHeader
                    title="Asesino"
                    onBack={() => navigate(-1)}
                    rightAction={
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                    }
                />
                {helpModal}
                <Content>
                    <Card
                        key={currentPlayerIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                    >
                        <PhaseLabel>Jugador {currentPlayerIndex + 1} de {playerRoles.length}</PhaseLabel>
                        <Title>{currentRole.player.name}</Title>
                        <Instruction>
                            Desliza para ver tu rol en secreto.
                            <br />
                            ¡No dejes que otros vean la pantalla!
                        </Instruction>

                        <SecretBox $isRevealing={swipeOffset > 150} key={currentPlayerIndex}>
                            <RoleContainer $revealed={swipeOffset > 50}>
                                <SecretText $role={currentRole.role.name}>
                                    {currentRole.role.name}
                                </SecretText>
                                <RoleDescription>
                                    {currentRole.role.description}
                                </RoleDescription>
                            </RoleContainer>

                            <SwipeCover
                                key={`cover-${currentPlayerIndex}`}
                                drag="x"
                                dragConstraints={{ left: 0, right: 400 }}
                                dragElastic={0}
                                dragMomentum={false}
                                onDrag={(event, info) => {
                                    const newOffset = Math.max(0, Math.min(400, info.offset.x));
                                    setSwipeOffset(newOffset);
                                    if (newOffset > 150 && !hasRevealed) {
                                        setHasRevealed(true);
                                        setIsRevealing(true);
                                    }
                                }}
                                onDragEnd={() => {
                                    setSwipeOffset(0);
                                }}
                                animate={{ x: swipeOffset }}
                                initial={{ x: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                            >
                                <SecretText $role="swipe" style={{ color: '#D9A54B' }}>DESLIZA →</SecretText>
                                <SwipeText style={{ color: '#D9A54B' }}>
                                    Arrastra para revelar
                                </SwipeText>
                            </SwipeCover>
                        </SecretBox>

                        <Button
                            size="lg"
                            fullWidth
                            onClick={handleNextPlayer}
                            disabled={!isRevealing}
                        >
                            {currentPlayerIndex < playerRoles.length - 1 ? 'Siguiente jugador' : 'Listos'}
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }

    if (gamePhase === 'playing') {
        return (
            <Container>
                <PageHeader
                    title="Asesino"
                    onBack={() => navigate(-1)}
                    rightAction={
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                    }
                />
                {helpModal}
                <Content>
                    <Card>
                        <PhaseLabel>En juego</PhaseLabel>
                        <Title>¡Que empiece la partida!</Title>
                        <Instruction>
                            Ya tenéis los roles repartidos. A partir de aquí va todo en silencio y
                            disimulo — si se os olvida algo, el icono de ayuda de arriba tiene las
                            reglas completas.
                        </Instruction>
                        <Button size="lg" fullWidth onClick={resetGame}>
                            Nueva partida
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }

    return null;
}
