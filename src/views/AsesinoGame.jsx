import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(15, 1, 9, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 24px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  margin: auto;
  width: 100%;
  max-width: 500px;
`;

const PhaseLabel = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 12px;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  margin-bottom: 24px;
`;

const Instruction = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const SecretBox = styled(motion.div)`
  background: rgba(0,0,0,0.3);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  margin: 20px 0;
  border: 2px dashed ${props => props.$isRevealing ? props.theme.colors.primary : props.theme.colors.secondary + '50'};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  user-select: none;
  -webkit-touch-callout: none;
  transition: border-color 0.2s;
  position: relative;
  overflow: hidden;
`;

const RoleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1;
  opacity: ${props => props.$revealed ? 1 : 0};
  transition: opacity 0.1s;
`;

const SecretText = styled.span`
  font-size: ${props => props.$role === 'Asesino' ? '40px' : props.$role === 'Policía' ? '36px' : '28px'};
  font-weight: 900;
  color: ${props => 
    props.$role === 'Asesino' ? '#ff0000' : 
    props.$role === 'Policía' ? '#00aaff' : 
    props.theme.colors.secondary};
  text-shadow: 0 0 20px ${props => 
    props.$role === 'Asesino' ? '#ff000040' : 
    props.$role === 'Policía' ? '#00aaff40' : 
    props.theme.colors.secondary + '40'};
`;

const RoleDescription = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 8px;
`;

const SwipeCover = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(186, 0, 87, 0.95), rgba(186, 0, 87, 0.85));
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
`;

const SwipeText = styled.span`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

const Button = styled.button`
  width: 100%;
  padding: 18px;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const PlayerCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
`;

const Counter = styled.span`
  background: ${({ theme }) => theme.colors.surface};
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

const ErrorMessage = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 2px solid #ff0000;
  border-radius: 12px;
  padding: 20px;
  color: #ff6666;
  text-align: center;
  margin-bottom: 20px;
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

    useEffect(() => {
        if (players.length >= 5 && gamePhase === 'setup') {
            assignRoles();
        }
    }, [players]);

    const assignRoles = () => {
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        const assignedRoles = [];

        // Asignar Asesino
        assignedRoles.push({
            player: shuffledPlayers[0],
            role: roles[0] // Asesino
        });

        // Asignar Policía
        assignedRoles.push({
            player: shuffledPlayers[1],
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
                <Header>
                    <IconButton onClick={() => navigate('/games')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Asesino 🔪</HeaderTitle>
                    <div style={{ width: '40px' }} />
                </Header>
                <Content>
                    <Card>
                        <Title>Jugadores Insuficientes</Title>
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
                <Header>
                    <IconButton onClick={() => navigate('/games')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Asesino 🔪</HeaderTitle>
                    <IconButton onClick={resetGame}>
                        <IoRefresh size={24} />
                    </IconButton>
                </Header>
                <Content>
                    <Card
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <PhaseLabel>Preparación</PhaseLabel>
                        <Title>¿Listos para jugar?</Title>
                        <PlayerCounter>
                            <span>Jugadores:</span>
                            <Counter>{players.length}</Counter>
                        </PlayerCounter>
                        <Instruction>
                            Se asignarán roles secretos:
                            <br />
                            • 1 Asesino 🔪
                            <br />
                            • 1 Policía 👮
                            <br />
                            • {players.length - 2} Ciudadanos 👤
                            <br /><br />
                            Cada jugador verá su rol en secreto.
                        </Instruction>
                        <Button onClick={startGame}>
                            Comenzar Juego
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
                <Header>
                    <IconButton onClick={() => navigate('/games')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Asesino 🔪</HeaderTitle>
                    <IconButton onClick={resetGame}>
                        <IoRefresh size={24} />
                    </IconButton>
                </Header>
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
                                <SecretText style={{ color: '#FFD800' }}>DESLIZA →</SecretText>
                                <SwipeText style={{ color: '#FFD800', fontSize: '14px' }}>
                                    Arrastra para revelar
                                </SwipeText>
                            </SwipeCover>
                        </SecretBox>

                        <Button 
                            onClick={handleNextPlayer}
                            disabled={!isRevealing}
                            style={{ opacity: isRevealing ? 1 : 0.5 }}
                        >
                            {currentPlayerIndex < playerRoles.length - 1 ? 'SIGUIENTE JUGADOR' : 'LISTOS'}
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }

    if (gamePhase === 'playing') {
        return (
            <Container>
                <Header>
                    <IconButton onClick={() => navigate('/games')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Asesino 🔪</HeaderTitle>
                    <IconButton onClick={resetGame}>
                        <IoRefresh size={24} />
                    </IconButton>
                </Header>
                <Content>
                    <Card>
                        <PhaseLabel>En Juego</PhaseLabel>
                        <Title>¡Que empiece la partida!</Title>
                        <Instruction>
                            <strong>Asesino:</strong> Elimina jugadores guiñando un ojo sin que el policía te vea.
                            <br /><br />
                            <strong>Policía:</strong> Observa y descubre quién es el asesino.
                            <br /><br />
                            <strong>Ciudadanos:</strong> Si el asesino te guiña, espera unos segundos y bebe un trago(Tras 3 tragos, mueres.).
                            <br /><br />
                            El juego termina cuando:
                            <br />
                            • El policía atrapa al asesino
                            <br />
                            • El asesino elimina a la mitad de los jugadores (redondeando hacia arriba)
                        </Instruction>
                        <Button onClick={resetGame}>
                            Nueva Partida
                        </Button>
                    </Card>
                </Content>
            </Container>
        );
    }

    return null;
}
