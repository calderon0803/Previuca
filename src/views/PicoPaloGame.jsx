import React, { useState } from 'react';
import styled from 'styled-components';
import { Circle, ArrowDownToLine, ArrowUpFromLine, ArrowUp, ArrowDown, Hash, Spade } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import Button from '../components/ui/Button';

const GAME = gameById.picopalo;

// Las cinco fases, en orden, para el indicador de la cabecera.
const PHASES = ['pico', 'par-impar', 'dentro-fuera', 'palo', 'mayor-menor'];
const PHASE_NAMES = {
    'pico': 'Fase 1 · color',
    'par-impar': 'Fase 2 · par o impar',
    'dentro-fuera': 'Fase 3 · dentro o fuera',
    'palo': 'Fase 4 · el palo',
    'mayor-menor': 'Ronda final · mayor o menor',
};

// El palo llega como emoji desde la baraja; para pintarlo en rojo o negro
// sobre el papel claro de la carta hace falta el glifo monocromo.
const glyph = (suit) => String(suit || '').replace('️', '');
const ink = (red) => (red ? '#b0343c' : '#22242e');

const PhaseKicker = styled.p`
    margin: 0 0 2px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.12em;
`;

const Question = styled.p`
    margin: 0 0 ${({ theme }) => theme.spacing(4.5)};
    font-size: 22px;
    line-height: 1.3;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    letter-spacing: -0.02em;
    text-align: center;
    max-width: 300px;
`;

const Card = styled.div`
    position: relative;
    width: 132px;
    height: 188px;
    flex-shrink: 0;
    border-radius: ${({ theme }) => theme.radii.sm};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${({ theme, $hidden }) => ($hidden ? theme.colors.surface : theme.colors.text.primary)};
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);

    ${({ $hidden }) =>
        $hidden &&
        `
        &::after {
            content: '';
            position: absolute;
            inset: 9px;
            border: 1px solid rgba(63, 93, 158, 0.45);
            border-radius: 4px;
        }
    `}
`;

const CardValue = styled.span`
    font-size: 46px;
    line-height: 1;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ $red }) => ink($red)};
`;

const CardSuit = styled.span`
    font-size: 38px;
    margin-top: 4px;
    color: ${({ $red }) => ink($red)};
`;

const BackGlyph = styled.span`
    display: flex;
    opacity: 0.5;
    color: ${GAME.color};
`;

const Message = styled.p`
    margin: ${({ theme }) => theme.spacing(4)} 0 0;
    min-height: 22px;
    font-size: 15px;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    text-align: center;
    color: ${({ theme, $tone }) =>
        $tone === 'success' ? theme.colors.success : $tone === 'error' ? theme.colors.error : theme.colors.text.muted};
`;

const MiniCards = styled.div`
    display: flex;
    gap: 6px;
    margin-top: ${({ theme }) => theme.spacing(3.5)};
    flex-wrap: wrap;
    justify-content: center;
`;

const MiniCard = styled.span`
    width: 34px;
    height: 46px;
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.text.primary};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ $red }) => ink($red)};
`;

const Steps = styled.div`
    display: flex;
    gap: 5px;
    padding: 0 ${({ theme }) => theme.spacing(5)} 4px;
    flex-shrink: 0;
`;

const Step = styled.span`
    flex: 1;
    height: 3px;
    border-radius: 2px;
    background: ${({ theme, $on }) => ($on ? GAME.color : theme.colors.border)};
`;

const Options = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing(2.5)};
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

// El icono depende solo de si se acertó o no — nunca cambia para un mismo resultado.
const MessageIcon = ({ tone }) => {
    if (tone === 'success') return <CheckCircle2 size={20} />;
    if (tone === 'error') return <XCircle size={20} />;
    return null;
};

const PicoPaloGame = () => {
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
    const [revealed, setRevealed] = useState(false);
    const [message, setMessage] = useState('');
    const [messageTone, setMessageTone] = useState(null); // success | error | null
    const [gameState, setGameState] = useState('pico'); // pico, par-impar, dentro-fuera, palo, mayor-menor
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playersWhoAnswered, setPlayersWhoAnswered] = useState(0); // Contador de jugadores que respondieron
    const [playerCards, setPlayerCards] = useState({}); // Cartas de cada jugador {playerIndex: [cards]}
    const [currentCardIndexInSequence, setCurrentCardIndexInSequence] = useState(0); // Para la ronda mayor-menor
    const [usedCardsInSequence, setUsedCardsInSequence] = useState([]); // Cartas usadas en la secuencia del jugador actual
    const [showHelp, setShowHelp] = useState(false);

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
        const randomIndex = Math.floor(Math.random() * deckToUse.length);
        const drawnCard = deckToUse[randomIndex];
        const remainingDeck = deckToUse.filter((_, index) => index !== randomIndex);
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
            // Avanzar a la siguiente fase: pico -> par-impar -> dentro-fuera -> palo -> mayor-menor
            if (gameState === 'pico') {
                setGameState('par-impar');

                setDeck(prevDeck => {
                    const { drawnCard, remainingDeck } = drawCardFromDeck(prevDeck);
                    setCurrentCard(drawnCard);
                    return remainingDeck;
                });

                setPlayersWhoAnswered(0);
                setCurrentPlayerIndex(0);
                setRevealed(false);
                clearMessage();
            } else if (gameState === 'par-impar') {
                setGameState('dentro-fuera');

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
                setGameState('palo');

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
        } else if (gameState === 'par-impar') {
            // Adivinar si el valor de la carta es par o impar
            const cardNumber = valueNumbers[currentCard.value];
            const isEven = cardNumber % 2 === 0;
            correct = (choice === 'par' && isEven) || (choice === 'impar' && !isEven);

            if (correct) {
                showMessage('¡Correcto!', 'success');
            } else {
                showMessage(`Era ${isEven ? 'par' : 'impar'}. Bebe`, 'error');
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
                showMessage('¡Correcto!', 'success');
            } else {
                if (card1Number === card2Number) {
                    showMessage(`Era ${isDentro ? 'dentro' : 'fuera'} (ambas cartas eran ${currentPlayerCardsList[0].value}). Bebe`, 'error');
                } else {
                    showMessage(`Era ${isDentro ? 'dentro' : 'fuera'} (${minRange}-${maxRange}). Bebe`, 'error');
                }
            }
        } else if (gameState === 'palo') {
            // Adivinar el palo exacto
            correct = choice === suitNames[currentCard.suit];

            if (correct) {
                showMessage('¡Correcto!', 'success');
            } else {
                showMessage(`Era ${suitNames[currentCard.suit]}! Bebe`, 'error');
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

                // Si completó todas sus cartas (paso final: aquí sí se reparten varios tragos)
                if (currentCardIndexInSequence >= currentPlayerCardsList.length - 1) {
                    showMessage('¡Completaste la secuencia! Reparte 5 tragos', 'success');
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

    // Las opciones de la fase actual; el pie las pinta en dos columnas.
    const currentOptions = () => {
        if (revealed) return [];
        if (gameState === 'pico') {
            return [
                { label: 'Rojo', value: 'rojo', icon: <Circle size={15} fill="#b0343c" color="#b0343c" /> },
                { label: 'Negro', value: 'negro', icon: <Circle size={15} fill="#9397ab" color="#9397ab" /> },
            ];
        }
        if (gameState === 'par-impar') {
            return [
                { label: 'Par', value: 'par', icon: <Hash size={15} /> },
                { label: 'Impar', value: 'impar', icon: <Hash size={15} /> },
            ];
        }
        if (gameState === 'dentro-fuera') {
            return [
                { label: 'Dentro', value: 'dentro', icon: <ArrowDownToLine size={15} /> },
                { label: 'Fuera', value: 'fuera', icon: <ArrowUpFromLine size={15} /> },
            ];
        }
        if (gameState === 'palo') {
            return [
                { label: '♠ Pica', value: 'Pica' },
                { label: '♥ Corazón', value: 'Corazón' },
                { label: '♦ Diamante', value: 'Diamante' },
                { label: '♣ Trébol', value: 'Trébol' },
            ];
        }
        if (gameState === 'mayor-menor') {
            return [
                { label: 'Mayor', value: 'mayor', icon: <ArrowUp size={15} /> },
                { label: 'Menor', value: 'menor', icon: <ArrowDown size={15} /> },
            ];
        }
        return [];
    };

    const handleNextPlayerInMayorMenor = () => {
        const totalPlayers = players.length || 1;
        const nextPlayer = (currentPlayerIndex + 1) % totalPlayers;

        // Si ya pasaron todos los jugadores, terminar el juego
        if (nextPlayer === 0) {
            showMessage('¡Juego completado!', 'success');
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
        } else if (gameState === 'par-impar') {
            return '¿La carta es par o impar?';
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
        } else if (gameState === 'palo') {
            return '¿Qué palo es?';
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
    const isLastPhaseFinished = gameState === 'palo' && revealed && playersWhoAnswered >= totalPlayers;
    const canAdvancePlayer = revealed && playersWhoAnswered < totalPlayers && gameState !== 'mayor-menor';
    const currentPlayerCardsList = playerCards[currentPlayerIndex] || [];
    const completedMayorMenorSequence =
        gameState === 'mayor-menor' &&
        revealed &&
        currentCardIndexInSequence >= currentPlayerCardsList.length - 1 &&
        message.includes('Completaste');

    const options = currentOptions();
    const phaseIndex = PHASES.indexOf(gameState);

    const status = currentPlayer
        ? `Turno de ${currentPlayer.name} · ${Math.min(playersWhoAnswered + 1, totalPlayers)} de ${totalPlayers}`
        : `${PHASE_NAMES[gameState]}`;

    const footer = options.length > 0 ? (
        <Options>
            {options.map((option) => (
                <Button
                    key={option.value}
                    size="lg"
                    color={GAME.color}
                    onClick={() => handleChoice(option.value)}
                >
                    {option.icon}
                    {option.label}
                </Button>
            ))}
        </Options>
    ) : canAdvancePlayer && players.length > 0 ? (
        <Button size="lg" fullWidth onClick={advanceToNextPlayer}>
            {playersWhoAnswered + 1 < totalPlayers ? 'Siguiente jugador' : 'Siguiente fase'}
        </Button>
    ) : completedMayorMenorSequence ? (
        <Button size="lg" fullWidth onClick={handleNextPlayerInMayorMenor}>
            Siguiente jugador
        </Button>
    ) : isLastPhaseFinished ? (
        <Button size="lg" fullWidth onClick={handleNext}>
            Nueva ronda
        </Button>
    ) : null;

    return (
        <GameShell
            gameId="picopalo"
            status={status}
            footer={footer}
            stageGap={0}
            stageJustify="flex-start"
            belowHeader={
                <Steps aria-label={`Fase ${phaseIndex + 1} de 5`}>
                    {PHASES.map((phase, i) => (
                        <Step key={phase} $on={i <= phaseIndex} />
                    ))}
                </Steps>
            }
        >
            <PhaseKicker>{PHASE_NAMES[gameState]}</PhaseKicker>
            <Question>{getInstructions()}</Question>

            {currentCard && (
                <Card $hidden={!revealed}>
                    {revealed ? (
                        <>
                            <CardValue $red={currentCard.isRed}>{currentCard.value}</CardValue>
                            <CardSuit $red={currentCard.isRed}>{glyph(currentCard.suit)}</CardSuit>
                        </>
                    ) : (
                        <BackGlyph aria-hidden="true"><Spade size={26} /></BackGlyph>
                    )}
                </Card>
            )}

            <Message $tone={messageTone}>{message}</Message>

            {currentPlayerCardsList.length > 0 && (
                <MiniCards>
                    {currentPlayerCardsList.map((card, index) => (
                        <MiniCard key={index} $red={card.isRed}>
                            {card.value}
                            <span style={{ fontSize: 13 }}>{glyph(card.suit)}</span>
                        </MiniCard>
                    ))}
                </MiniCards>
            )}
        </GameShell>
    );
};

export default PicoPaloGame;
