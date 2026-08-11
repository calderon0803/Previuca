import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoRefresh, IoEye, IoEyeOff, IoPlay, IoTrashOutline, IoCheckmark } from 'react-icons/io5';
import { Palette, Beer, HelpCircle } from 'lucide-react';
import { trazoTragoWords } from '../data/trazoTragoWords';
import HowToPlayModal from '../components/HowToPlayModal';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';

const Container = styled.div`
    min-height: 100dvh;
    height: 100dvh;
    background: ${({ theme }) => theme.colors.background};
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const StartOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 11, 14, 0.92);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 20;
    gap: ${({ theme }) => theme.spacing(5)};
    padding: ${({ theme }) => theme.spacing(6)};
    box-sizing: border-box;
`;

// StartOverlay/ResultOverlay son siempre una cortina oscura fija (no
// dependen del tema), así que su texto usa colores claros fijos en vez
// de theme.colors.text.* — si no, con un tema claro el texto se volvería
// invisible sobre este fondo oscuro.
const StartTitle = styled.h2`
    color: #F1EDF0;
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    margin: 0;
    text-align: center;
`;

const StartDescription = styled.p`
    color: #C7C0CB;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    text-align: center;
    max-width: 320px;
    margin: 0;
    line-height: 1.5;
`;

const ResultOverlay = styled(StartOverlay)`
    z-index: 25;
`;

const ResultTitle = styled(StartTitle)`
    color: ${({ theme }) => theme.colors.primary};
`;

const ResultValue = styled.div`
    font-size: ${({ theme }) => theme.typography.fontSize.display};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: #F1EDF0;
`;

const ResultDetail = styled.p`
    color: #F1EDF0;
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    margin: 5px 0;
`;

const WordRevealBar = styled.div`
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ theme }) => theme.spacing(3)};
`;

const WordText = styled.div`
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    flex: 1;
    text-align: center;
    user-select: ${props => props.$hidden ? 'none' : 'auto'};
`;

const TimerDisplay = styled.div`
    background: ${({ theme }) => theme.colors.surfaceRaised};
    border: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
    min-width: 44px;
    height: 42px;
    padding: 0 ${({ theme }) => theme.spacing(2)};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.radii.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-variant-numeric: tabular-nums;
`;

const CanvasContainer = styled.div`
    flex: 1;
    position: relative;
    background: #fff;
    touch-action: none;
    overflow: hidden;
`;

const Canvas = styled.canvas`
    display: block;
    width: 100%;
    height: 100%;
    cursor: crosshair;
    touch-action: none;
`;

const Toolbar = styled.div`
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
    background: ${({ theme }) => theme.colors.surface};
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(3)};
`;

const ToolbarRow = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    justify-content: center;
    flex-wrap: wrap;
`;

const BottomActionsRow = styled(ToolbarRow)`
    flex-wrap: nowrap;
    width: 100%;
    justify-content: space-around;
`;

const ColorButton = styled.button`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
    background: ${props => props.$color};
    cursor: pointer;
    transition: transform ${({ theme }) => theme.transitions.fast};
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:hover {
        transform: scale(1.08);
    }
`;

const BrushSizeButton = styled.button`
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.accent : theme.colors.border)};
    background: ${({ theme }) => theme.colors.surfaceRaised};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color ${({ theme }) => theme.transitions.fast};

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderStrong};
    }
`;

const BrushPreview = styled.div`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.text.primary};
`;

const COLORS = [
    { name: 'Negro', value: '#000000' },
    { name: 'Rojo', value: '#FF0000' },
    { name: 'Azul', value: '#0000FF' },
    { name: 'Verde', value: '#00FF00' },
    { name: 'Naranja', value: '#FF8800' },
    { name: 'Morado', value: '#8800FF' },
    { name: 'Rosa', value: '#FF00FF' },
];

const BRUSH_SIZES = [2, 5, 10, 15];

export default function TrazoTragoGame() {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentWord, setCurrentWord] = useState('');
    const [showWord, setShowWord] = useState(false);
    const [currentColor, setCurrentColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        selectNewWord();
        setupCanvas();
        window.addEventListener('resize', setupCanvas);
        return () => window.removeEventListener('resize', setupCanvas);
    }, []);

    // Timer effect
    useEffect(() => {
        if (!isGameStarted || isTimerPaused) return;

        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isGameStarted, isTimerPaused]);

    // Time limit effect
    useEffect(() => {
        if (elapsedTime >= 90 && !isTimerPaused && isGameStarted) {
            handleFinish();
        }
    }, [elapsedTime, isTimerPaused, isGameStarted]);

    const setupCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const selectNewWord = () => {
        const randomWord = trazoTragoWords[Math.floor(Math.random() * trazoTragoWords.length)];
        setCurrentWord(randomWord);
        setShowWord(false);
        setElapsedTime(0); // Reset timer
        setIsTimerPaused(false); // Resume timer
        setShowResult(false);
    };

    const startNewRound = () => {
        clearCanvas();
        selectNewWord();
        setIsGameStarted(false);
    };

    const handleStartGame = () => {
        setIsGameStarted(true);
        selectNewWord();
        // Canvas setup might need to be re-run or cleared
        setTimeout(setupCanvas, 0);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleFinish = () => {
        setIsTimerPaused(true);
        setShowWord(true);
        setShowResult(true);
    };

    const calculateSips = () => {
        const sips = Math.floor(elapsedTime / 30);
        return sips === 0 ? 1 : sips; // Minimum 1 sip if time < 30s
    };

    return (
        <Container>
            <PageHeader
                title="Trazo & Trago"
                onBack={() => navigate(-1)}
                rightAction={
                    <IconButton variant="ghost" onClick={() => setShowHelp(true)} aria-label="Cómo se juega">
                        <HelpCircle size={20} />
                    </IconButton>
                }
            />

            <HowToPlayModal visible={showHelp} onClose={() => setShowHelp(false)} title="Trazo & Trago">
                <p>
                    Te toca dibujar una palabra y que los demás la adivinen, sin hablar tú ni
                    escribir letras o números. Tienes 90 segundos.
                </p>
                <p>
                    Cuanto más tardes en que la adivinen, más tragos bebes: uno si acabas rápido,
                    hasta tres si se te echa el tiempo encima. El que dibuja es quien paga, no los
                    que adivinan.
                </p>
            </HowToPlayModal>

            <WordRevealBar>
                <IconButton variant="ghost" size="sm" onClick={() => setShowWord(!showWord)} aria-label="Mostrar/ocultar palabra">
                    {showWord ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                </IconButton>
                <WordText $hidden={!showWord}>
                    {showWord ? currentWord : '???'}
                </WordText>
                <TimerDisplay>
                    {formatTime(elapsedTime)}
                </TimerDisplay>
            </WordRevealBar>

            <CanvasContainer>
                {!isGameStarted && (
                    <StartOverlay>
                        <StartTitle>
                            Trazo & Trago <Palette size={26} style={{ verticalAlign: 'middle', marginLeft: 4 }} />
                        </StartTitle>
                        <StartDescription>
                            Tienes 90 segundos. ¡Vamos!
                        </StartDescription>
                        <Button size="lg" onClick={handleStartGame}>
                            <IoPlay size={20} />
                            Jugar
                        </Button>
                    </StartOverlay>
                )}
                <Canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {showResult && (
                    <ResultOverlay>
                        <ResultTitle>¡Tiempo!</ResultTitle>
                        <ResultDetail>Tiempo total: {formatTime(elapsedTime)}</ResultDetail>
                        <StartDescription>
                            Por tardar tanto, el dibujante bebe:
                        </StartDescription>
                        <ResultValue>
                            {calculateSips()} {calculateSips() === 1 ? 'trago' : 'tragos'}{' '}
                            <Beer size={28} style={{ verticalAlign: 'middle' }} />
                        </ResultValue>
                        <Button size="lg" onClick={() => setShowResult(false)}>
                            Aceptar
                        </Button>
                    </ResultOverlay>
                )}
            </CanvasContainer>

            <Toolbar>
                <ToolbarRow>
                    {COLORS.map((color) => (
                        <ColorButton
                            key={color.value}
                            $color={color.value}
                            $active={currentColor === color.value}
                            onClick={() => setCurrentColor(color.value)}
                            title={color.name}
                        />
                    ))}
                </ToolbarRow>

                <ToolbarRow>
                    {BRUSH_SIZES.map((size) => (
                        <BrushSizeButton
                            key={size}
                            $active={brushSize === size}
                            onClick={() => setBrushSize(size)}
                            title={`Grosor ${size}`}
                        >
                            <BrushPreview $size={size} />
                        </BrushSizeButton>
                    ))}
                </ToolbarRow>

                <BottomActionsRow>
                    <Button variant="secondary" size="sm" onClick={clearCanvas}>
                        <IoTrashOutline size={16} />
                        Limpiar
                    </Button>

                    <Button variant="secondary" size="sm" onClick={startNewRound}>
                        <IoRefresh size={16} />
                        Nueva
                    </Button>

                    <Button size="sm" onClick={handleFinish} disabled={isTimerPaused}>
                        <IoCheckmark size={16} />
                        Finalizar
                    </Button>
                </BottomActionsRow>
            </Toolbar>
        </Container>
    );
}
