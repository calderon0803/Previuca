import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Eye, EyeOff, CircleQuestionMark } from 'lucide-react';
import { trazoTragoWords } from '../data/trazoTragoWords';
import { gameById } from '../data/games';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Screen from '../components/ui/Screen';
import Button from '../components/ui/Button';
import HowToPlayModal from '../components/HowToPlayModal';

const GAME = gameById.trazotrago;

const PAPER = '#f3f5fe';
const COLORS = ['#22242e', '#d94a4a', '#3f8cd9', '#3fa772', '#d98b3f', '#8a5fd9', '#c23fa0'];
const BRUSHES = [2, 5, 10, 15];
const ROUND_SECONDS = 90;

const WordRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding: 4px ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(2.5)};
  flex-shrink: 0;
`;

const WordToggle = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const Word = styled.span`
  flex: 1;
  min-width: 0;
  text-align: center;
  font-size: 18px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Clock = styled.span`
  min-width: 52px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-variant-numeric: tabular-nums;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CanvasArea = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  background: ${PAPER};
`;

const Canvas = styled.canvas`
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
  cursor: crosshair;
`;

const ResultVeil = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(10, 11, 18, 0.9);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(6.5)};
  text-align: center;
`;

const ResultKicker = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${GAME.kicker};
  text-transform: uppercase;
  letter-spacing: 0.14em;
`;

const ResultSips = styled.p`
  margin: 0;
  font-size: 34px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ResultWord = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Tools = styled.div`
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(3.5)}
    calc(${({ theme }) => theme.spacing(5)} + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Swatches = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const Swatch = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ $on }) => ($on ? GAME.color : 'transparent')};
`;

const Brushes = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
  justify-content: center;
  align-items: center;
`;

const Brush = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid ${({ theme, $on }) => ($on ? GAME.color : theme.colors.borderStrong)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrushDot = styled.span`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.text.primary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};

  > * {
    flex: 1;
  }
`;

const randomWord = () => trazoTragoWords[Math.floor(Math.random() * trazoTragoWords.length)];

export default function TrazoTragoGame() {
    const navigate = useNavigate();

    const [word, setWord] = useState(randomWord);
    const [shown, setShown] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [color, setColor] = useState(COLORS[0]);
    const [brush, setBrush] = useState(5);
    const [helpOpen, setHelpOpen] = useState(false);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawing = useRef(false);
    const timer = useRef(null);
    const elapsed = useRef(0);

    const paint = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = PAPER;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctxRef.current = ctx;
    }, []);

    // El lienzo se dimensiona a píxeles reales; al redibujar se pierde el
    // trazo, así que solo se hace al montar y al cambiar el tamaño.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = Math.max(1, Math.round(rect.width));
            canvas.height = Math.max(1, Math.round(rect.height));
            paint();
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [paint]);

    useEffect(() => () => clearInterval(timer.current), []);

    // Los tragos salen del tiempo aguantado: uno por cada 30 s, mínimo uno.
    const finish = useCallback(() => {
        clearInterval(timer.current);
        setRunning(false);
        setShown(true);
        setResult(Math.max(1, Math.floor(elapsed.current / 30)));
    }, []);

    const startTimer = () => {
        if (running) return;
        setRunning(true);
        clearInterval(timer.current);
        timer.current = setInterval(() => {
            elapsed.current += 1;
            setSeconds(elapsed.current);
            if (elapsed.current >= ROUND_SECONDS) finish();
        }, 1000);
    };

    const point = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const down = (e) => {
        if (!ctxRef.current || result !== null) return;
        drawing.current = true;
        const p = point(e);
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(p.x, p.y);
        // El cronómetro arranca con el primer trazo, no al entrar.
        startTimer();
    };

    const move = (e) => {
        if (!drawing.current || !ctxRef.current) return;
        const p = point(e);
        ctxRef.current.strokeStyle = color;
        ctxRef.current.lineWidth = brush;
        ctxRef.current.lineTo(p.x, p.y);
        ctxRef.current.stroke();
    };

    const up = () => {
        drawing.current = false;
    };

    const newRound = () => {
        clearInterval(timer.current);
        paint();
        elapsed.current = 0;
        setWord(randomWord());
        setShown(false);
        setSeconds(0);
        setRunning(false);
        setResult(null);
    };

    const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    return (
        <Screen>
            <PageHeader
                kicker={GAME.name}
                kickerColor={GAME.kicker}
                status="90 s · el dibujante paga"
                onBack={() => navigate(-1)}
                rightAction={
                    <IconButton onClick={() => setHelpOpen(true)} aria-label="Cómo se juega">
                        <CircleQuestionMark size={21} />
                    </IconButton>
                }
            />

            <WordRow>
                <WordToggle
                    onClick={() => setShown((prev) => !prev)}
                    aria-label={shown ? 'Ocultar palabra' : 'Ver palabra'}
                >
                    {shown ? <EyeOff size={18} /> : <Eye size={18} />}
                </WordToggle>
                <Word>{shown ? word : '· · ·'}</Word>
                <Clock>{clock}</Clock>
            </WordRow>

            <CanvasArea>
                <Canvas
                    ref={canvasRef}
                    onPointerDown={down}
                    onPointerMove={move}
                    onPointerUp={up}
                    onPointerLeave={up}
                    onPointerCancel={up}
                />
                {result !== null && (
                    <ResultVeil>
                        <ResultKicker>¡Tiempo!</ResultKicker>
                        <ResultSips>{result === 1 ? '1 trago' : `${result} tragos`}</ResultSips>
                        <ResultWord>La palabra era «{word}»</ResultWord>
                        <Button size="md" color={GAME.color} onClick={newRound}>
                            Nueva palabra
                        </Button>
                    </ResultVeil>
                )}
            </CanvasArea>

            <Tools>
                <Swatches>
                    {COLORS.map((value) => (
                        <Swatch
                            key={value}
                            $color={value}
                            $on={color === value}
                            onClick={() => setColor(value)}
                            aria-label={`Color ${value}`}
                        />
                    ))}
                </Swatches>
                <Brushes>
                    {BRUSHES.map((size) => (
                        <Brush
                            key={size}
                            $on={brush === size}
                            onClick={() => setBrush(size)}
                            aria-label={`Grosor ${size}`}
                        >
                            <BrushDot $size={size} />
                        </Brush>
                    ))}
                </Brushes>
                <Actions>
                    <Button variant="secondary" size="sm" onClick={paint}>
                        Limpiar
                    </Button>
                    <Button variant="secondary" size="sm" onClick={newRound}>
                        Nueva
                    </Button>
                    <Button size="sm" color={GAME.color} onClick={finish}>
                        Finalizar
                    </Button>
                </Actions>
            </Tools>

            <HowToPlayModal
                visible={helpOpen}
                onClose={() => setHelpOpen(false)}
                gameId="trazotrago"
            />
        </Screen>
    );
}
