import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import jsQR from 'jsqr';
import { IoCameraOutline } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { unlockStamp } from '../services/stampService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const STAMP_PREFIX = 'previuca:stamp:';

// previuca:stamp:<eventId>:<penaId> -> { scannedEventId, penaId } o null si no encaja
function parseStampPayload(text) {
    if (!text?.startsWith(STAMP_PREFIX)) return null;
    const rest = text.slice(STAMP_PREFIX.length);
    const parts = rest.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    return { scannedEventId: parts[0], penaId: parts[1] };
}

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const CameraFrame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CameraHint = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const StatusText = styled.p`
  text-align: center;
  margin: 0;
  color: ${({ theme, $tone }) => ($tone === 'error' ? theme.colors.error : $tone === 'success' ? theme.colors.success : theme.colors.text.secondary)};
`;

export default function ScanStamp() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user } = useFlechazo();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const handledRef = useRef(false);

    const [cameraError, setCameraError] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [status, setStatus] = useState(null); // { tone, text }
    const [unlocking, setUnlocking] = useState(false);

    const handlePayload = useCallback(async (payload) => {
        if (handledRef.current) return;
        const parsed = parseStampPayload(payload.trim());

        if (!parsed) {
            setStatus({ tone: 'error', text: 'Ese código no es un sello válido de Previuca.' });
            return;
        }
        if (parsed.scannedEventId !== eventId) {
            setStatus({ tone: 'error', text: 'Este sello pertenece a otro evento.' });
            return;
        }

        handledRef.current = true;
        setUnlocking(true);
        const result = await unlockStamp(user.id, parsed.penaId, eventId);
        setUnlocking(false);

        if (result.success) {
            setStatus({ tone: 'success', text: '¡Sello desbloqueado! Vuelve al álbum para verlo.' });
        } else {
            handledRef.current = false;
            setStatus({ tone: 'error', text: result.error || 'No se pudo desbloquear el sello.' });
        }
    }, [eventId, user?.id]);

    useEffect(() => {
        let cancelled = false;

        const tick = () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code?.data) {
                handlePayload(code.data);
            }

            if (!handledRef.current) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                if (cancelled) {
                    stream.getTracks().forEach((track) => track.stop());
                    return;
                }
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute('playsinline', 'true');
                    videoRef.current.setAttribute('muted', 'true');
                    await videoRef.current.play();
                }
                rafRef.current = requestAnimationFrame(tick);
            } catch (error) {
                if (error?.name === 'NotAllowedError') {
                    setCameraError('No hay permiso para usar la cámara. Puedes introducir el código a mano.');
                } else if (error?.name === 'NotFoundError') {
                    setCameraError('No se encontró ninguna cámara. Introduce el código a mano.');
                } else {
                    setCameraError('No se pudo abrir la cámara. Introduce el código a mano.');
                }
            }
        };

        startCamera();

        return () => {
            cancelled = true;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            streamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, [handlePayload]);

    const handleManualUnlock = async () => {
        setStatus(null);
        await handlePayload(manualCode);
    };

    return (
        <Container>
            <PageHeader title="Escanear sello" onBack={() => navigate(`/eventos/${eventId}/album`)} />
            <Content>
                <CameraFrame>
                    <Video ref={videoRef} autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {cameraError && (
                        <CameraHint>
                            <IoCameraOutline size={32} />
                            <span>{cameraError}</span>
                        </CameraHint>
                    )}
                </CameraFrame>

                {status && <StatusText $tone={status.tone}>{status.text}</StatusText>}

                <Divider>o escribe el código a mano</Divider>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Input
                        placeholder="previuca:stamp:..."
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        disabled={unlocking}
                    />
                    <Button onClick={handleManualUnlock} disabled={!manualCode.trim() || unlocking}>
                        {unlocking ? '...' : 'Desbloquear'}
                    </Button>
                </div>
            </Content>
        </Container>
    );
}
