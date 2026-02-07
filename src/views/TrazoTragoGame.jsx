import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoRefresh, IoEye, IoEyeOff, IoPlay } from 'react-icons/io5';
import { FaBroom } from 'react-icons/fa';
import { trazoTragoWords } from '../data/trazoTragoWords';

const Container = styled.div`
    min-height: 100vh;
    height: 100vh;
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
    background: rgba(15, 1, 9, 0.9);
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 20;
    gap: 20px;
`;

const StartTitle = styled.h2`
    color: #fff;
    font-size: 32px;
    margin: 0;
    text-align: center;
`;

const StartDescription = styled.p`
    color: #ccca;
    font-size: 16px;
    text-align: center;
    max-width: 80%;
    margin: 0;
    line-height: 1.5;
`;

const StartButton = styled.button`
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    border: none;
    padding: 16px 40px;
    border-radius: 50px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 10px;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 15px 30px rgba(0,0,0,0.4);
    }
`;

const ResultOverlay = styled(StartOverlay)`
    z-index: 25;
`;

const ResultTitle = styled(StartTitle)`
    color: ${({ theme }) => theme.colors.primary};
`;

const ResultValue = styled.div`
    font-size: 48px;
    font-weight: 900;
    color: #fff;
    text-shadow: 0 0 20px ${({ theme }) => theme.colors.primary};
`;

const ResultDetail = styled.p`
    color: #fff;
    font-size: 18px;
    margin: 5px 0;
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

const WordRevealBar = styled.div`
    padding: 16px 20px;
    background: ${({ theme }) => theme.colors.surface};
    border-bottom: 2px solid ${({ theme }) => theme.colors.secondary};
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
`;

const WordText = styled.div`
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 20px;
    font-weight: bold;
    flex: 1;
    text-align: center;
    user-select: ${props => props.$hidden ? 'none' : 'auto'};
`;

const TimerDisplay = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.primary};
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    font-weight: bold;
    font-size: 14px;
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
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.surface};
    border-top: 2px solid ${({ theme }) => theme.colors.secondary};
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ToolbarRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
`;

const BottomActionsRow = styled(ToolbarRow)`
    flex-wrap: nowrap;
    width: 100%;
    justify-content: space-around;
`;

const ColorButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid ${props => props.$active ? '#FFD800' : 'transparent'};
    background: ${props => props.$color};
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);

    &:hover {
        transform: scale(1.1);
    }
`;

const BrushSizeButton = styled.button`
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 2px solid ${props => props.$active ? '#FFD800' : ({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.surface};
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background: ${({ theme }) => theme.colors.primary};
    }
`;

const BrushPreview = styled.div`
    width: ${props => props.$size}px;
    height: ${props => props.$size}px;
    border-radius: 50%;
    background: #fff;
`;

const ActionButton = styled.button`
    padding: 8px 12px;
    border-radius: 8px;
    border: 2px solid ${({ theme }) => theme.colors.secondary};
    background: ${({ theme }) => theme.colors.primary};
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
        transform: scale(1.05);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
            transform: none;
        }
    }
`;

const Divider = styled.div`
    width: 2px;
    height: 30px;
    background: ${({ theme }) => theme.colors.secondary};
    margin: 0 4px;
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
            <Header>
                <IconButton onClick={() => navigate('/games')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Trazo & Trago</HeaderTitle>
                <IconButton onClick={selectNewWord}>
                    <IoRefresh size={24} />
                </IconButton>
            </Header>

            <WordRevealBar>
                <IconButton onClick={() => setShowWord(!showWord)}>
                    {showWord ? <IoEyeOff size={24} /> : <IoEye size={24} />}
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
                        <StartTitle>Trazo & Trago 🎨</StartTitle>
                        <StartDescription>
                            Dibuja la palabra asignada y haz que tus amigos adivinen.
                            ¡El tiempo corre!
                        </StartDescription>
                        <StartButton onClick={handleStartGame}>
                            <IoPlay size={24} />
                            JUGAR
                        </StartButton>
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
                            {calculateSips()} {calculateSips() === 1 ? 'trago' : 'tragos'} 🍺
                        </ResultValue>
                        <StartButton onClick={() => setShowResult(false)}>
                            ACEPTAR
                        </StartButton>
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
                    <ActionButton onClick={clearCanvas}>
                        <FaBroom size={18} />
                        LIMPIAR
                    </ActionButton>

                    <ActionButton onClick={() => { clearCanvas(); selectNewWord(); }}>
                        <IoRefresh size={18} />
                        NUEVA
                    </ActionButton>

                    <ActionButton onClick={handleFinish} disabled={isTimerPaused}>
                        ✓ FINALIZAR
                    </ActionButton>
                </BottomActionsRow>
            </Toolbar>
        </Container>
    );
}
