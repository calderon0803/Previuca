import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoRefresh } from 'react-icons/io5';
import { Circle, ArrowDownToLine, ArrowUpFromLine, ArrowUp, ArrowDown, CheckCircle2, XCircle, PartyPopper } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const Container = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    flex-direction: column;
`;

const Content = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(3)};
    gap: ${({ theme }) => theme.spacing(3)};
`;

const Card = styled.div`
    width: 140px;
    height: 200px;
    background: ${props => props.$hidden ? props.theme.colors.background : '#fff'};
    border-radius: ${({ theme }) => theme.radii.md};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(2)};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transition: transform ${({ theme }) => theme.transitions.fast};
    cursor: ${props => props.$hidden ? 'default' : 'pointer'};
    position: relative;

    ${props => props.$hidden && `
        background: repeating-linear-gradient(
            45deg,
            ${props.theme.colors.primary},
            ${props.theme.colors.primary} 10px,
            ${props.theme.colors.primaryActive} 10px,
            ${props.theme.colors.primaryActive} 20px
        );
        &::after {
            content: '';
            position: absolute;
            top: 8px;
            left: 8px;
            right: 8px;
            bottom: 8px;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 4px;
        }
    `}

    ${props => !props.$hidden && `
        &:hover {
            transform: scale(1.03);
        }
    `}
`;

const CardValue = styled.div`
    font-size: 44px;
    color: ${props => props.$red ? '#C0392B' : '#262626'};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    z-index: 2;
`;

const CardSuit = styled.div`
    font-size: 56px;
    z-index: 2;
`;

const ButtonsContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing(3)};
    width: 100%;
    max-width: 400px;
`;

const ControlsWrapper = styled.div`
    width: 100%;
    max-width: 400px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    margin-top: auto;
    margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Message = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme, $success }) => $success ? theme.colors.success : theme.colors.error};
    text-align: center;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing(2)};
`;

const Instructions = styled.div`
    text-align: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    max-width: 400px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const PlayerIndicator = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
    border-radius: ${({ theme }) => theme.radii.md};
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
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
`;

const PlayerCardsContainer = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing(1.5)};
    flex-wrap: wrap;
    justify-content: center;
    margin-top: ${({ theme }) => theme.spacing(2)};
    max-width: 400px;
`;

const MiniCard = styled.div`
    width: 38px;
    height: 52px;
    background: #fff;
    border-radius: ${({ theme }) => theme.radii.sm};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    font-size: 12px;
    color: ${props => props.$red ? '#C0392B' : '#262626'};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
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

const MessageIcon = ({ tone }) => {
    if (tone === 'success') return <CheckCircle2 size={20} />;
    if (tone === 'celebrate') return <PartyPopper size={20} />;
    if (tone === 'error') return <XCircle size={20} />;
    return null;
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
    const [messageTone, setMessageTone] = useState(null); // success | error | celebrate | null
    const [gameState, setGameState] = useState('pico'); // pico, palo, dentro-fuera, mayor-menor
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playersWhoAnswered, setPlayersWhoAnswered] = useState(0); // Contador de jugadores que respondieron
    const [playerCards, setPlayerCards] = useState({}); // Cartas de cada jugador {playerIndex: [cards]}
    const [currentCardIndexInSequence, setCurrentCardIndexInSequence] = useState(0); // Para la ronda mayor-menor
    const [usedCardsInSequence, setUsedCardsInSequence] = useState([]); // Cartas usadas en la secuencia del jugador actual

    const clearMessage = () => {
        setMessage('');
        setMessageTone(null);
    };

    const showMessage = (text, tone) => {
        setMessage(text);
        setMessageTone(tone);
    };

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
        clearMessage();
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
                clearMessage();
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
                clearMessage();
            } else if (gameState === 'dentro-fuera') {
                // Iniciar ronda mayor-menor
                setGameState('mayor-menor');
                setPlayersWhoAnswered(0);
                setCurrentPlayerIndex(0);
                setCurrentCardIndexInSequence(0);
                setUsedCardsInSequence([]);
                setRevealed(false);
                clearMessage();

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
            clearMessage();

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
                showMessage('¡Correcto!', 'success');
            } else {
                showMessage('¡Incorrecto! Bebe', 'error');
            }
        } else if (gameState === 'palo') {
            // Adivinar el palo exacto
            correct = choice === suitNames[currentCard.suit];

            if (correct) {
                showMessage('¡Correcto!', 'success');
            } else {
                showMessage(`Era ${suitNames[currentCard.suit]}! Bebe`, 'error');
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
                showMessage('¡Correcto! Reparte 3 tragos', 'celebrate');
            } else {
                if (card1Number === card2Number) {
                    showMessage(`Era ${isDentro ? 'dentro' : 'fuera'} (ambas cartas eran ${currentPlayerCardsList[0].value}). Bebe 2 tragos`, 'error');
                } else {
                    showMessage(`Era ${isDentro ? 'dentro' : 'fuera'} (${minRange}-${maxRange}). Bebe 2 tragos`, 'error');
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

            // Si sale el mismo valor no es ni "mayor" ni "menor" -> fallo, sea cual sea la elección.
            correct = (choice === 'mayor' && isMayor) || (choice === 'menor' && isMenor);

            if (correct) {
                // Añadir carta a las usadas en esta secuencia
                setUsedCardsInSequence([...usedCardsInSequence, currentCard]);

                // Si completó todas sus cartas
                if (currentCardIndexInSequence >= currentPlayerCardsList.length - 1) {
                    showMessage('¡Completaste la secuencia! Reparte 5 tragos', 'celebrate');
                } else {
                    showMessage('¡Correcto! Siguiente carta', 'success');
                    setTimeout(() => {
                        setCurrentCardIndexInSequence(currentCardIndexInSequence + 1);
                        setRevealed(false);
                        clearMessage();
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
                showMessage('¡Fallaste! Las cartas usadas van al final. Bebe y reinicia', 'error');
                // Devolver cartas usadas al final de la baraja
                setTimeout(() => {
                    setUsedCardsInSequence([]);
                    setCurrentCardIndexInSequence(0);
                    setRevealed(false);
                    clearMessage();
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
                        <Button variant="secondary" onClick={() => handleChoice('rojo')}>
                            <Circle size={16} fill="#C0392B" color="#C0392B" /> Rojo
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('negro')}>
                            <Circle size={16} fill="#262626" color="#262626" /> Negro
                        </Button>
                    </>
                );
            } else if (gameState === 'palo') {
                return (
                    <>
                        <Button variant="secondary" onClick={() => handleChoice('Pica')}>
                            ♠️ Pica
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('Corazón')}>
                            ♥️ Corazón
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('Diamante')}>
                            ♦️ Diamante
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('Trébol')}>
                            ♣️ Trébol
                        </Button>
                    </>
                );
            } else if (gameState === 'dentro-fuera') {
                return (
                    <>
                        <Button variant="secondary" onClick={() => handleChoice('dentro')}>
                            <ArrowDownToLine size={16} /> Dentro
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('fuera')}>
                            <ArrowUpFromLine size={16} /> Fuera
                        </Button>
                    </>
                );
            } else if (gameState === 'mayor-menor') {
                return (
                    <>
                        <Button variant="secondary" onClick={() => handleChoice('mayor')}>
                            <ArrowUp size={16} /> Mayor
                        </Button>
                        <Button variant="secondary" onClick={() => handleChoice('menor')}>
                            <ArrowDown size={16} /> Menor
                        </Button>
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
            showMessage('¡Juego completado!', 'celebrate');
        } else {
            setCurrentPlayerIndex(nextPlayer);
            setCurrentCardIndexInSequence(0);
            setUsedCardsInSequence([]);
            setRevealed(false);
            clearMessage();

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
            <PageHeader
                title="Pico Palo"
                onBack={() => navigate('/games')}
                rightAction={
                    <IconButton variant="ghost" onClick={generateNewCard} aria-label="Nueva carta">
                        <IoRefresh size={20} />
                    </IconButton>
                }
            />

            <Content>
                {currentPlayer && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de</PlayerLabel>
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

                <Message $success={messageTone === 'success' || messageTone === 'celebrate'}>
                    <MessageIcon tone={messageTone} />
                    {message}
                </Message>

                <ControlsWrapper>
                    <ButtonsContainer>
                        {renderButtons()}
                    </ButtonsContainer>

                    {canAdvancePlayer && players.length > 0 && (
                        <Button fullWidth onClick={advanceToNextPlayer}>
                            {playersWhoAnswered + 1 < totalPlayers ? 'Siguiente jugador' : 'Siguiente pregunta'}
                        </Button>
                    )}

                    {completedMayorMenorSequence && (
                        <Button fullWidth onClick={handleNextPlayerInMayorMenor}>
                            Siguiente jugador
                        </Button>
                    )}

                    {isLastPhaseFinished && (
                        <Button fullWidth onClick={handleNext}>
                            Nueva ronda <IoRefresh size={18} />
                        </Button>
                    )}
                </ControlsWrapper>
            </Content>
        </Container>
    );
};

export default PicoPaloGame;
