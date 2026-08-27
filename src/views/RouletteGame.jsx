import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Pencil } from 'lucide-react';
import { usePlayers } from '../contexts/PlayersContext';
import { gameById } from '../data/games';
import OptionsEditor from '../components/OptionsEditor';
import GameShell from '../components/GameShell';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import ConfirmSheet from '../components/ui/ConfirmSheet';

const OPTS_KEY = 'roulette_custom_options';
const GAME = gameById.ruleta;

const defaultOptions = [
    'Bebe 1',
    'Manda 1',
    'Bebe 2',
    'Manda 2',
    'Bebe 3',
    'Manda 3',
    'Chupito',
    'Manda chupito',
    'Todos beben',
    'Nadie bebe',
];

const Wheel = styled.div`
  position: relative;
  width: 310px;
  max-width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Aguja triangular verde arriba.
const Needle = styled.span`
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 22px solid ${GAME.color};
  z-index: 5;
`;

const Disc = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderHover},
    0 16px 40px rgba(0, 0, 0, 0.65);
  transform: rotate(${({ $rot }) => $rot}deg);
  transition: transform 4s cubic-bezier(0.15, 0, 0.15, 1);
`;

const Slices = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ $gradient }) => $gradient};
`;

const SliceText = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 48%;
  height: 34px;
  margin-top: -17px;
  transform-origin: left center;
  transform: rotate(${({ $angle }) => $angle}deg);
  display: flex;
  align-items: center;
  padding-left: 42px;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: #f3f5fe;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  pointer-events: none;
`;

const Cap = styled.div`
  position: absolute;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderHover};
  z-index: 4;
`;

// El resultado aparece en un diálogo centrado, no en una hoja inferior:
// es el remate del giro, no una decisión.
const ResultOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(6.5)};
  background: ${({ theme }) => theme.colors.overlayStrong};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const ResultCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderHover},
    0 16px 40px rgba(0, 0, 0, 0.65);
  padding: ${({ theme }) => theme.spacing(6.5)};
  animation: pv-pop 0.2s ease;
`;

const ResultKicker = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(2.5)};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.kicker};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const ResultValue = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(5.5)};
  font-size: 30px;
  line-height: 1.2;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

export default function RouletteGame() {
    const { players } = usePlayers();

    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [options, setOptions] = useState(defaultOptions);
    const [showEditor, setShowEditor] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [turn, setTurn] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
        const saved = localStorage.getItem(OPTS_KEY);
        if (saved) {
            try {
                setOptions(JSON.parse(saved));
            } catch (e) {
                console.error('Error loading options:', e);
            }
        }
        return () => clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        if (players.length > 0 && turn >= players.length) setTurn(0);
    }, [players, turn]);

    const saveOptions = (newOptions) => {
        setOptions(newOptions);
        localStorage.setItem(OPTS_KEY, JSON.stringify(newOptions));
        setShowEditor(false);
        setRotation(0);
        setResult(null);
    };

    const segment = 360 / options.length;
    const gradient = `conic-gradient(${options
        .map(
            (_, i) =>
                `${i % 2 ? '#292b31' : '#5d5294'} ${i * segment}deg ${(i + 1) * segment}deg`,
        )
        .join(', ')})`;

    const spin = () => {
        if (spinning) return;
        setSpinning(true);
        setResult(null);
        const target = rotation + 2160 + Math.floor(Math.random() * 360);
        setRotation(target);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            const index = Math.floor(((360 - (target % 360)) % 360) / segment);
            setResult(options[index]);
            setSpinning(false);
        }, 4100);
    };

    const nextTurn = () => {
        setResult(null);
        if (players.length > 0) setTurn((prev) => (prev + 1) % players.length);
    };

    const status =
        players.length > 0
            ? `${players[turn % players.length]?.name} · gira`
            : 'Gira quien quiera';

    return (
        <GameShell
            gameId="ruleta"
            status={status}
            extraActions={
                <IconButton onClick={() => setShowEditor(true)} aria-label="Editar casillas">
                    <Pencil size={20} />
                </IconButton>
            }
            footer={
                <Button size="lg" color={GAME.color} fullWidth disabled={spinning} onClick={spin}>
                    {spinning ? 'Girando...' : 'Girar'}
                </Button>
            }
        >
            <Wheel>
                <Needle aria-hidden="true" />
                <Disc $rot={rotation}>
                    <Slices $gradient={gradient} />
                    {options.map((option, i) => (
                        <SliceText key={i} $angle={i * segment + segment / 2 - 90}>
                            {option}
                        </SliceText>
                    ))}
                </Disc>
                <Cap aria-hidden="true" />
            </Wheel>

            {result && (
                <ResultOverlay onClick={nextTurn}>
                    <ResultCard onClick={(e) => e.stopPropagation()}>
                        <ResultKicker>Resultado</ResultKicker>
                        <ResultValue>{result}</ResultValue>
                        <Button size="md" fullWidth onClick={nextTurn}>
                            Siguiente jugador
                        </Button>
                    </ResultCard>
                </ResultOverlay>
            )}

            <OptionsEditor
                visible={showEditor}
                items={options}
                onSave={saveOptions}
                onCancel={() => setShowEditor(false)}
                onReset={() =>
                    setConfirm({
                        title: '¿Restablecer las casillas?',
                        text: 'Vuelven las diez casillas de fábrica y se pierde lo que hayas escrito.',
                        cta: 'Restablecer',
                        run: () => saveOptions(defaultOptions),
                    })
                }
                allowAdd={false}
                allowDelete={false}
                title="Casillas de la ruleta"
                placeholder="Ej: bebe doble..."
            />

            <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />
        </GameShell>
    );
}
