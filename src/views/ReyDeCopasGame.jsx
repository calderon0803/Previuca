import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Crown } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { cardRules, generateDeck, shuffleDeck, cardInk } from '../data/reyDeCopasRules';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import Button from '../components/ui/Button';
import { SignatureLine } from '../components/ui/Signature';

const GAME = gameById.reydecopas;

const TurnKicker = styled.p`
  margin: 0 0 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const TurnName = styled.p`
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

const CardBack = styled.button`
  position: relative;
  width: 88px;
  height: 124px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid #423a6a;
  background: linear-gradient(160deg, #2b2741, #1c1e2c);
  color: ${GAME.color};
  transition: transform ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &::after {
    content: '';
    position: absolute;
    inset: 9px;
    border: 1px solid rgba(201, 134, 46, 0.35);
    border-radius: 4px;
  }

  &:hover {
    transform: translateY(-4px);
    border-color: ${GAME.color};
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackGlyph = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  opacity: 0.5;
`;

const Hint = styled.p`
  margin: ${({ theme }) => theme.spacing(6.5)} 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const PlayingCard = styled.div`
  width: 150px;
  height: 210px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.65);
`;

const CardValue = styled.span`
  font-size: 62px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: 1;
  color: ${({ $ink }) => $ink};
`;

const CardSuit = styled.span`
  font-size: 36px;
  margin-top: 6px;
  color: ${({ $ink }) => $ink};
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
                    <PlayingCard>
                        <CardValue $ink={cardInk(card.red)}>{card.value}</CardValue>
                        <CardSuit $ink={cardInk(card.red)}>{card.suit}</CardSuit>
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
                    <TurnKicker>Le toca a</TurnKicker>
                    <TurnName>{player ? player.name : 'Quien quiera'}</TurnName>
                    <Choices>
                        {deck.slice(0, Math.min(5, deck.length)).map((_, index) => (
                            <CardBack key={index} onClick={() => draw(index)} aria-label="Sacar carta">
                                <BackGlyph aria-hidden="true"><Crown size={26} /></BackGlyph>
                            </CardBack>
                        ))}
                    </Choices>
                    <Hint>Elige una carta del mazo</Hint>
                </>
            ) : (
                <>
                    <TurnKicker>Se acabó la baraja</TurnKicker>
                    <TurnName>52 cartas fuera</TurnName>
                    <Hint style={{ marginTop: 0 }}>Baraja otra vez para seguir jugando.</Hint>
                </>
            )}
        </GameShell>
    );
}
