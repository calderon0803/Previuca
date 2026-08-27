import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import Button from '../components/ui/Button';

const GAME = gameById.illuminati;

const ink = (suit) => (suit === '♥' || suit === '♦' ? '#b0343c' : '#22242e');

const Message = styled.p`
    margin: 0 0 ${({ theme }) => theme.spacing(4.5)};
    font-size: 13.5px;
    color: ${({ theme }) => theme.colors.text.muted};
    text-align: center;
    max-width: 290px;
`;

const Pyramid = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
`;

const Row = styled.div`
    display: flex;
    gap: 7px;
    justify-content: center;
`;

const Card = styled.button`
    width: 46px;
    height: 62px;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: ${({ theme, $face }) =>
        $face ? theme.colors.text.primary : 'linear-gradient(160deg, #2b2741, #1c1e2c)'};
    border: 1px solid
        ${({ theme, $selected, $clickable }) =>
        $selected ? GAME.color : $clickable ? '#5d5294' : theme.colors.borderStrong};
    opacity: ${({ $face, $selected, $clickable }) => ($face || $selected || $clickable ? 1 : 0.55)};
    cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
    transition: border-color ${({ theme }) => theme.transitions.fast},
        opacity ${({ theme }) => theme.transitions.fast};
`;

const CardValue = styled.span`
    font-size: 15px;
    line-height: 1;
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ $suit }) => ink($suit)};
`;

const CardSuit = styled.span`
    font-size: 13px;
    color: ${({ $suit }) => ink($suit)};
`;

const Feedback = styled.div`
    margin-top: ${({ theme }) => theme.spacing(5)};
    width: 100%;
    max-width: 320px;
    border-radius: ${({ theme }) => theme.radii.sm};
    padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
    border: 1px solid ${({ theme, $bad }) => ($bad ? theme.colors.dangerBorder : '#4d6b56')};
    background: ${({ $bad }) => ($bad ? 'rgba(160, 60, 66, 0.14)' : 'rgba(70, 140, 100, 0.14)')};
    text-align: center;
    font-size: 15px;
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.primary};
`;

const Options = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing(2.5)};
`;

const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const createDeck = () => {
    const deck = [];
    for (let suit of SUITS) {
        for (let i = 0; i < VALUES.length; i++) {
            deck.push({
                value: VALUES[i],
                numericValue: i + 1,
                suit: suit
            });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

export default function IlluminatiGame() {
    const { players } = usePlayers();

    const [deck, setDeck] = useState([]);
    const [pyramid, setPyramid] = useState([]);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentRow, setCurrentRow] = useState(4); // Empezamos desde abajo (fila 4 = 5 cartas)
    const [currentCardIndex, setCurrentCardIndex] = useState(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [gamePhase, setGamePhase] = useState('selectFirst'); // 'selectFirst', 'selectNext', 'guessing'
    const [completedPlayers, setCompletedPlayers] = useState([]);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = () => {
        const newDeck = createDeck();

        // Crear la pirámide: [1, 2, 3, 4, 5] cartas por fila
        const pyramidCards = [];
        let deckIndex = 0;

        for (let row = 0; row < 5; row++) {
            const rowCards = [];
            for (let col = 0; col <= row; col++) {
                rowCards.push({
                    ...newDeck[deckIndex],
                    revealed: false,
                    used: false,
                    row: row,
                    col: col
                });
                deckIndex++;
            }
            pyramidCards.push(rowCards);
        }

        setPyramid(pyramidCards);
        setDeck(newDeck.slice(deckIndex));
        setCurrentPlayerIndex(0);
        setCurrentRow(4);
        setCurrentCardIndex(null);
        setGamePhase('selectFirst');
        setMessage('Selecciona una carta de la fila inferior');
        setMessageType('');
        setCompletedPlayers([]);
    };

    const handleCardClick = (row, col) => {
        if (gamePhase === 'selectFirst' && row === 4) {
            // Revelar la primera carta de la fila inferior
            const newPyramid = pyramid.map((r, rIdx) =>
                r.map((card, cIdx) =>
                    rIdx === row && cIdx === col
                        ? { ...card, revealed: true }
                        : card
                )
            );
            setPyramid(newPyramid);
            setCurrentCardIndex(col);
            setCurrentRow(3);
            setGamePhase('selectNext');
            setMessage('Ahora selecciona una carta de la siguiente fila');
        } else if (gamePhase === 'selectNext' && row === currentRow) {
            setGamePhase('guessing');
            setMessage('¿La carta será más alta o más baja?');
            setCurrentCardIndex(col);
        }
    };

    const makeGuess = (guessHigher) => {
        const card = pyramid[currentRow][currentCardIndex];
        const previousCard = pyramid[currentRow + 1].find(c => c.revealed && !c.used);

        // Revelar la carta
        const newPyramid = pyramid.map((r, rIdx) =>
            r.map((c, cIdx) =>
                rIdx === currentRow && cIdx === currentCardIndex
                    ? { ...c, revealed: true }
                    : c
            )
        );
        setPyramid(newPyramid);

        const isTie = card.numericValue === previousCard.numericValue;
        const isHigher = card.numericValue > previousCard.numericValue;
        const isCorrect = !isTie && (guessHigher ? isHigher : !isHigher);

        if (isCorrect) {
            if (currentRow === 0) {
                // ¡Ganó!
                const newCompletedPlayers = [...completedPlayers, players[currentPlayerIndex].name];
                setCompletedPlayers(newCompletedPlayers);
                setMessageType('success');

                if (newCompletedPlayers.length === players.length) {
                    setMessage('¡Todos han ganado!');
                    setGamePhase('finished');
                } else {
                    setMessage(`¡${players[currentPlayerIndex].name} ha ganado esta ronda!`);
                    setGamePhase('roundEnd');
                }
            } else {
                setMessage('¡Correcto! Sigue subiendo');
                setMessageType('success');
                setCurrentRow(currentRow - 1);
                setGamePhase('selectNext');
                setTimeout(() => {
                    setMessage('Selecciona una carta de la siguiente fila');
                    setMessageType('');
                }, 1500);
            }
        } else {
            const rowsLeft = currentRow + 1;
            setMessage(`¡Fallaste! Bebe ${rowsLeft} ${rowsLeft === 1 ? 'trago' : 'tragos'}`);
            setMessageType('error');
            setGamePhase('roundEnd');
        }
    };

    const nextPlayer = () => {
        // Marcar cartas usadas y reemplazar
        const newPyramid = pyramid.map(row =>
            row.map(card =>
                card.revealed ? { ...card, used: true, revealed: false } : card
            )
        );

        // Reemplazar cartas usadas con nuevas del mazo
        let deckIndex = 0;
        const replacedPyramid = newPyramid.map(row =>
            row.map(card => {
                if (card.used) {
                    const newCard = deck[deckIndex] || createDeck()[0];
                    deckIndex++;
                    return {
                        ...newCard,
                        revealed: false,
                        used: false,
                        row: card.row,
                        col: card.col
                    };
                }
                return card;
            })
        );

        setPyramid(replacedPyramid);
        setDeck(deck.slice(deckIndex));

        let nextIndex = (currentPlayerIndex + 1) % players.length;
        // Saltar jugadores que ya completaron
        while (completedPlayers.includes(players[nextIndex].name)) {
            nextIndex = (nextIndex + 1) % players.length;
            if (nextIndex === currentPlayerIndex) break;
        }

        setCurrentPlayerIndex(nextIndex);
        setCurrentRow(4);
        setCurrentCardIndex(null);
        setGamePhase('selectFirst');
        setMessage('Selecciona una carta de la fila inferior');
        setMessageType('');
    };

    if (players.length === 0) {
        return (
            <GameShell gameId="illuminati" status="Sin jugadores">
                <Message>
                    Illuminati necesita al menos un jugador. Añádelos desde el chip de la cabecera.
                </Message>
            </GameShell>
        );
    }

    const clickableRow =
        gamePhase === 'selectFirst' ? 4 : gamePhase === 'selectNext' ? currentRow : -1;
    const roundEnd = gamePhase === 'roundEnd' || gamePhase === 'finished';
    const bad = messageType === 'error';

    const status =
        gamePhase === 'finished'
            ? 'Partida completa'
            : `${players[currentPlayerIndex]?.name} · fila ${5 - currentRow} de 5`;

    const footer =
        gamePhase === 'guessing' ? (
            <Options>
                <Button size="lg" color={GAME.color} onClick={() => makeGuess(true)}>
                    <ArrowUp size={16} /> Mayor
                </Button>
                <Button variant="secondary" size="lg" onClick={() => makeGuess(false)}>
                    <ArrowDown size={16} /> Menor
                </Button>
            </Options>
        ) : roundEnd ? (
            <Button
                size="lg"
                fullWidth
                onClick={gamePhase === 'finished' ? initializeGame : nextPlayer}
            >
                {gamePhase === 'finished' ? 'Nueva partida' : 'Pásale el móvil al siguiente'}
            </Button>
        ) : null;

    return (
        <GameShell
            gameId="illuminati"
            status={status}
            footer={footer}
            stageGap={0}
            stageJustify="flex-start"
        >
            {!roundEnd && <Message>{message}</Message>}

            <Pyramid>
                {pyramid.map((row, rowIdx) => (
                    <Row key={rowIdx}>
                        {row.map((card, colIdx) => {
                            const clickable = rowIdx === clickableRow;
                            const selected =
                                gamePhase === 'guessing' &&
                                rowIdx === currentRow &&
                                colIdx === currentCardIndex;
                            const face = card.revealed && !card.used;
                            return (
                                <Card
                                    key={`${rowIdx}-${colIdx}`}
                                    $face={face}
                                    $selected={selected}
                                    $clickable={clickable}
                                    onClick={() => handleCardClick(rowIdx, colIdx)}
                                    aria-label={face ? `${card.value}${card.suit}` : 'Carta tapada'}
                                >
                                    {face && (
                                        <>
                                            <CardValue $suit={card.suit}>{card.value}</CardValue>
                                            <CardSuit $suit={card.suit}>{card.suit}</CardSuit>
                                        </>
                                    )}
                                </Card>
                            );
                        })}
                    </Row>
                ))}
            </Pyramid>

            {roundEnd && <Feedback $bad={bad}>{message}</Feedback>}
        </GameShell>
    );
}
