import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoRefresh, IoSettingsOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import OptionsEditor from '../components/OptionsEditor';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const OPTS_KEY = 'roulette_custom_options';

const defaultOptions = [
  'Bebe 1',
  'Manda 1',
  'Bebe 2',
  'Manda 2',
  'Bebe 3',
  'Manda 3',
  'Chupito',
  'Manda Chupito',
  'Todos Beben',
  'Nadie Bebe'
];

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
  position: relative;
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

const RouletteContainer = styled.div`
  position: relative;
  width: min(85vw, 380px);
  aspect-ratio: 1;
  margin-bottom: ${({ theme }) => theme.spacing(10)};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OuterRing = styled.div`
  position: absolute;
  width: 103%;
  height: 103%;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.neutral[700]};
  z-index: 0;
`;

const WheelWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid ${({ theme }) => theme.colors.background};
  z-index: 1;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Slices = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ $conicGradient }) => $conicGradient};
`;

const SliceText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48%; /* Almost full radius */
  height: 40px;
  margin-top: -20px;
  transform-origin: left center;
  transform: rotate(${({ $angle }) => $angle}deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: min(3vw, 13px);
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  pointer-events: none;
  white-space: nowrap;
  padding-left: 45px; /* Clear the center cap (30px radius) + safety */
  box-sizing: border-box;
`;

const Pointer = styled.div`
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 44px;
  z-index: 10;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));

  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-top: 30px solid ${({ theme }) => theme.colors.accent};
  }

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 50%;
  }
`;

const CenterCap = styled.div`
  position: absolute;
  width: 54px;
  height: 54px;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: 50%;
  z-index: 5;
  border: 3px solid ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 11, 14, 0.85);
  backdrop-filter: blur(6px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const ResultCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(9)};
  width: 100%;
  max-width: 360px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const ResultLabel = styled.h3`
  color: ${({ theme }) => theme.colors.accent};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
  letter-spacing: 0.1em;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-transform: uppercase;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const ResultValue = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  margin: 0;
  line-height: 1.25;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

export default function RouletteGame() {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [showEditor, setShowEditor] = useState(false);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(OPTS_KEY);
    if (saved) {
      try {
        setOptions(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading options:", e);
      }
    }
  }, []);

  // Sync turn index if players change
  useEffect(() => {
    if (players.length > 0 && currentPlayerIndex >= players.length) {
      setCurrentPlayerIndex(0);
    }
  }, [players, currentPlayerIndex]);

  const nextTurn = () => {
    if (players.length > 0) {
      setCurrentPlayerIndex((prev) => (prev + 1) % players.length);
    }
    setShowResult(false);
  };

  const saveOptions = (newOptions) => {
    setOptions(newOptions);
    localStorage.setItem(OPTS_KEY, JSON.stringify(newOptions));
    setShowEditor(false);
    setRotation(0);
    setResult(null);
    setShowResult(false);
  };

  const handleReset = () => {
    saveOptions(defaultOptions);
  };

  // Generate conic-gradient string
  const segmentSize = 360 / options.length;

  // Alternating colors: primary and accent
  const getColors = (count) => {
    const baseColors = ['#B23A63', '#D9A54B'];
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(baseColors[i % baseColors.length]);
    }
    return result;
  };

  const dynamicColors = getColors(options.length);
  const conicGradient = dynamicColors.map((color, i) =>
    `${color} ${i * segmentSize}deg ${(i + 1) * segmentSize}deg`
  ).join(', ');

  const handleSpin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setShowResult(false);

    // Calculate randomized rotation
    // Min 5 full turns (1800) + random
    const randomShift = Math.floor(Math.random() * 360);
    const newRotation = rotation + 2160 + randomShift;
    setRotation(newRotation);

    setTimeout(() => {
      // Find which segment hit the pointer (0 deg / top)
      // The pointer is at 0 deg. The wheel rotation is clockwise.
      // So the top slice is (360 - (rotation % 360)) % 360
      const actualRotation = newRotation % 360;
      const angleAtTop = (360 - actualRotation) % 360;
      const index = Math.floor(angleAtTop / segmentSize);

      let finalResult = options[index];

      // Dynamic player integration
      if (players.length > 0 && finalResult.toLowerCase().includes('manda')) {
        const randomPlayer = players[Math.floor(Math.random() * players.length)].name;
        if (finalResult === 'Manda Beber') {
          finalResult = `Manda a ${randomPlayer} beber`;
        } else {
          finalResult = `${finalResult} a ${randomPlayer}`;
        }
      }

      setResult(finalResult);
      setShowResult(true);
      setIsSpinning(false);
    }, 4100);
  };

  return (
    <Container>
      <PageHeader
        title="Ruleta"
        onBack={() => navigate(-1)}
        rightAction={
          <HeaderActions>
            <IconButton variant="ghost" onClick={() => setShowEditor(true)} aria-label="Opciones">
              <IoSettingsOutline size={20} />
            </IconButton>
            <IconButton
              variant="ghost"
              onClick={() => { setRotation(0); setShowResult(false); setResult(null); }}
              aria-label="Reiniciar"
            >
              <IoRefresh size={20} />
            </IconButton>
          </HeaderActions>
        }
      />

      <OptionsEditor
        visible={showEditor}
        items={options}
        onSave={saveOptions}
        onCancel={() => setShowEditor(false)}
        onReset={handleReset}
        allowAdd={false}
        allowDelete={false}
        title="Opciones de Ruleta"
        placeholder="Ej: Bebe doble..."
      />

      <GameContent>
        {players.length > 0 && (
          <PlayerIndicator>
            <PlayerLabel>Turno de</PlayerLabel>
            <PlayerName>{players[currentPlayerIndex]?.name}</PlayerName>
          </PlayerIndicator>
        )}

        <RouletteContainer>
          <Pointer />
          <OuterRing />
          <WheelWrapper
            animate={{ rotate: rotation }}
            transition={{ duration: 4, ease: [0.15, 0, 0.15, 1] }}
          >
            <Slices $conicGradient={`conic-gradient(${conicGradient})`} />
            {options.map((opt, i) => (
              <SliceText key={i} $angle={i * segmentSize + segmentSize / 2 - 90}>
                {opt}
              </SliceText>
            ))}
          </WheelWrapper>
          <CenterCap />
        </RouletteContainer>

        <Button size="lg" onClick={handleSpin} disabled={isSpinning}>
          {isSpinning ? 'Girando...' : 'Girar'}
        </Button>

        <AnimatePresence>
          {showResult && (
            <ResultOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={nextTurn}
            >
              <ResultCard
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <ResultLabel>Resultado</ResultLabel>
                <ResultValue>{result}</ResultValue>
                <div style={{ marginTop: '32px' }}>
                  <Button size="lg" fullWidth onClick={nextTurn}>
                    Continuar
                  </Button>
                </div>
              </ResultCard>
            </ResultOverlay>
          )}
        </AnimatePresence>
      </GameContent>
    </Container>
  );
}
