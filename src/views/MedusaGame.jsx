import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

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
  z-index: 10;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: background 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  text-align: center;
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const MainCircle = styled(motion.div)`
  width: 250px;
  height: 250px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 4px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  box-shadow: 0 0 30px ${({ theme }) => `${theme.colors.secondary}40`};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => `radial-gradient(circle, ${theme.colors.primary}30 0%, transparent 70%)`};
    animation: ${pulse} 2s infinite ease-in-out;
  }
`;

const BigText = styled(motion.h2)`
  font-size: 80px;
  font-weight: 900;
  color: #fff;
  margin: 0;
  z-index: 2;
  text-shadow: 0 4px 12px rgba(0,0,0,0.5);
`;

const InstructionText = styled.p`
  font-size: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 40px;
  max-width: 280px;
  line-height: 1.5;
`;

const MedusaIcon = styled.div`
  font-size: 60px;
  margin-bottom: 20px;
`;

export default function MedusaGame() {
    const navigate = useNavigate();
    const [gameState, setGameState] = useState('idle'); // idle, counting, result
    const [count, setCount] = useState(3);

    useEffect(() => {
        let timer;
        if (gameState === 'counting') {
            if (count > 0) {
                timer = setTimeout(() => setCount(count - 1), 1000);
            } else {
                setGameState('result');
            }
        }
        return () => clearTimeout(timer);
    }, [gameState, count]);

    const startGame = () => {
        setCount(3);
        setGameState('counting');
    };

    const resetGame = () => {
        setGameState('idle');
        setCount(3);
    };

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/games')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Medusa</HeaderTitle>
                <IconButton onClick={resetGame}>
                    <IoRefresh size={24} />
                </IconButton>
            </Header>

            <GameContent>
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <MainCircle $clickable onClick={startGame} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <BigText style={{ fontSize: '24px' }}>EMPEZAR</BigText>
                            </MainCircle>
                            <InstructionText>
                                Bajad todos la cabeza. Al pulsar el botón comenzará la cuenta atrás.
                            </InstructionText>
                        </motion.div>
                    )}

                    {gameState === 'counting' && (
                        <motion.div
                            key="counting"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <MainCircle>
                                <BigText
                                    key={count}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                >
                                    {count === 0 ? '🔥' : count}
                                </BigText>
                            </MainCircle>
                            <InstructionText>
                                ¡Preparados...!
                            </InstructionText>
                        </motion.div>
                    )}

                    {gameState === 'result' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <MainCircle
                                style={{ borderColor: '#BA0057', boxShadow: '0 0 50px rgba(186, 0, 87, 0.6)' }}
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <BigText style={{ fontSize: '40px' }}>¡MIRAD!</BigText>
                            </MainCircle>
                            <InstructionText style={{ color: '#fff', fontWeight: 'bold' }}>
                                ¡Si cruzas la mirada con alguien, BEBEIS!
                            </InstructionText>
                            <IconButton
                                onClick={resetGame}
                                style={{ marginTop: '30px', width: 'auto', padding: '0 24px' }}
                            >
                                <IoRefresh size={20} style={{ marginRight: '8px' }} /> Volver a jugar
                            </IconButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GameContent>
        </Container>
    );
}
