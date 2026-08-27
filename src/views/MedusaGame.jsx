import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { gameById } from '../data/games';
import GameShell from '../components/GameShell';
import Button from '../components/ui/Button';

const GAME = gameById.medusa;

const Circle = styled.div`
  position: relative;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme, $lit }) => ($lit ? GAME.color : theme.colors.borderStrong)};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: ${({ $lit }) => ($lit ? 'pv-pop 0.2s ease' : 'none')};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle,
      ${({ $lit }) => ($lit ? 'rgba(46, 158, 143, 0.34)' : 'rgba(46, 158, 143, 0.22)')},
      transparent ${({ $lit }) => ($lit ? '72%' : '70%')}
    );
  }
`;

const StartCircle = styled(Circle)`
  cursor: pointer;

  &:hover {
    border-color: ${GAME.color};
  }
`;

const StartLabel = styled.span`
  position: relative;
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CountDigit = styled.span`
  position: relative;
  font-size: 84px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  animation: pv-pop 0.2s ease;
`;

const ResultWord = styled.span`
  position: relative;
  font-size: 40px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Note = styled.p`
  margin: ${({ theme }) => theme.spacing(2.5)} 0 0;
  font-size: ${({ $strong }) => ($strong ? '16px' : '15px')};
  font-weight: ${({ theme, $strong }) =>
        $strong ? theme.typography.fontWeight.medium : theme.typography.fontWeight.regular};
  color: ${({ theme, $strong }) => ($strong ? GAME.kicker : theme.colors.text.muted)};
  text-align: center;
  max-width: 270px;
`;

const STATUS = {
    idle: 'Todos con la cabeza baja',
    counting: 'Preparados...',
    result: 'Cruce de miradas',
};

export default function MedusaGame() {
    const [phase, setPhase] = useState('idle');
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (phase !== 'counting') return;
        // 900ms por dígito, como el prototipo.
        if (count > 1) {
            const timer = setTimeout(() => setCount(count - 1), 900);
            return () => clearTimeout(timer);
        }
        const timer = setTimeout(() => setPhase('result'), 900);
        return () => clearTimeout(timer);
    }, [phase, count]);

    const start = () => {
        setCount(3);
        setPhase('counting');
    };

    const reset = () => {
        setPhase('idle');
        setCount(3);
    };

    return (
        <GameShell
            gameId="medusa"
            status={STATUS[phase]}
            showPlayers={false}
            stageGap={0}
            footer={
                phase === 'result' ? (
                    <Button size="lg" color={GAME.color} fullWidth onClick={reset}>
                        Otra ronda
                    </Button>
                ) : null
            }
        >
            {phase === 'idle' && (
                <>
                    <StartCircle as="button" $size={224} onClick={start}>
                        <StartLabel>EMPEZAR</StartLabel>
                    </StartCircle>
                    <Note style={{ marginTop: 30 }}>
                        Bajad todos la cabeza. Cuando estéis listos, pulsa.
                    </Note>
                </>
            )}

            {phase === 'counting' && (
                <>
                    <Circle $size={224}>
                        <CountDigit key={count}>{count}</CountDigit>
                    </Circle>
                    <Note style={{ marginTop: 30 }}>Preparados...</Note>
                </>
            )}

            {phase === 'result' && (
                <>
                    <Circle $size={236} $lit>
                        <ResultWord>¡MIRAD!</ResultWord>
                    </Circle>
                    <Note $strong style={{ marginTop: 28 }}>
                        Si cruzas la mirada con alguien, bebéis los dos.
                    </Note>
                </>
            )}
        </GameShell>
    );
}
