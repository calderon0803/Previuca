import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules, generateDeck, shuffleDeck } from '../data/reyDeCopasRules';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  padding-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const IconButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255,255,255,0.2);
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #fff;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.3);
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
  background: rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 16px;
  margin-bottom: 20px;
  text-align: center;
`;

const PlayerLabel = styled.p`
  font-size: 14px;
  color: rgba(255,255,255,0.9);
  margin: 0 0 4px 0;
`;

const PlayerName = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin: 0;
`;

const Counter = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const CounterText = styled.p`
  font-size: 18px;
  color: #fff;
  font-weight: 600;
  margin: 0;
`;

const KingsText = styled.p`
  font-size: 16px;
  color: #fff;
  margin: 4px 0 0 0;
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
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  margin-bottom: 24px;
  box-sizing: border-box;
`;

const RuleName = styled.h3`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0 0 8px 0;
  text-align: center;
`;

const RuleDescription = styled.p`
  font-size: 16px;
  color: #666;
  text-align: center;
  line-height: 1.5;
  margin: 0;
`;

const NextButton = styled.button`
  width: 100%;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 18px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  &:hover {
    filter: brightness(1.05);
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
  color: #fff;
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
  background: #fff;
  border-radius: 16px;
  width: 80px;
  height: 110px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-size: 40px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  
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
  color: #fff;
  margin: 0 0 12px 0;
`;

const GameOverText = styled.p`
  font-size: 18px;
  color: #fff;
  margin: 0 0 32px 0;
`;

const RestartButton = styled.button`
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  
  &:hover {
    filter: brightness(1.05);
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
                                        {deck.slice(0, Math.min(6, deck.length)).map((_, index) => (
                                            <CardBack
                                                key={index}
                                                onClick={() => drawCard(index)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                🃏
                                            </CardBack>
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
