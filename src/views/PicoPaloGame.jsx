import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh, IoArrowForward } from 'react-icons/io5';
import { usePlayers } from '../contexts/PlayersContext';

const Container = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: rgba(15, 1, 9, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
    position: sticky;
    top: 0;
    z-index: 10;
`;

const HeaderTitle = styled.h1`
    color: #fff;
    margin: 0;
    font-size: 24px;
`;

const IconButton = styled.button`
    background: ${({ theme }) => theme.colors.surface};
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    color: #fff;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    transition: background 0.2s;

    &:hover {
        background: ${({ theme }) => theme.colors.primary};
    }
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 24px 12px;
    gap: 12px;
`;

const Card = styled.div`
    width: 140px;
    height: 200px;
    background: ${props => props.$hidden ? '#0F0109' : '#fff'};
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s;
    cursor: ${props => props.$hidden ? 'default' : 'pointer'};
    position: relative;

    ${props => props.$hidden && `
        background: repeating-linear-gradient(
            45deg,
            #BA0057,
            #BA0057 10px,
            #8B0042 10px,
            #8B0042 20px
        );
        &::after {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
            border: 3px solid #FFD800;
            border-radius: 4px;
        }
    `}

    ${props => !props.$hidden && `
        &:hover {
            transform: scale(1.05);
        }
    `}
`;

const CardValue = styled.div`
    font-size: 48px;
    color: ${props => props.$red ? '#ff0000' : '#000'};
    font-weight: bold;
    z-index: 2;
`;

const CardSuit = styled.div`
    font-size: 60px;
    z-index: 2;
`;

const ButtonsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    width: 100%;
    max-width: 400px;
`;

const ControlsWrapper = styled.div`
    width: 100%;
    max-width: 400px;
    height: 140px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: auto;
    margin-bottom: 20px;
`;

const ChoiceButton = styled.button`
    padding: 14px;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    background: transparent;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: ${({ theme }) => theme.colors.secondary};
        color: #000;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Message = styled.div`
    font-size: 18px;
    font-weight: bold;
    color: ${props => props.$success ? '#4CAF50' : '#ff4444'};
    text-align: center;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Instructions = styled.div`
    text-align: center;
    color: #aaa;
    font-size: 14px;
    max-width: 400px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PlayerIndicator = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    padding: 8px 16px;
    border-radius: 12px;
    margin-bottom: 0;
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
    font-size: 20px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
`;

const PlayerCardsContainer = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 8px;
    max-width: 400px;
`;

const MiniCard = styled.div`
    width: 40px;
    height: 56px;
    background: #fff;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    font-size: 12px;
    color: ${props => props.$red ? '#ff0000' : '#000'};
    font-weight: bold;
`;

const NextPlayerButton = styled.button`
    width: 100%;
    max-width: 400px;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: ${({ theme }) => theme.colors.primary};
    padding: 12px;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 0;
    transition: all 0.2s;
    
    &:hover {
        background: ${({ theme }) => theme.colors.primary};
        transform: translateY(-2px);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const suits = ['♠️', '♥️', '♦️', '♣️'];
const suitNames = {
    '♠️': 'Pica',
    '♥️': 'Corazón',
    '♦️': 'Diamante',
    '♣️': 'Trébol'
};
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const valueNumbers = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
};

const PicoPaloGame = () => {
    const navigate = useNavigate();
    const { players } = usePlayers();

    // Crear baraja completa al inicio
    const createFullDeck = () => {
        const deck = [];
        suits.forEach(suit => {
            values.forEach(value => {
                const isRed = suit === '♥️' || suit === '♦️';
                deck.push({ suit, value, isRed });
            });
        });
        return deck;
    };

    const [deck, setDeck] = useState(() => {
        const fullDeck = createFullDeck();
        return fullDeck;
    });
    const [currentCard, setCurrentCard] = useState(() => {
        const fullDeck = createFullDeck();
        const randomIndex = Math.floor(Math.random() * fullDeck.length);
        const card = fullDeck[randomIndex];
        // Actualizar el deck removiendo la carta inicial
        setTimeout(() => {
            setDeck(fullDeck.filter((_, index) => index !== randomIndex));
        }, 0);
        return card;
    });
    const [previousCards, setPreviousCards] = useState([]); // Cartas anteriores para dentro/fuera
    const [revealed, setRevealed] = useState(false);
    const [message, setMessage] = useState('');
    const [gameState, setGameState] = useState('pico'); // pico, palo, dentro-fuera, mayor-menor
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playersWhoAnswered, setPlayersWhoAnswered] = useState(0); // Contador de jugadores que respondieron
    const [playerCards, setPlayerCards] = useState({}); // Cartas de cada jugador {playerIndex: [cards]}
    const [currentCardIndexInSequence, setCurrentCardIndexInSequence] = useState(0); // Para la ronda mayor-menor
    const [usedCardsInSequence, setUsedCardsInSequence] = useState([]); // Cartas usadas en la secuencia del jugador actual

    const drawCardFromDeck = (currentDeck) => {
        const deckToUse = currentDeck.length === 0 ? createFullDeck() : currentDeck;
        console.log('Baraja actual tiene', deckToUse.length, 'cartas');
        const randomIndex = Math.floor(Math.random() * deckToUse.length);
        const drawnCard = deckToUse[randomIndex];
        const remainingDeck = deckToUse.filter((_, index) => index !== randomIndex);
        console.log('Sacó', drawnCard.value + drawnCard.suit, '- Quedan', remainingDeck.length, 'cartas');
        return { drawnCard, remainingDeck };
    };

    const generateNewCard = () => {
        setDeck(prevDeck => {
            const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
            setCurrentCard(drawnCard);
            return remainingDeck;
        });

        setRevealed(false);
        setMessage('');
        setGameState('pico');
        setPreviousCards([]);
    };

    const advanceToNextPlayer = () => {
        // Guardar la carta actual del jugador actual
        if (gameState !== 'mayor-menor') {
            const currentPlayerCards = playerCards[currentPlayerIndex] || [];
            setPlayerCards({
                ...playerCards,
                [currentPlayerIndex]: [...currentPlayerCards, currentCard]
            });
        }

        const nextAnswered = playersWhoAnswered + 1;
        const totalPlayers = players.length || 1;

        // Si todos los jugadores respondieron esta pregunta
        if (nextAnswered >= totalPlayers) {
            // Avanzar a la siguiente fase
            if (gameState === 'pico') {
                setPreviousCards([currentCard]);
                setGameState('palo');

                // Tomar nueva carta de la baraja
                setDeck(prevDeck => {
                    const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                    setCurrentCard(drawnCard);
                    return remainingDeck;
                });

                setPlayersWhoAnswered(0);
                setCurrentPlayerIndex(0);
                setRevealed(false);
                setMessage('');
            } else if (gameState === 'palo') {
                setPreviousCards([...previousCards, currentCard]);
                setGameState('dentro-fuera');

                // Tomar nueva carta de la baraja
                setDeck(prevDeck => {
                    const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                    setCurrentCard(drawnCard);
                    return remainingDeck;
                });

                setPlayersWhoAnswered(0);
                setCurrentPlayerIndex(0);
                setRevealed(false);
                setMessage('');
            } else if (gameState === 'dentro-fuera') {
                // Iniciar ronda mayor-menor
                setGameState('mayor-menor');
                setPlayersWhoAnswered(0);
                setCurrentPlayerIndex(0);
                setCurrentCardIndexInSequence(0);
                setUsedCardsInSequence([]);
                setRevealed(false);
                setMessage('');

                // Tomar primera carta para el primer jugador
                setDeck(prevDeck => {
                    const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                    setCurrentCard(drawnCard);
                    return remainingDeck;
                });
            }
        } else {
            // Siguiente jugador con la misma pregunta - sacar NUEVA carta
            setPlayersWhoAnswered(nextAnswered);
            setCurrentPlayerIndex((currentPlayerIndex + 1) % totalPlayers);
            setRevealed(false);
            setMessage('');

            // Sacar nueva carta para el siguiente jugador
            if (gameState !== 'mayor-menor') {
                setDeck(prevDeck => {
                    const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                    setCurrentCard(drawnCard);
                    return remainingDeck;
                });
            }
        }
    };

    const handleChoice = (choice) => {
        if (!currentCard || revealed) return;

        setRevealed(true);
        let correct = false;

        if (gameState === 'pico') {
            // Adivinar si es rojo (corazón/diamante) o negro (pica/trébol)
            const isRed = currentCard.suit === '♥️' || currentCard.suit === '♦️';
            correct = (choice === 'rojo' && isRed) || (choice === 'negro' && !isRed);

            if (correct) {
                setMessage('✅ ¡Correcto!');
            } else {
                setMessage('❌ ¡Incorrecto! Bebe');
            }
        } else if (gameState === 'palo') {
            // Adivinar el palo exacto
            correct = choice === suitNames[currentCard.suit];

            if (correct) {
                setMessage('✅ ¡Correcto!');
            } else {
                setMessage(`❌ Era ${suitNames[currentCard.suit]}! Bebe`);
            }
        } else if (gameState === 'dentro-fuera') {
            // dentro-fuera: adivinar si la tercera carta está dentro o fuera del rango de las 2 anteriores
            const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
            // Necesitamos al menos 2 cartas previas
            if (currentPlayerCardsList.length < 2) return;

            const cardNumber = valueNumbers[currentCard.value];
            const card1Number = valueNumbers[currentPlayerCardsList[0].value];
            const card2Number = valueNumbers[currentPlayerCardsList[1].value];

            const minRange = Math.min(card1Number, card2Number);
            const maxRange = Math.max(card1Number, card2Number);

            // Si las dos cartas anteriores son iguales, solo es "dentro" si la nueva carta es exactamente igual
            let isDentro;
            if (card1Number === card2Number) {
                isDentro = cardNumber === card1Number;
            } else {
                isDentro = cardNumber > minRange && cardNumber < maxRange;
            }

            correct = (choice === 'dentro' && isDentro) || (choice === 'fuera' && !isDentro);

            if (correct) {
                setMessage('🎉 ¡Correcto! Reparte 3 tragos');
            } else {
                if (card1Number === card2Number) {
                    setMessage(`❌ Era ${isDentro ? 'dentro' : 'fuera'} (ambas cartas eran ${currentPlayerCardsList[0].value}). Bebe 2 tragos`);
                } else {
                    setMessage(`❌ Era ${isDentro ? 'dentro' : 'fuera'} (${minRange}-${maxRange}). Bebe 2 tragos`);
                }
            }
        } else if (gameState === 'mayor-menor') {
            // Ronda extra: adivinar si la siguiente carta es mayor o menor que las del jugador
            const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
            const referenceCard = currentPlayerCardsList[currentCardIndexInSequence];

            if (!referenceCard) return;

            const newCardNumber = valueNumbers[currentCard.value];
            const referenceNumber = valueNumbers[referenceCard.value];

            const isMayor = newCardNumber > referenceNumber;
            const isMenor = newCardNumber < referenceNumber;

            correct = (choice === 'mayor' && isMayor) || (choice === 'menor' && isMenor) || (newCardNumber === referenceNumber);

            if (correct) {
                // Añadir carta a las usadas en esta secuencia
                setUsedCardsInSequence([...usedCardsInSequence, currentCard]);

                // Si completó todas sus cartas
                if (currentCardIndexInSequence >= currentPlayerCardsList.length - 1) {
                    setMessage('🎉 ¡Completaste la secuencia! Reparte 5 tragos');
                } else {
                    setMessage('✅ ¡Correcto! Siguiente carta');
                    setTimeout(() => {
                        setCurrentCardIndexInSequence(currentCardIndexInSequence + 1);
                        setRevealed(false);
                        setMessage('');
                        // Tomar nueva carta
                        setDeck(prevDeck => {
                            const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                            setCurrentCard(drawnCard);
                            return remainingDeck;
                        });
                    }, 1500);
                }
            } else {
                const cardsToReturn = [...usedCardsInSequence, currentCard];
                setMessage('❌ ¡Fallaste! Las cartas usadas van al final. Bebe y reinicia');
                // Devolver cartas usadas al final de la baraja
                setTimeout(() => {
                    setUsedCardsInSequence([]);
                    setCurrentCardIndexInSequence(0);
                    setRevealed(false);
                    setMessage('');
                    // Tomar nueva carta y devolver las usadas al final
                    setDeck(prevDeck => {
                        const deckWithReturned = [...prevDeck, ...cardsToReturn];
                        const { drawnCard, remainingDeck } = drawCardFromDeck(deckWithReturned);
                        setCurrentCard(drawnCard);
                        return remainingDeck;
                    });
                }, 2000);
            }
        }
    };

    const handleNext = () => {
        setCurrentPlayerIndex(0);
        setPlayersWhoAnswered(0);
        generateNewCard();
    };

    const renderButtons = () => {
        if (!revealed) {
            if (gameState === 'pico') {
                return (
                    <>
                        <ChoiceButton onClick={() => handleChoice('rojo')}>
                            🔴 Rojo
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('negro')}>
                            ⚫ Negro
                        </ChoiceButton>
                    </>
                );
            } else if (gameState === 'palo') {
                return (
                    <>
                        <ChoiceButton onClick={() => handleChoice('Pica')}>
                            ♠️ Pica
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('Corazón')}>
                            ♥️ Corazón
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('Diamante')}>
                            ♦️ Diamante
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('Trébol')}>
                            ♣️ Trébol
                        </ChoiceButton>
                    </>
                );
            } else if (gameState === 'dentro-fuera') {
                return (
                    <>
                        <ChoiceButton onClick={() => handleChoice('dentro')}>
                            📥 Dentro
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('fuera')}>
                            📤 Fuera
                        </ChoiceButton>
                    </>
                );
            } else if (gameState === 'mayor-menor') {
                return (
                    <>
                        <ChoiceButton onClick={() => handleChoice('mayor')}>
                            ⬆️ Mayor
                        </ChoiceButton>
                        <ChoiceButton onClick={() => handleChoice('menor')}>
                            ⬇️ Menor
                        </ChoiceButton>
                    </>
                );
            }
        }
        return null;
    };

    const handleNextPlayerInMayorMenor = () => {
        const totalPlayers = players.length || 1;
        const nextPlayer = (currentPlayerIndex + 1) % totalPlayers;

        // Si ya pasaron todos los jugadores, terminar el juego
        if (nextPlayer === 0) {
            setMessage('🎉 ¡Juego completado!');
        } else {
            setCurrentPlayerIndex(nextPlayer);
            setCurrentCardIndexInSequence(0);
            setUsedCardsInSequence([]);
            setRevealed(false);
            setMessage('');

            // Tomar nueva carta para el siguiente jugador
            setDeck(prevDeck => {
                const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                setCurrentCard(drawnCard);
                return remainingDeck;
            });
        }
    };

    const getInstructions = () => {
        if (gameState === 'pico') {
            return '¿La carta es roja o negra?';
        } else if (gameState === 'palo') {
            return '¿Qué palo es?';
        } else if (gameState === 'dentro-fuera') {
            // dentro-fuera: mostrar el rango de las 2 cartas anteriores del jugador actual
            const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
            if (currentPlayerCardsList.length >= 2) {
                const c1 = currentPlayerCardsList[0];
                const c2 = currentPlayerCardsList[1];
                const v1 = valueNumbers[c1.value];
                const v2 = valueNumbers[c2.value];

                // Mostrar siempre ordenado: Menor - Mayor
                if (v1 <= v2) {
                    return `¿La carta está dentro (${c1.value}-${c2.value}) o fuera?`;
                } else {
                    return `¿La carta está dentro (${c2.value}-${c1.value}) o fuera?`;
                }
            }
            return '¿El valor está dentro o fuera?';
        } else if (gameState === 'mayor-menor') {
            const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
            const referenceCard = currentPlayerCardsList[currentCardIndexInSequence];
            if (referenceCard) {
                return `¿La carta es mayor o menor que ${referenceCard.value}${referenceCard.suit}? (${currentCardIndexInSequence + 1}/${currentPlayerCardsList.length})`;
            }
            return 'Ronda final: Mayor o Menor';
        }
    };

    const currentPlayer = players.length > 0 ? players[currentPlayerIndex] : null;
    const totalPlayers = players.length || 1;
    const isLastPhaseFinished = gameState === 'dentro-fuera' && revealed && playersWhoAnswered >= totalPlayers;
    const canAdvancePlayer = revealed && playersWhoAnswered < totalPlayers && gameState !== 'mayor-menor';
    const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
    const completedMayorMenorSequence = gameState === 'mayor-menor' && revealed && currentCardIndexInSequence >= currentPlayerCardsList.length - 1 && message.includes('Completaste');

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/games')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Pico Palo</HeaderTitle>
                <IconButton onClick={generateNewCard}>
                    <IoRefresh size={24} />
                </IconButton>
            </Header>

            <Content>
                {currentPlayer && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de:</PlayerLabel>
                        <PlayerName>{currentPlayer.name}</PlayerName>
                        {playerCards[currentPlayerIndex] && playerCards[currentPlayerIndex].length > 0 && (
                            <PlayerCardsContainer>
                                {playerCards[currentPlayerIndex].map((card, index) => (
                                    <MiniCard key={index} $red={card.isRed}>
                                        {card.value}
                                        <span style={{ fontSize: '16px' }}>{card.suit}</span>
                                    </MiniCard>
                                ))}
                            </PlayerCardsContainer>
                        )}
                    </PlayerIndicator>
                )}

                <Instructions>{getInstructions()}</Instructions>

                {currentCard && (
                    <Card $hidden={!revealed}>
                        {revealed && (
                            <>
                                <CardValue $red={currentCard.isRed}>
                                    {currentCard.value}
                                </CardValue>
                                <CardSuit>{currentCard.suit}</CardSuit>
                            </>
                        )}
                    </Card>
                )}

                <Message $success={message.includes('Correcto') || message.includes('Perfecto') || message.includes('GANASTE')}>
                    {message}
                </Message>

                <ControlsWrapper>
                    <ButtonsContainer>
                        {renderButtons()}
                    </ButtonsContainer>

                    {canAdvancePlayer && players.length > 0 && (
                        <NextPlayerButton onClick={advanceToNextPlayer}>
                            {playersWhoAnswered + 1 < totalPlayers ? 'Siguiente jugador' : 'Siguiente pregunta'}
                        </NextPlayerButton>
                    )}

                    {completedMayorMenorSequence && (
                        <NextPlayerButton onClick={handleNextPlayerInMayorMenor}>
                            Siguiente jugador
                        </NextPlayerButton>
                    )}

                    {isLastPhaseFinished && (
                        <NextPlayerButton onClick={handleNext}>
                            Nueva ronda <IoRefresh size={20} />
                        </NextPlayerButton>
                    )}
                </ControlsWrapper>
            </Content>
        </Container>
    );
};

export default PicoPaloGame;
