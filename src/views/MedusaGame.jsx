import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { IoRefresh } from 'react-icons/io5';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 0.6; }
`;

const MainCircle = styled(motion.div)`
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: ${({ theme }) => `radial-gradient(circle, ${theme.colors.primaryMuted} 0%, transparent 70%)`};
    animation: ${pulse} 2.4s infinite ease-in-out;
  }
`;

const BigText = styled(motion.h2)`
  font-size: 64px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  z-index: 2;
`;

const InstructionText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing(8)};
  max-width: 280px;
  line-height: 1.5;
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
            <PageHeader
                title="Medusa"
                onBack={() => navigate('/games')}
                rightAction={
                    <IconButton variant="ghost" onClick={resetGame} aria-label="Reiniciar">
                        <IoRefresh size={20} />
                    </IconButton>
                }
            />

            <GameContent>
                <AnimatePresence mode="wait">
                    {gameState === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <MainCircle $clickable onClick={startGame} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                <BigText style={{ fontSize: '22px' }}>EMPEZAR</BigText>
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
                                    transition={{ type: 'spring', damping: 12 }}
                                >
                                    {count === 0 ? <Flame size={64} color="#F5A623" /> : count}
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
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <MainCircle
                                $active
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 1.2 }}
                            >
                                <BigText style={{ fontSize: '36px' }}>¡MIRAD!</BigText>
                            </MainCircle>
                            <InstructionText style={{ color: '#fff', fontWeight: 600 }}>
                                ¡Si cruzas la mirada con alguien, BEBEIS!
                            </InstructionText>
                            <div style={{ marginTop: '32px' }}>
                                <Button size="lg" onClick={resetGame}>
                                    <IoRefresh size={18} />
                                    Volver a jugar
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GameContent>
        </Container>
    );
}
