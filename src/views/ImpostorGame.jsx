import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';

const wordBank = [
    { category: 'Animales', word: 'Perro', intruder: 'Lobo' },
    { category: 'Animales', word: 'León', intruder: 'Tigre' },
    { category: 'Animales', word: 'Delfín', intruder: 'Ballena' },
    { category: 'Comida', word: 'Pizza', intruder: 'Hamburguesa' },
    { category: 'Comida', word: 'Sushi', intruder: 'Ramen' },
    { category: 'Comida', word: 'Helado', intruder: 'Yogur' },
    { category: 'Lugares', word: 'Playa', intruder: 'Piscina' },
    { category: 'Lugares', word: 'Parque', intruder: 'Bosque' },
    { category: 'Lugares', word: 'Cine', intruder: 'Teatro' },
    { category: 'Objetos', word: 'Móvil', intruder: 'Tablet' },
    { category: 'Objetos', word: 'Libro', intruder: 'Revista' },
    { category: 'Objetos', word: 'Silla', intruder: 'Sofá' },
    { category: 'Cine & TV', word: 'Batman', intruder: 'Iron Man' },
    { category: 'Cine & TV', word: 'Titanic', intruder: 'Avatar' },
    { category: 'Cine & TV', word: 'Netflix', intruder: 'Disney+' },
];

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
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  user-select: none;
  -webkit-touch-callout: none;
  transition: border-color 0.2s;
`;

const SecretText = styled.span`
  font-size: 32px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 20px ${({ theme }) => theme.colors.secondary}40;
`;

const MainButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  padding: 18px 40px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  margin-top: 20px;
`;

const PlayerGrid = styled.div`
  grid-template-columns: 1fr 1fr;
  display: grid;
  gap: 12px;
  width: 100%;
  margin-top: 20px;
`;

const PlayerVoteCard = styled.button`
  background: ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.surface};
  border: 2px solid ${props => props.$selected ? props.theme.colors.secondary : 'rgba(255,255,255,0.1)'};
  border-radius: 12px;
  padding: 16px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.secondary};
    transform: translateY(-2px);
  }
`;

const RoleTag = styled.div`
  background: ${props => props.$isImpostor ? '#BA0057' : '#00BA7C'};
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 10px;
`;



export default function ImpostorGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    // Game Phases: 'start', 'reveal', 'describe', 'vote', 'result'
    const [phase, setPhase] = useState('start');
    const [gameState, setGameState] = useState(null);
    const [revealIndex, setRevealIndex] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [selectedVote, setSelectedVote] = useState(null);
    const [hasRevealed, setHasRevealed] = useState(false);

    const initGame = () => {
        if (players.length < 3) return;

        const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        const imposterIndex = Math.floor(Math.random() * players.length);

        const assignments = players.map((p, i) => ({
            playerName: p.name,
            role: i === imposterIndex ? 'impostor' : 'inocente',
            word: i === imposterIndex ? randomWord.intruder : randomWord.word
        }));

        setGameState({ assignments, category: randomWord.category });
        setPhase('reveal');
        setRevealIndex(0);
        setIsRevealing(false);
        setHasRevealed(false);
    };

    const handleNextReveal = () => {
        if (revealIndex < players.length - 1) {
            setRevealIndex(prev => prev + 1);
            setIsRevealing(false);
            setHasRevealed(false);
        } else {
            setPhase('describe');
        }
    };



    const handleVote = () => {
        if (selectedVote !== null) {
            setPhase('result');
        }
    };

    const resetGame = () => {
        setPhase('start');
        setGameState(null);
        setSelectedVote(null);
    };

    if (players.length < 3) {
        return (
            <Container>
                <Header>
                    <IconButton onClick={() => navigate('/games')}><IoArrowBack size={24} /></IconButton>
                    <HeaderTitle>Impostor</HeaderTitle>
                    <div></div>
                </Header>
                <Content>
                    <Card>
                        <Title>Faltan jugadores</Title>
                        <Instruction>Este juego requiere al menos 3 jugadores para ser divertido.</Instruction>
                        <MainButton onClick={() => navigate('/games')}>Volver</MainButton>
                    </Card>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/games')}><IoArrowBack size={24} /></IconButton>
                <HeaderTitle>Impostor</HeaderTitle>
                <IconButton onClick={resetGame}><IoRefresh size={24} /></IconButton>
            </Header>

            <Content>
                <AnimatePresence mode="wait">
                    {phase === 'start' && (
                        <Card key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <PhaseLabel>Preparación</PhaseLabel>
                            <Title>¿Quién es el impostor?</Title>
                            <Instruction>
                                Todos recibiréis la misma palabra, excepto uno que tendrá una ligeramente diferente.
                                Tenéis que describirla sin ser demasiado obvios.
                            </Instruction>
                            <MainButton onClick={initGame}>EMPEZAR PARTIDA</MainButton>
                        </Card>
                    )}

                    {phase === 'reveal' && (
                        <Card key="reveal" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <PhaseLabel>Revelación Secreta</PhaseLabel>
                            <Title>{players[revealIndex].name}</Title>
                            <Instruction>Toca para ver tu palabra en secreto y asegúrate de que nadie mire.</Instruction>

                            <SecretBox onClick={() => setIsRevealing(!isRevealing)}>
                                {isRevealing ? (
                                    <>
                                        <IoEyeOffOutline size={40} color="#BA0057" />
                                        <SecretText>{gameState.assignments[revealIndex].word}</SecretText>
                                        <Instruction style={{ marginBottom: 0 }}>Vuelve a tocar para ocultar</Instruction>
                                    </>
                                ) : (
                                    <>
                                        <IoEyeOutline size={40} color="#FFD800" />
                                        <SecretText style={{ filter: 'blur(10px)', opacity: 0.3 }}>PALABRA</SecretText>
                                        <Instruction style={{ marginBottom: 0 }}>TOCA PARA REVELAR</Instruction>
                                    </>
                                )}
                            </SecretBox>

                            <MainButton
                                onClick={handleNextReveal}
                                disabled={!isRevealing}
                                style={{ opacity: isRevealing ? 1 : 0.5 }}
                            >
                                {revealIndex < players.length - 1 ? 'SIGUIENTE JUGADOR' : 'LISTOS'}
                            </MainButton>
                        </Card>
                    )}

                    {phase === 'describe' && (
                        <Card key="describe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PhaseLabel>Debate</PhaseLabel>
                            <Title>Categoría: {gameState.category}</Title>
                            <Instruction>
                                Por turnos, decid UNA SOLA PALABRA que describa lo vuestro.
                                El impostor debe intentar mimetizarse.
                            </Instruction>

                            <MainButton onClick={() => setPhase('vote')}>PASAR A VOTACIÓN</MainButton>
                        </Card>
                    )}

                    {phase === 'vote' && (
                        <Card key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <PhaseLabel>Votación</PhaseLabel>
                            <Title>¿Quién es el Impostor?</Title>
                            <Instruction>Votad todos a la de tres. Marcad aquí a quién habéis elegido.</Instruction>

                            <PlayerGrid>
                                {players.map((p, i) => (
                                    <PlayerVoteCard
                                        key={i}
                                        $selected={selectedVote === i}
                                        onClick={() => setSelectedVote(i)}
                                    >
                                        {p.name}
                                    </PlayerVoteCard>
                                ))}
                            </PlayerGrid>

                            <MainButton
                                onClick={handleVote}
                                disabled={selectedVote === null}
                                style={{ opacity: selectedVote !== null ? 1 : 0.5 }}
                            >
                                VER RESULTADO
                            </MainButton>
                        </Card>
                    )}

                    {phase === 'result' && (
                        <Card key="result" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                            <PhaseLabel>Revelación Final</PhaseLabel>
                            <Title>El Impostor era...</Title>

                            {gameState.assignments.map((a, i) => (
                                a.role === 'impostor' && (
                                    <div key={i} style={{ marginBottom: 30 }}>
                                        <SecretText style={{ fontSize: 40 }}>{a.playerName}</SecretText>
                                        <div style={{ color: '#fff', marginTop: 10 }}>Su palabra era: <b>{a.word}</b></div>
                                        <div style={{ color: '#fff', opacity: 0.7 }}>La de los demás era: <b>{gameState.assignments.find(x => x.role === 'inocente').word}</b></div>
                                    </div>
                                )
                            ))}

                            <Instruction>
                                {gameState.assignments[selectedVote].role === 'impostor' ? (
                                    <span style={{ color: '#00BA7C', fontWeight: 'bold' }}>
                                        ¡LO HABÉIS PILLADO! El impostor bebe un chupito.
                                    </span>
                                ) : (
                                    <span style={{ color: '#BA0057', fontWeight: 'bold' }}>
                                        ¡FALLASTEIS! El impostor se libra. Los inocentes beben un trago.
                                    </span>
                                )}
                            </Instruction>

                            <MainButton onClick={resetGame}>VOLVER A JUGAR</MainButton>
                        </Card>
                    )}
                </AnimatePresence>
            </Content>
        </Container>
    );
}
