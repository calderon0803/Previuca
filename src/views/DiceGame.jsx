import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
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
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  align-items: center;
`;

const PlayerIndicator = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 12px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
`;

const PlayerLabel = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 4px 0;
`;

const PlayerName = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const DiceContainer = styled.div`
  display: flex;
  gap: 30px;
  margin: 40px 0;
  perspective: 1000px;
`;

const Die = styled(motion.div)`
  width: 80px;
  height: 80px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  color: #000;
  font-weight: bold;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.1);
  position: relative;
  border: 4px solid ${({ theme }) => theme.colors.secondary};
`;

// Dice dot layouts using a simple component
const DiceFace = ({ value }) => {
    const dots = {
        1: [4],
        2: [0, 8],
        3: [0, 4, 8],
        4: [0, 2, 6, 8],
        5: [0, 2, 4, 6, 8],
        6: [0, 3, 6, 2, 5, 8]
    };

    return (
        <DotGrid>
            {[...Array(9)].map((_, i) => (
                <Dot key={i} $active={dots[value].includes(i)} />
            ))}
        </DotGrid>
    );
};

const DotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 60px;
  height: 60px;
  gap: 4px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  background: #000;
  border-radius: 50%;
  opacity: ${props => props.$active ? 1 : 0};
  justify-self: center;
  align-self: center;
`;

const MainButton = styled(motion.button)`
  padding: 20px 60px;
  border-radius: 20px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(186, 0, 87, 0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-top: 40px;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ResultOverlay = styled(motion.div)`
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.surface};
  margin-top: 40px;
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
`;

const ResultTitle = styled.h2`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 18px;
  letter-spacing: 3px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
`;

const ResultRule = styled.p`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  line-height: 1.4;
`;

export default function DiceGame() {
    const navigate = useNavigate();
    const { players } = usePlayers();
    const [dice, setDice] = useState([1, 1]);
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

    const getRule = (d1, d2) => {
        const sum = d1 + d2;
        const isDouble = d1 === d2;

        if (isDouble) {
            if (sum === 2) return "SNAKE EYES: ¡Bébete 2 chupitos ahora mismo!";
            if (sum === 12) return "BOX CARS: ¡Todos los jugadores beben 1 chupito!";
            return `DOBLES: Has sacado doble ${d1}. Crea una regla nueva para el resto de la partida.`;
        }

        if (sum === 7) return "7: El último en tocarse la nariz bebe.";
        if (sum === 3) return "3: Tú bebes un trago.";
        if (sum === 11) return "11: ¡Elige a alguien para que beba 2 tragos!";
        if (sum === 9) return "9: Bebe el de tu izquierda.";
        if (sum === 10) return "10: Bebe el de tu derecha.";

        const drinkCount = Math.floor(sum / 2);
        return `Suma ${sum}: Reparte ${drinkCount} tragos a quien quieras.`;
    };

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);
        setResult(null);

        let rollsCount = 0;
        const rollInterval = setInterval(() => {
            setDice([
                Math.floor(Math.random() * 6) + 1,
                Math.floor(Math.random() * 6) + 1
            ]);
            rollsCount++;
            if (rollsCount > 10) {
                clearInterval(rollInterval);
                const finalDice = [
                    Math.floor(Math.random() * 6) + 1,
                    Math.floor(Math.random() * 6) + 1
                ];
                setDice(finalDice);
                setResult(getRule(finalDice[0], finalDice[1]));
                setIsRolling(false);
            }
        }, 100);
    };

    const nextTurn = () => {
        if (players.length > 0) {
            setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
        }
        setResult(null);
    };

    const resetGame = () => {
        setDice([1, 1]);
        setResult(null);
        setCurrentPlayerIndex(0);
    };

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/games')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Dados de Beber</HeaderTitle>
                <IconButton onClick={resetGame}>
                    <IoRefresh size={24} />
                </IconButton>
            </Header>

            <Content>
                {players.length > 0 && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de:</PlayerLabel>
                        <PlayerName>{players[currentPlayerIndex]?.name}</PlayerName>
                    </PlayerIndicator>
                )}

                <DiceContainer>
                    <Die
                        animate={isRolling ? {
                            rotate: [0, 90, 180, 270, 360],
                            x: [0, 20, -20, 20, 0],
                            y: [0, -20, 20, -20, 0]
                        } : { rotate: 0 }}
                        transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
                    >
                        <DiceFace value={dice[0]} />
                    </Die>
                    <Die
                        animate={isRolling ? {
                            rotate: [0, -90, -180, -270, -360],
                            x: [0, -20, 20, -20, 0],
                            y: [0, 20, -20, 20, 0]
                        } : { rotate: 0 }}
                        transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0 }}
                    >
                        <DiceFace value={dice[1]} />
                    </Die>
                </DiceContainer>

                <AnimatePresence>
                    {result && (
                        <ResultOverlay
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        >
                            <ResultTitle>REGLA</ResultTitle>
                            <ResultRule>{result}</ResultRule>
                        </ResultOverlay>
                    )}
                </AnimatePresence>

                <MainButton
                    onClick={result ? nextTurn : rollDice}
                    disabled={isRolling}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isRolling ? 'LANZANDO...' : result ? 'SIGUIENTE' : '¡LANZAR DADOS!'}
                </MainButton>
            </Content>
        </Container>
    );
}
