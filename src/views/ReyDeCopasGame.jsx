import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoRefresh } from 'react-icons/io5';
import { Crown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules, generateDeck, shuffleDeck } from '../data/reyDeCopasRules';
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
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(6)};
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

const Counter = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: center;
`;

const CounterText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin: 0;
`;

const KingsText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.accent};
  margin: 4px 0 0 0;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
`;

const CardContainer = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 180px;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const CardValue = styled.span`
  font-size: 64px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: #262626;
`;

const CardSuit = styled.span`
  font-size: 42px;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const RuleContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  box-sizing: border-box;
`;

const RuleName = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  text-align: center;
`;

const RuleDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const DrawContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SelectText = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(6)} 0;
`;

const CardsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
  width: 100%;
`;

const CardBack = styled(motion.button)`
  width: 90px;
  height: 126px;
  background: repeating-linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.primary} 10px,
    ${({ theme }) => theme.colors.primaryActive} 10px,
    ${({ theme }) => theme.colors.primaryActive} 20px
  );
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &::after {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 4px;
  }
`;

const GameOver = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameOverTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const GameOverText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing(8)} 0;
`;

export default function ReyDeCopasGame() {
  const navigate = useNavigate();
  const { players } = usePlayers();

  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [cardsDrawn, setCardsDrawn] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [kingsDrawn, setKingsDrawn] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const newDeck = shuffleDeck(generateDeck());
    setDeck(newDeck);
  }, []);

  const drawCard = (cardIndex) => {
    if (deck.length === 0) return;

    const card = deck[cardIndex];
    const remainingDeck = deck.filter((_, index) => index !== cardIndex);

    setCurrentCard(card);
    setDeck(remainingDeck);
    setCardsDrawn(prev => prev + 1);

    if (card.value === 'K') {
      setKingsDrawn(prev => prev + 1);
    }

    if (players.length > 0) {
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    }
  };

  const resetGame = () => {
    const newDeck = shuffleDeck(generateDeck());
    setDeck(newDeck);
    setCurrentCard(null);
    setCardsDrawn(0);
    setCurrentPlayerIndex(0);
    setKingsDrawn(0);
  };

  const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null;
  const rule = currentCard ? cardRules[currentCard.value] : null;

  return (
    <Container>
      <PageHeader
        title="Rey de Copas"
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

      <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Rey de Copas">
        <p>
          Cada uno saca una carta por turnos y hace lo que diga la regla de esa carta — la tienes
          resumida en pantalla en cuanto la sacas.
        </p>
        <p>
          El chiste está en el Rey: cada vez que sale uno, quien lo sacó vierte un poco de su
          bebida en el vaso central. El que saque el cuarto Rey se bebe el vaso entero. Ahí se
          acaba la partida.
        </p>
      </HowToPlayModal>

      <Content>
        {currentPlayer && !currentCard && (
          <PlayerIndicator>
            <PlayerLabel>Turno de</PlayerLabel>
            <PlayerName>{currentPlayer.name}</PlayerName>
          </PlayerIndicator>
        )}

        <Counter>
          <CounterText>
            {deck.length} cartas restantes
          </CounterText>
          {kingsDrawn > 0 && (
            <KingsText>
              <Crown size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Reyes: {kingsDrawn}/4
            </KingsText>
          )}
        </Counter>

        <AnimatePresence mode="wait">
          {currentCard ? (
            <CardContainer
              key="card"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card>
                <CardValue>{currentCard.value}</CardValue>
                <CardSuit>{currentCard.suit}</CardSuit>
              </Card>

              {rule && (
                <RuleContainer>
                  <RuleName>
                    <rule.icon size={22} />
                    {rule.rule}
                  </RuleName>
                  <RuleDescription>{rule.description}</RuleDescription>
                </RuleContainer>
              )}

              <Button size="lg" fullWidth onClick={() => setCurrentCard(null)}>
                Continuar
              </Button>
            </CardContainer>
          ) : (
            <DrawContainer key="draw">
              {deck.length > 0 ? (
                <>
                  <SelectText>Elige una carta</SelectText>
                  <CardsRow>
                    {deck.slice(0, Math.min(5, deck.length)).map((_, index) => (
                      <CardBack
                        key={index}
                        onClick={() => drawCard(index)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      />
                    ))}
                  </CardsRow>
                </>
              ) : (
                <GameOver>
                  <GameOverTitle>¡Juego Terminado!</GameOverTitle>
                  <GameOverText>Se robaron todas las cartas</GameOverText>
                  <Button size="lg" onClick={resetGame}>
                    <IoRefresh size={18} />
                    Jugar de Nuevo
                  </Button>
                </GameOver>
              )}
            </DrawContainer>
          )}
        </AnimatePresence>
      </Content>
    </Container>
  );
}
