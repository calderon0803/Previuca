import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh } from 'react-icons/io5';
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
    padding: 24px 12px;
    gap: 20px;
    overflow-y: auto;
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

const PyramidContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin: 20px 0;
`;

const PyramidRow = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
`;

const Card = styled.div`
    width: 50px;
    height: 70px;
    background: ${props => props.$revealed ? '#fff' : 'repeating-linear-gradient(45deg, #BA0057, #BA0057 10px, #8B0042 10px, #8B0042 20px)'};
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    cursor: ${props => props.$clickable ? 'pointer' : 'default'};
    transition: transform 0.2s;
    position: relative;
    border: 2px solid ${props => props.$current ? '#FFD800' : 'transparent'};

    ${props => !props.$revealed && `
        &::after {
            content: '';
            position: absolute;
            top: 4px;
            left: 4px;
            right: 4px;
            bottom: 4px;
            border: 2px solid #FFD800;
            border-radius: 4px;
        }
    `}

    ${props => props.$clickable && `
        &:hover {
            transform: scale(1.1);
            border-color: ${props.$revealed ? '#FFD800' : 'transparent'};
        }
    `}

    ${props => props.$used && `
        opacity: 0.5;
    `}
`;

const CardValue = styled.div`
    font-size: 20px;
    font-weight: bold;
    color: ${props => (props.$suit === '♥' || props.$suit === '♦') ? '#BA0057' : '#000'};
`;

const CardSuit = styled.div`
    font-size: 18px;
    color: ${props => (props.$suit === '♥' || props.$suit === '♦') ? '#BA0057' : '#000'};
`;

const ButtonContainer = styled.div`
    display: flex;
    gap: 12px;
    margin: 20px 0;
`;

const Button = styled.button`
    padding: 16px 32px;
    font-size: 18px;
    font-weight: bold;
    border-radius: 12px;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    background: ${({ theme, $variant }) => $variant === 'high' ? theme.colors.primary : theme.colors.surface};
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: scale(1.05);
        background: ${({ theme }) => theme.colors.primary};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
            transform: none;
        }
    }
`;

const Message = styled.div`
    background: ${({ theme, $type }) =>
        $type === 'success' ? 'rgba(0, 255, 0, 0.2)' :
            $type === 'error' ? 'rgba(255, 0, 0, 0.2)' :
                theme.colors.surface};
    border: 2px solid ${({ theme, $type }) =>
        $type === 'success' ? '#00ff00' :
            $type === 'error' ? '#ff0000' :
                theme.colors.secondary};
    padding: 16px 24px;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.text.primary};
    text-align: center;
    max-width: 400px;
    font-size: 16px;
`;

const Instructions = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    padding: 16px;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 500px;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 10px;
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

        const isHigher = card.numericValue > previousCard.numericValue;
        const isCorrect = guessHigher ? isHigher : !isHigher;

        if (isCorrect) {
            if (currentRow === 0) {
                // ¡Ganó!
                const newCompletedPlayers = [...completedPlayers, players[currentPlayerIndex].name];
                setCompletedPlayers(newCompletedPlayers);
                setMessage(`¡${players[currentPlayerIndex].name} ha ganado! 🎉`);
                setMessageType('success');

                if (newCompletedPlayers.length === players.length) {
                    setMessage('¡Todos han ganado! 🎉🎉🎉');
                    setGamePhase('finished');
                } else {
                    setTimeout(() => {
                        nextPlayer();
                    }, 2000);
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
            setMessage(`¡Fallaste! ${players[currentPlayerIndex].name} bebe ${rowsLeft} ${rowsLeft === 1 ? 'trago' : 'tragos'} 🍺`);
            setMessageType('error');

            setTimeout(() => {
                nextPlayer();
            }, 2500);
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
                <Header>
                    <IconButton onClick={() => navigate('/games')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Illuminati</HeaderTitle>
                    <div style={{ width: '40px' }} />
                </Header>
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
            <Header>
                <IconButton onClick={() => navigate('/games')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Illuminati</HeaderTitle>
                <IconButton onClick={initializeGame}>
                    <IoRefresh size={24} />
                </IconButton>
            </Header>

            <Content>

                {gamePhase !== 'finished' && (
                    <PlayerIndicator>
                        <PlayerLabel>Turno de:</PlayerLabel>
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
                        <Button onClick={() => makeGuess(true)}>
                            ⬆️ MAYOR
                        </Button>
                        <Button onClick={() => makeGuess(false)}>
                            ⬇️ MENOR
                        </Button>
                    </ButtonContainer>
                )}

                {gamePhase === 'finished' && (
                    <>
                        <Message $type="success">
                            {message}
                        </Message>
                        <Button onClick={initializeGame} style={{ marginTop: '10px' }}>
                            🔄 NUEVA PARTIDA
                        </Button>
                    </>
                )}

                {message && gamePhase !== 'finished' && gamePhase !== 'guessing' && (
                    <Message $type={messageType}>
                        {message}
                    </Message>
                )}
            </Content>
        </Container>
    );
}
