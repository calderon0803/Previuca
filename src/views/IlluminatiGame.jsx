import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowUp, ArrowDown, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import HowToPlayModal from '../components/HowToPlayModal';
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
    padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
    gap: ${({ theme }) => theme.spacing(3)};
    overflow-y: auto;
`;

const PlayerIndicator = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(5)};
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
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
`;

const PyramidContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(1.5)};
`;

const PyramidRow = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing(1.5)};
    justify-content: center;
`;

const Card = styled.div`
    width: 42px;
    height: 58px;
    background: ${({ theme, $revealed }) => $revealed
        ? '#fff'
        : `repeating-linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.primary} 10px, ${theme.colors.primaryActive} 10px, ${theme.colors.primaryActive} 20px)`};
    border-radius: ${({ theme }) => theme.radii.sm};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: ${({ theme }) => theme.shadows.sm};
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    transition: transform ${({ theme }) => theme.transitions.fast};
    position: relative;
    border: 2px solid ${({ theme, $current }) => ($current ? theme.colors.accent : 'transparent')};

    ${props => props.$clickable && `
        &:hover {
            transform: scale(1.08);
        }
    `}

    ${props => props.$used && `
        opacity: 0.4;
    `}
`;

const CardValue = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${props => (props.$suit === '♥' || props.$suit === '♦') ? '#C0392B' : '#262626'};
`;

const CardSuit = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${props => (props.$suit === '♥' || props.$suit === '♦') ? '#C0392B' : '#262626'};
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing(3)};
    width: 100%;
    max-width: 400px;
`;

const Message = styled.div`
    background: ${({ theme, $type }) =>
        $type === 'success' ? 'rgba(63, 167, 114, 0.12)' :
            $type === 'error' ? 'rgba(229, 72, 77, 0.12)' :
                theme.colors.surface};
    border: 1px solid ${({ theme, $type }) =>
        $type === 'success' ? theme.colors.success :
            $type === 'error' ? theme.colors.error :
                theme.colors.border};
    padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(6)};
    border-radius: ${({ theme }) => theme.radii.md};
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: center;
    max-width: 400px;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const MessageInline = styled.span`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(2)};
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
    const navigate = useNavigate();
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

    const helpModal = (
        <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Illuminati">
            <p>
                Hay una pirámide de cartas boca abajo: 5 en la fila de abajo, hasta 1 en la punta.
                En tu turno, destapas una carta de la fila de abajo y luego vas subiendo: en cada
                fila adivinas si la carta que destapas es mayor o menor que la de la fila anterior.
            </p>
            <p>
                Si aciertas, subes una fila. Si fallas, bebes según lo lejos que hayas llegado y le
                pasas el turno al siguiente. Si llegas a la punta, ganas esa ronda y la pirámide se
                rehace para ti — la partida sigue hasta que todos han llegado arriba al menos una
                vez.
            </p>
        </HowToPlayModal>
    );

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
            <Container>
                <PageHeader
                    title="Illuminati"
                    onBack={() => navigate(-1)}
                    rightAction={
                        <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                            <HelpCircle size={20} />
                        </IconButton>
                    }
                />
                {helpModal}
                <Content>
                    <Message>
                        Necesitas agregar jugadores para jugar Illuminati.
                        <br />
                        Ve al menú de juegos y agrega jugadores.
                    </Message>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader
                title="Illuminati"
                onBack={() => navigate(-1)}
                rightAction={
                    <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                        <HelpCircle size={20} />
                    </IconButton>
                }
            />
            {helpModal}

            <Content>

                {gamePhase !== 'finished' && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de</PlayerLabel>
                        <PlayerName>{players[currentPlayerIndex]?.name}</PlayerName>
                    </PlayerIndicator>
                )}

                <PyramidContainer>
                    {pyramid.map((row, rowIdx) => (
                        <PyramidRow key={rowIdx}>
                            {row.map((card, colIdx) => (
                                <Card
                                    key={`${rowIdx}-${colIdx}`}
                                    $revealed={card.revealed}
                                    $used={card.used}
                                    $current={gamePhase === 'selectNext' && rowIdx === currentRow && colIdx === currentCardIndex}
                                    $clickable={
                                        (gamePhase === 'selectFirst' && rowIdx === 4) ||
                                        (gamePhase === 'selectNext' && rowIdx === currentRow)
                                    }
                                    onClick={() => handleCardClick(rowIdx, colIdx)}
                                >
                                    {card.revealed && !card.used && (
                                        <>
                                            <CardValue $suit={card.suit}>{card.value}</CardValue>
                                            <CardSuit $suit={card.suit}>{card.suit}</CardSuit>
                                        </>
                                    )}
                                </Card>
                            ))}
                        </PyramidRow>
                    ))}
                </PyramidContainer>

                {gamePhase === 'guessing' && (
                    <ButtonContainer>
                        <Button fullWidth onClick={() => makeGuess(true)}>
                            <ArrowUp size={16} /> Mayor
                        </Button>
                        <Button fullWidth variant="secondary" onClick={() => makeGuess(false)}>
                            <ArrowDown size={16} /> Menor
                        </Button>
                    </ButtonContainer>
                )}

                {gamePhase === 'finished' && (
                    <>
                        <Message $type="success">
                            <MessageInline>
                                <CheckCircle2 size={18} />
                                {message}
                            </MessageInline>
                        </Message>
                        <Button onClick={initializeGame}>
                            Nueva partida
                        </Button>
                    </>
                )}

                {gamePhase === 'roundEnd' && (
                    <>
                        <Message $type={messageType}>
                            <MessageInline>
                                {messageType === 'success' && <CheckCircle2 size={18} />}
                                {messageType === 'error' && <XCircle size={18} />}
                                {message}
                            </MessageInline>
                        </Message>
                        <Button fullWidth onClick={nextPlayer}>
                            Siguiente jugador
                        </Button>
                    </>
                )}

                {message && gamePhase !== 'finished' && gamePhase !== 'guessing' && gamePhase !== 'roundEnd' && (
                    <Message $type={messageType}>
                        <MessageInline>
                            {messageType === 'success' && <CheckCircle2 size={18} />}
                            {messageType === 'error' && <XCircle size={18} />}
                            {message}
                        </MessageInline>
                    </Message>
                )}
            </Content>
        </Container>
    );
}
