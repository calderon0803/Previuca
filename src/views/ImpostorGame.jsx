import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import { wordBank } from '../data/impostorWords';
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
  perspective: 1000px;
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
  backface-visibility: hidden;
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

const SecretBox = styled(motion.div)`
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
  touch-action: none;
  box-sizing: border-box;
`;

const SecretText = styled.span`
  font-size: ${({ $size }) => $size || '32px'};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  /* "swipe" vive sobre SwipeCover, un fondo oscuro fijo (no depende del
     tema), así que usa un dorado fijo en vez del accent del tema. */
  color: ${({ theme, $variant }) =>
    $variant === 'impostor' ? theme.colors.error :
    $variant === 'swipe' ? '#D9A54B' :
    theme.colors.text.primary};
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

const WordContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  min-height: 140px;
  justify-content: center;
`;

const PlayerGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
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
  const [showHelp, setShowHelp] = useState(false);
  const [eliminatedIndexes, setEliminatedIndexes] = useState([]);
  const [caughtIndex, setCaughtIndex] = useState(null);

  const helpModal = (
    <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Impostor">
      <p>
        Todos recibís la misma palabra secreta... excepto uno, el impostor, que no recibe
        ninguna.
      </p>
      <p>
        El móvil va pasando de mano en mano: cada jugador desliza su tarjeta para ver su palabra
        (o descubrir que es el impostor) y se la pasa al siguiente sin que nadie más mire. Cuando
        todos la han visto, vais describiendo la palabra por turnos con pistas, sin decirla
        directamente. El impostor tiene que improvisar e intentar no delatarse.
      </p>
      <p>
        Cuando alguien quiera acusar a otro, toca su nombre en la pantalla y confirma. Si es el
        impostor, ha caído y bebe. Si no lo es, esa persona queda eliminada y la partida sigue con
        el resto.
      </p>
    </HowToPlayModal>
  );


  const initGame = () => {
    if (players.length < 3) return;

    const sourceWords = wordBank;
    const innocentWord = sourceWords[Math.floor(Math.random() * sourceWords.length)];
    const imposterIndex = Math.floor(Math.random() * players.length);

    const assignments = players.map((p, i) => ({
      playerName: p.name,
      role: i === imposterIndex ? 'impostor' : 'inocente',
      word: i === imposterIndex ? null : innocentWord
    }));

    setGameState({ assignments });
    setPhase('reveal');
    setRevealIndex(0);
    setIsRevealing(false);
    setHasRevealed(false);
    setSwipeOffset(0);
    setEliminatedIndexes([]);
    setCaughtIndex(null);
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

  const handleAccuse = (index) => {
    const player = players[index];
    const confirmed = window.confirm(
      `¿Seguro que queréis desvelar el rol de ${player.name}? Hacedlo solo si todos estáis de acuerdo en acusarlo.`
    );
    if (!confirmed) return;

    if (gameState.assignments[index].role === 'impostor') {
      setCaughtIndex(index);
      setPhase('result');
    } else {
      setEliminatedIndexes((prev) => [...prev, index]);
      alert(`${player.name} no era el impostor y queda eliminado. ¡Seguid jugando!`);
    }
  };

  const resetGame = () => {
    setPhase('start');
    setGameState(null);
    setEliminatedIndexes([]);
    setCaughtIndex(null);
  };

  if (players.length < 3) {
    return (
      <Container>
        <PageHeader
          title="Impostor"
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
            <Title>Faltan jugadores</Title>
            <Instruction>Este juego requiere al menos 3 jugadores para ser divertido.</Instruction>
            <Button size="lg" fullWidth onClick={() => navigate('/games')}>Volver</Button>
          </Card>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <PageHeader
        title="Impostor"
        onBack={() => navigate(-1)}
        rightAction={
          <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
            <HelpCircle size={20} />
          </IconButton>
        }
      />
      {helpModal}

      <Content>
        <AnimatePresence mode="wait">
          {phase === 'start' && (
            <Card key="start" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <PhaseLabel>Preparación</PhaseLabel>
              <Title>¿Quién es el impostor?</Title>
              <Instruction>
                Vais a repartir una palabra secreta entre todos... menos uno. Si no recuerdas cómo
                va, tienes el icono de ayuda arriba.
              </Instruction>
              <Button size="lg" fullWidth onClick={initGame}>Empezar partida</Button>
            </Card>
          )}

          {phase === 'reveal' && (
            <Card key="reveal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <Title>{players[revealIndex].name}</Title>
              <Instruction>Desliza para ver tu palabra en secreto y asegúrate de que nadie mire.</Instruction>

              <SecretBox $isRevealing={swipeOffset > 150}>
                <WordContainer>
                  {gameState.assignments[revealIndex].role === 'impostor' ? (
                    <SecretText $variant="impostor" $size="26px">
                      ERES EL IMPOSTOR
                    </SecretText>
                  ) : (
                    <SecretText>{gameState.assignments[revealIndex].word}</SecretText>
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
                  <SecretText $variant="swipe" $size="24px">DESLIZA →</SecretText>
                  <Instruction style={{ marginBottom: 0, color: '#D9A54B', fontSize: '14px' }}>
                    Arrastra para revelar
                  </Instruction>
                </SwipeCover>
              </SecretBox>

              <Button
                size="lg"
                fullWidth
                onClick={handleNextReveal}
                disabled={!isRevealing}
              >
                {revealIndex < players.length - 1 ? 'Siguiente jugador' : 'Listos'}
              </Button>
            </Card>
          )}

          {phase === 'describe' && (
            <Card key="describe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PhaseLabel>Debate</PhaseLabel>
              <Title>¡A debatir!</Title>
              <Instruction>
                Describid vuestra palabra por turnos. Cuando alguien quiera acusar, tocad su
                nombre aquí abajo.
              </Instruction>

              <PlayerGrid>
                {players.map((player, index) => {
                  const isEliminated = eliminatedIndexes.includes(index);
                  return (
                    <Button
                      key={player.id ?? index}
                      variant="secondary"
                      fullWidth
                      disabled={isEliminated}
                      onClick={() => handleAccuse(index)}
                    >
                      {isEliminated ? `${player.name} (eliminado)` : player.name}
                    </Button>
                  );
                })}
              </PlayerGrid>

              <Button variant="ghost" fullWidth onClick={resetGame}>Cancelar partida</Button>
            </Card>
          )}

          {phase === 'result' && (
            <Card key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <PhaseLabel>Resultado</PhaseLabel>
              <Title>¡{players[caughtIndex]?.name} era el impostor!</Title>
              <Instruction>
                Que beba. La palabra secreta era «
                {gameState.assignments.find((a) => a.role !== 'impostor')?.word}».
              </Instruction>

              <Button size="lg" fullWidth onClick={resetGame}>Nueva partida</Button>
            </Card>
          )}
        </AnimatePresence>
      </Content>
    </Container>
  );
}
