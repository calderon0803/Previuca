import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules } from '../data/reyDeCopasRules';
import { generateDeck, shuffleDeck, cardInk } from '../data/deck';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import TurnLine from '../components/TurnLine';
import Button from '../components/ui/Button';
import { PlayingCard, CardValue, CardSuit } from '../components/ui/PlayingCard';
import { SignatureLine } from '../components/ui/Signature';

const GAME = gameById.reydecopas;

// Fin de la baraja: no es un turno, es un mensaje de estado — no usa TurnLine.
const EndKicker = styled.p`
  margin: 0 0 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const EndTitle = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(6.5)};
  font-size: 30px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const Choices = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
  justify-content: center;
  flex-wrap: wrap;
  max-width: 340px;
`;

const Hint = styled.p`
  margin: ${({ theme }) => theme.spacing(6.5)} 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const RuleCard = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(5)};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
`;

const RuleName = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.01em;
`;

const RuleDesc = styled.p`
  position: relative;
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-wrap: pretty;
`;

const KingNote = styled.p`
  margin: ${({ theme }) => theme.spacing(3.5)} 0 0;
  font-size: 13.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.color};
`;

const Pips = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  padding-right: 6px;
`;

const Pip = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1px solid ${GAME.color};
  background: ${({ $on }) => ($on ? GAME.color : 'transparent')};
`;

export default function ReyDeCopasGame() {
    const { players } = usePlayers();

    const [deck, setDeck] = useState([]);
    const [card, setCard] = useState(null);
    const [kings, setKings] = useState(0);
    const [turn, setTurn] = useState(0);

    useEffect(() => {
        setDeck(shuffleDeck(generateDeck()));
    }, []);

    const draw = (index) => {
        if (deck.length === 0) return;
        const drawn = deck[index];
        setDeck(deck.filter((_, i) => i !== index));
        setCard(drawn);
        if (drawn.value === 'K') setKings((prev) => prev + 1);
    };

    const cont = () => {
        setCard(null);
        if (players.length > 0) setTurn((prev) => (prev + 1) % players.length);
    };

    const reset = () => {
        setDeck(shuffleDeck(generateDeck()));
        setCard(null);
        setKings(0);
        setTurn(0);
    };

    const player = players.length > 0 ? players[turn % players.length] : null;
    const rule = card ? cardRules[card.value] : null;
    const nextPlayer =
        players.length > 0 ? players[(turn + 1) % players.length] : null;

    const footer = card ? (
        <Button size="lg" color={GAME.color} fullWidth onClick={cont}>
            {nextPlayer ? `Le toca a ${nextPlayer.name}` : 'Continuar'}
        </Button>
    ) : deck.length === 0 ? (
        <Button size="lg" color={GAME.color} fullWidth onClick={reset}>
            Barajar de nuevo
        </Button>
    ) : null;

    return (
        <GameShell
            gameId="reydecopas"
            status={`${deck.length} cartas · reyes ${kings}/4`}
            footer={footer}
            stageGap={0}
            extraActions={
                <Pips aria-label={`Reyes: ${kings} de 4`}>
                    {[0, 1, 2, 3].map((i) => (
                        <Pip key={i} $on={i < kings} />
                    ))}
                </Pips>
            }
        >
            {card ? (
                <>
                    <TurnLine name={player ? player.name : 'Quien quiera'} />
                    <PlayingCard $size="lg" $face>
                        <CardValue $size="lg" $ink={cardInk(card.red)}>{card.value}</CardValue>
                        <CardSuit $size="lg" $ink={cardInk(card.red)}>{card.suit}</CardSuit>
                    </PlayingCard>
                    <RuleCard style={{ marginTop: 22 }}>
                        <SignatureLine $color={GAME.color} aria-hidden="true" />
                        <RuleName>{rule?.rule}</RuleName>
                        <RuleDesc>{rule?.description}</RuleDesc>
                    </RuleCard>
                    {card.value === 'K' && (
                        <KingNote>
                            {kings >= 4
                                ? 'Cuarto rey: te bebes el vaso entero.'
                                : `Rey ${kings} de 4 — vierte un poco en el vaso central.`}
                        </KingNote>
                    )}
                </>
            ) : deck.length > 0 ? (
                <>
                    <TurnLine name={player ? player.name : 'Quien quiera'} />
                    <Choices>
                        {deck.slice(0, Math.min(5, deck.length)).map((_, index) => (
                            <PlayingCard
                                key={index}
                                as="button"
                                $size="deck"
                                $clickable
                                onClick={() => draw(index)}
                                aria-label="Sacar carta"
                            />
                        ))}
                    </Choices>
                    <Hint>Elige una carta del mazo</Hint>
                </>
            ) : (
                <>
                    <EndKicker>Se acabó la baraja</EndKicker>
                    <EndTitle>52 cartas fuera</EndTitle>
                    <Hint style={{ marginTop: 0 }}>Baraja otra vez para seguir jugando.</Hint>
                </>
            )}
        </GameShell>
    );
}
