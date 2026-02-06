import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { IoArrowBack, IoRefresh, IoSettingsOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import OptionsEditor from '../components/OptionsEditor';

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
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`;

const GameContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 24px;
  position: relative;
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

const RouletteContainer = styled.div`
  position: relative;
  width: min(85vw, 400px);
  aspect-ratio: 1;
  margin-bottom: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OuterRing = styled.div`
  position: absolute;
  width: 104%;
  height: 104%;
  border-radius: 50%;
  background: linear-gradient(135deg, #FFD800 0%, #B8860B 50%, #FFD800 100%);
  box-shadow: 0 0 30px rgba(255, 216, 0, 0.3), inset 0 0 10px rgba(0,0,0,0.5);
  z-index: 0;
`;

const WheelWrapper = styled(motion.div)`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #0F0109;
  z-index: 1;
  box-shadow: inset 0 0 50px rgba(0,0,0,0.8);
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
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 4px rgba(0,0,0,1);
  pointer-events: none;
  white-space: nowrap;
  padding-left: 45px; /* Clear the center cap (30px radius) + safety */
  box-sizing: border-box;
`;

const Pointer = styled.div`
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 50px;
  z-index: 10;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.6));
  
  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 35px solid ${({ theme }) => theme.colors.secondary};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 10px #fff;
  }
`;

const CenterCap = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  background: radial-gradient(circle at center, #fff 0%, #FFD800 30%, #BA0057 100%);
  border-radius: 50%;
  z-index: 5;
  border: 4px solid #0F0109;
  box-shadow: 0 0 20px rgba(186, 0, 87, 0.6), inset 0 0 10px rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
  }
`;

const SpinButton = styled(motion.button)`
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: scale(0.95);
  }
`;

const ResultOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 1, 9, 0.9);
  backdrop-filter: blur(10px);
  z-index: 200;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
  text-align: center;
`;

const ResultCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border: 3px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 32px;
  padding: 40px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 0 60px ${({ theme }) => `${theme.colors.secondary}30`};
`;

// Redundant options constant removed to avoid shadowing confusion

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

  // Alternating colors: primary and secondary
  const getColors = (count) => {
    const baseColors = ['#BA0057', '#FFD800'];
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
      <Header>
        <IconButton onClick={() => navigate('/games')}>
          <IoArrowBack size={24} />
        </IconButton>
        <HeaderTitle>Ruleta</HeaderTitle>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IconButton onClick={() => setShowEditor(true)}>
            <IoSettingsOutline size={22} />
          </IconButton>
          <IconButton onClick={() => { setRotation(0); setShowResult(false); setResult(null); }}>
            <IoRefresh size={24} />
          </IconButton>
        </div>
      </Header>

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
            <PlayerLabel>Turno de:</PlayerLabel>
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

        <SpinButton
          onClick={handleSpin}
          disabled={isSpinning}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSpinning ? 'GIRANDO...' : '¡GIRAR!'}
        </SpinButton>

        <AnimatePresence>
          {showResult && (
            <ResultOverlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={nextTurn}
            >
              <ResultCard
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 style={{ color: '#FFD800', margin: '0 0 15px 0', letterSpacing: '3px' }}>RESULTADO</h3>
                  <h2 style={{ color: '#fff', fontSize: '32px', margin: 0, lineHeight: 1.2 }}>{result}</h2>
                </motion.div>
                <IconButton
                  onClick={nextTurn}
                  style={{ width: '100%', marginTop: '30px', height: '54px' }}
                >
                  CONTINUAR
                </IconButton>
              </ResultCard>
            </ResultOverlay>
          )}
        </AnimatePresence>
      </GameContent>
    </Container>
  );
}
