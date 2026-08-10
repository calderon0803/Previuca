import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoRefresh } from 'react-icons/io5';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  overflow-y: auto;
  overflow-x: hidden;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(6)};
  align-items: center;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const PlayerIndicator = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: center;
`;

const PlayerLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 4px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const PlayerName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const DiceContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(6)};
  margin: ${({ theme }) => theme.spacing(8)} 0;
  perspective: 1000px;
`;

const Die = styled(motion.div)`
  width: 76px;
  height: 76px;
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.md};
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
  position: relative;
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
  width: 56px;
  height: 56px;
  gap: 4px;
`;

const Dot = styled.div`
  width: 11px;
  height: 11px;
  background: #262626;
  border-radius: 50%;
  opacity: ${props => props.$active ? 1 : 0};
  justify-self: center;
  align-self: center;
`;

const ResultOverlay = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  max-width: 480px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ResultTitle = styled.h2`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  letter-spacing: 0.12em;
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const ResultRule = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
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
    const [showHelp, setShowHelp] = useState(false);

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
            <PageHeader
                title="Dados de Beber"
                onBack={() => navigate(-1)}
                rightAction={
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                        <IconButton variant="ghost" onClick={resetGame} aria-label="Reiniciar">
                            <IoRefresh size={20} />
                        </IconButton>
                    </div>
                }
            />

            <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Dados de Beber">
                <p>Turno por turno, cada uno lanza los dos dados. La suma decide qué toca:</p>
                <ul>
                    <li><strong>1-1:</strong> dos chupitos para ti</li>
                    <li><strong>6-6:</strong> todos beben un chupito</li>
                    <li><strong>Cualquier otro doble:</strong> te inventas una regla nueva que dura el resto de la partida</li>
                    <li><strong>Suma 7:</strong> el último en tocarse la nariz bebe</li>
                    <li><strong>Suma 3:</strong> bebes tú</li>
                    <li><strong>Suma 9:</strong> bebe el de tu izquierda</li>
                    <li><strong>Suma 10:</strong> bebe el de tu derecha</li>
                    <li><strong>Suma 11:</strong> eliges a alguien para que beba 2</li>
                    <li><strong>El resto de sumas:</strong> repartes algunos tragos a quien quieras</li>
                </ul>
            </HowToPlayModal>

            <Content>
                {players.length > 0 && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de</PlayerLabel>
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
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                        >
                            <ResultTitle>Regla</ResultTitle>
                            <ResultRule>{result}</ResultRule>
                        </ResultOverlay>
                    )}
                </AnimatePresence>

                <Button
                    size="lg"
                    onClick={result ? nextTurn : rollDice}
                    disabled={isRolling}
                    style={{ marginTop: '32px' }}
                >
                    {isRolling ? 'Lanzando...' : result ? 'Siguiente' : 'Lanzar dados'}
                </Button>
            </Content>
        </Container>
    );
}
