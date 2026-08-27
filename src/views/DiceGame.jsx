import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import TurnLine from '../components/TurnLine';
import Button from '../components/ui/Button';
import { SignatureLine } from '../components/ui/Signature';

const GAME = gameById.dados;

// Qué casillas de la rejilla 3×3 llevan punto en cada cara.
const DOTS = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 3, 6, 2, 5, 8],
};

const Dice = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5.5)};
`;

const Face = styled.div`
  width: 82px;
  height: 82px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.text.primary};
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  padding: 12px;
  box-sizing: border-box;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.55);
`;

const Dot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22242e;
  justify-self: center;
  align-self: center;
  opacity: ${({ $on }) => ($on ? 1 : 0)};
`;

const RuleCard = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(6.5)};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(5)};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  animation: pv-pop 0.2s ease;
`;

const RuleKicker = styled.p`
  position: relative;
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.kicker};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const RuleText = styled.p`
  position: relative;
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-wrap: pretty;
`;

function ruleFor(d1, d2) {
    const sum = d1 + d2;
    if (d1 === d2) {
        if (sum === 2) return 'Ojos de serpiente: bébete dos tragos ahora mismo.';
        if (sum === 12) return 'Doble seis: todos beben un trago.';
        return `Doble ${d1}: te inventas una regla nueva para el resto de la partida.`;
    }
    if (sum === 7) return 'El último en tocarse la nariz bebe.';
    if (sum === 3) return 'Bebes tú, un trago.';
    if (sum === 11) return 'Eliges a alguien para que beba dos tragos.';
    if (sum === 9) return 'Bebe el de tu izquierda.';
    if (sum === 10) return 'Bebe el de tu derecha.';
    return `Reparte ${Math.floor(sum / 2)} tragos a quien quieras.`;
}

export default function DiceGame() {
    const { players } = usePlayers();

    const [dice, setDice] = useState([1, 1]);
    const [rolling, setRolling] = useState(false);
    const [rule, setRule] = useState(null);
    const [turn, setTurn] = useState(0);
    const interval = useRef(null);

    useEffect(() => () => clearInterval(interval.current), []);

    useEffect(() => {
        if (players.length > 0 && turn >= players.length) setTurn(0);
    }, [players, turn]);

    const roll = () => {
        if (rolling) return;
        setRolling(true);
        setRule(null);
        let frames = 0;
        clearInterval(interval.current);
        // 10 marcos a 90ms: el dado "rueda" sin pasarse de tiempo.
        interval.current = setInterval(() => {
            const next = [
                1 + Math.floor(Math.random() * 6),
                1 + Math.floor(Math.random() * 6),
            ];
            frames += 1;
            setDice(next);
            if (frames > 9) {
                clearInterval(interval.current);
                setRule(ruleFor(next[0], next[1]));
                setRolling(false);
            }
        }, 90);
    };

    const nextTurn = () => {
        setRule(null);
        if (players.length > 0) setTurn((prev) => (prev + 1) % players.length);
    };

    const turnName = players.length > 0 ? players[turn % players.length]?.name : 'Quien quiera';
    const nextTurnName = players.length > 0 ? players[(turn + 1) % players.length]?.name : 'Quien quiera';

    return (
        <GameShell
            gameId="dados"
            stageGap={0}
            footer={
                <Button
                    size="lg"
                    color={GAME.color}
                    fullWidth
                    disabled={rolling}
                    onClick={rule ? nextTurn : roll}
                >
                    {rolling ? 'Lanzando...' : rule ? `Le toca a ${nextTurnName}` : 'Lanzar dados'}
                </Button>
            }
        >
            <TurnLine name={turnName} />
            <Dice>
                {dice.map((value, i) => (
                    <Face key={i} aria-label={`Dado ${value}`}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                            <Dot key={cell} $on={DOTS[value].includes(cell)} />
                        ))}
                    </Face>
                ))}
            </Dice>

            {rule && (
                <RuleCard>
                    <SignatureLine $color={GAME.color} aria-hidden="true" />
                    <RuleKicker>Suma {dice[0] + dice[1]}</RuleKicker>
                    <RuleText>{rule}</RuleText>
                </RuleCard>
            )}
        </GameShell>
    );
}
