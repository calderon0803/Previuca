import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';

import { wordBank } from '../data/impostorWords';

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
  touch-action: none;
`;

const SecretText = styled.span`
  font-size: 32px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.secondary};
  text-shadow: 0 0 20px ${({ theme }) => theme.colors.secondary}40;
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
  cursor: grab;
  z-index: 10;
  
  &:active {
    cursor: grabbing;
  }
`;

const WordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 140px;
  justify-content: center;
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



const RoleTag = styled.div`
  color:#BA0057;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  text-transform: uppercase;
  margin-top: 10px;
`;



export default function ImpostorGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();

    // Game Phases: 'start', 'reveal', 'describe', 'result'
    const [phase, setPhase] = useState('start');
    const [gameState, setGameState] = useState(null);
    const [revealIndex, setRevealIndex] = useState(0);
    const [isRevealing, setIsRevealing] = useState(false);
    const [hasRevealed, setHasRevealed] = useState(false);
    const [swipeOffset, setSwipeOffset] = useState(0);

    const initGame = () => {
        if (players.length < 3) return;

        const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        const imposterIndex = Math.floor(Math.random() * players.length);

        const assignments = players.map((p, i) => ({
            playerName: p.name,
            role: i === imposterIndex ? 'impostor' : 'inocente',
            word: i === imposterIndex ? randomWord.intruder : randomWord.word
        }));

        setGameState({ assignments });
        setPhase('reveal');
        setRevealIndex(0);
        setIsRevealing(false);
        setHasRevealed(false);
        setSwipeOffset(0);
    };

    const handleNextReveal = () => {
        if (revealIndex < players.length - 1) {
            setRevealIndex(prev => prev + 1);
            setIsRevealing(false);
            setHasRevealed(false);
            setSwipeOffset(0);
        } else {
            setPhase('describe');
        }
    };



    const resetGame = () => {
        setPhase('start');
        setGameState(null);
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
                            <Title>{players[revealIndex].name}</Title>
                            <Instruction>Desliza para ver tu palabra en secreto y asegúrate de que nadie mire.</Instruction>

                            <SecretBox $isRevealing={swipeOffset > 150}>
                                <WordContainer>
                                    {gameState.assignments[revealIndex].role === 'impostor' ? (
                                        <>
                                            <RoleTag $isImpostor={true}>
                                                IMPOSTOR
                                            </RoleTag>
                                            <Instruction style={{ marginBottom: 0, color: '#00BA7C' }}>Tu pista: {gameState.assignments[revealIndex].word}</Instruction>
                                        </>
                                    ) : (
                                        <>
                                            <Instruction style={{ marginBottom: 0, color: '#00BA7C' }}>Tu palabra secreta</Instruction>
                                            <SecretText>{gameState.assignments[revealIndex].word}</SecretText>
                                        </>
                                    )}
                                </WordContainer>

                                <SwipeCover
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
                                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                                >
                                    <SecretText style={{ color: '#FFD800' }}>DESLIZA →</SecretText>
                                    <Instruction style={{ marginBottom: 0, color: '#FFD800', fontSize: '14px' }}>
                                        Arrastra para revelar
                                    </Instruction>
                                </SwipeCover>
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
                            <Title>¡A debatir!</Title>
                            <Instruction>
                                Por turnos, decid UNA SOLA PALABRA que describa lo vuestro.
                                El impostor debe intentar mimetizarse.
                            </Instruction>

                            <MainButton onClick={resetGame}>NUEVA PARTIDA</MainButton>
                        </Card>
                    )}



                </AnimatePresence>
            </Content>
        </Container>
    );
}
