import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules, generateDeck, shuffleDeck } from '../data/reyDeCopasRules';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  padding-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(15, 1, 9, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
  position: sticky;
  top: 0;
  z-index: 10;
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

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
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

const Counter = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const CounterText = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin: 0;
`;

const KingsText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondary}; // Use Gold for Kings
  margin: 4px 0 0 0;
  font-weight: bold;
`;

const CardContainer = styled(motion.div)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 20px;
  width: 200px;
  height: 280px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  margin-bottom: 24px;
`;

const CardValue = styled.span`
  font-size: 72px;
  font-weight: bold;
  color: #333;
`;

const CardSuit = styled.span`
  font-size: 48px;
  margin-top: 8px;
`;

const RuleContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  margin-bottom: 24px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  border: 2px solid ${({ theme }) => theme.colors.secondary};
`;

const RuleName = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
  text-align: center;
`;

const RuleDescription = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const NextButton = styled.button`
  width: 100%;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.primary};
  padding: 18px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const DrawContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SelectText = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 24px 0;
`;

const CardsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
  width: 100%;
`;

const CardBack = styled(motion.button)`
  width: 100px;
  height: 140px;
  background: repeating-linear-gradient(
    45deg,
    #BA0057,
    #BA0057 10px,
    #8B0042 10px,
    #8B0042 20px
  );
  border-radius: 8px;
  border: none;
  cursor: pointer;
  position: relative;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);

  &::after {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 6px;
    bottom: 6px;
    border: 2px solid #FFD800;
    border-radius: 4px;
  }
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const GameOver = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameOverTitle = styled.h2`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 12px 0;
`;

const GameOverText = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 32px 0;
`;

const RestartButton = styled.button`
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.primary};
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(1.2);
    transform: translateY(-2px);
  }
`;

export default function ReyDeCopasGame() {
  const navigate = useNavigate();
  const { players } = usePlayers();

  const [deck, setDeck] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [cardsDrawn, setCardsDrawn] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [kingsDrawn, setKingsDrawn] = useState(0);

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
      <Header>
        <IconButton onClick={() => navigate(-1)}>
          <IoArrowBack size={24} />
        </IconButton>
        <IconButton onClick={resetGame}>
          <IoRefresh size={24} />
        </IconButton>
      </Header>

      <Content>
        {currentPlayer && !currentCard && (
          <PlayerIndicator>
            <PlayerLabel>Turno de:</PlayerLabel>
            <PlayerName>{currentPlayer.name}</PlayerName>
          </PlayerIndicator>
        )}

        <Counter>
          <CounterText>
            {deck.length} cartas restantes
          </CounterText>
          {kingsDrawn > 0 && (
            <KingsText>
              👑 Reyes: {kingsDrawn}/4
            </KingsText>
          )}
        </Counter>

        <AnimatePresence mode="wait">
          {currentCard ? (
            <CardContainer
              key="card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <Card>
                <CardValue>{currentCard.value}</CardValue>
                <CardSuit>{currentCard.suit}</CardSuit>
              </Card>

              {rule && (
                <RuleContainer>
                  <RuleName>{rule.rule}</RuleName>
                  <RuleDescription>{rule.description}</RuleDescription>
                </RuleContainer>
              )}

              <NextButton onClick={() => setCurrentCard(null)}>
                Continuar
              </NextButton>
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
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      />
                    ))}
                  </CardsRow>
                </>
              ) : (
                <GameOver>
                  <GameOverTitle>¡Juego Terminado!</GameOverTitle>
                  <GameOverText>Se robaron todas las cartas</GameOverText>
                  <RestartButton onClick={resetGame}>
                    <IoRefresh size={24} />
                    Jugar de Nuevo
                  </RestartButton>
                </GameOver>
              )}
            </DrawContainer>
          )}
        </AnimatePresence>
      </Content>
    </Container>
  );
}
