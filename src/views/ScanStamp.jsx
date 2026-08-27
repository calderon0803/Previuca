import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import jsQR from 'jsqr';
import { Camera } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent } from '../services/penasService';
import { getUnlockedStamps, unlockStamp } from '../services/stampService';
import { activityColors } from '../styles/theme';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ALBUM = activityColors.album;
const STAMP_PREFIX = 'previuca:stamp:';

// previuca:stamp:<eventId>:<penaId> -> { scannedEventId, penaId } o null si no encaja
function parseStampPayload(text) {
    if (!text?.startsWith(STAMP_PREFIX)) return null;
    const rest = text.slice(STAMP_PREFIX.length);
    const parts = rest.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    return { scannedEventId: parts[0], penaId: parts[1] };
}

const ScanContent = styled(Content)`
  padding: 0 ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4.5)};
`;

// Marco cuadrado hundido, con cuatro esquinas en el color del álbum.
const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.backgroundDeep};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
`;

const Corner = styled.span`
  position: absolute;
  width: 34px;
  height: 34px;
  z-index: 2;
  pointer-events: none;

  ${({ $at }) =>
        $at === 'tl'
            ? css`
          top: 22px;
          left: 22px;
          border-top: 2px solid ${ALBUM.color};
          border-left: 2px solid ${ALBUM.color};
        `
            : $at === 'tr'
                ? css`
          top: 22px;
          right: 22px;
          border-top: 2px solid ${ALBUM.color};
          border-right: 2px solid ${ALBUM.color};
        `
                : $at === 'bl'
                    ? css`
          bottom: 22px;
          left: 22px;
          border-bottom: 2px solid ${ALBUM.color};
          border-left: 2px solid ${ALBUM.color};
        `
                    : css`
          bottom: 22px;
          right: 22px;
          border-bottom: 2px solid ${ALBUM.color};
          border-right: 2px solid ${ALBUM.color};
        `}
`;

const Video = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const FrameHint = styled.div`
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.disabled};
  font-size: 13.5px;
  text-align: center;
  max-width: 220px;
`;

const Status = styled.p`
  margin: 0;
  text-align: center;
  font-size: 14.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $tone }) =>
        $tone === 'success' ? theme.colors.success : theme.colors.error};
`;

const Divider = styled.p`
  margin: 0;
  text-align: center;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const ManualRow = styled.div`
  display: flex;
  gap: 9px;
`;

const CodeInput = styled(Input)`
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: 14px;
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
    // Los datos del evento se guardan en refs para que el bucle de la cámara
    // los vea sin reiniciarse en cada render.
    const penasRef = useRef([]);
    const unlockedRef = useRef(new Set());

    const [cameraError, setCameraError] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [status, setStatus] = useState(null); // { tone, text }
    const [unlocking, setUnlocking] = useState(false);

    useEffect(() => {
        if (!user?.id || !eventId) return;
        let active = true;
        Promise.all([
            getPenasByEvent(eventId),
            getUnlockedStamps(user.id, eventId),
        ]).then(([penasResult, unlockedResult]) => {
            if (!active) return;
            penasRef.current = penasResult.penas || [];
            unlockedRef.current = new Set(unlockedResult.penaIds || []);
        });
        return () => {
            active = false;
        };
    }, [user?.id, eventId]);

    const handlePayload = useCallback(
        async (payload) => {
            if (handledRef.current) return;
            const parsed = parseStampPayload(String(payload || '').trim());

            if (!parsed) {
                setStatus({ tone: 'error', text: 'Ese código no es un sello de Previuca.' });
                return;
            }
            if (parsed.scannedEventId !== eventId) {
                setStatus({ tone: 'error', text: 'Ese sello es de otro evento.' });
                return;
            }

            const pena = penasRef.current.find((p) => p.id === parsed.penaId);
            if (!pena) {
                setStatus({ tone: 'error', text: 'Ese sello no existe en este evento.' });
                return;
            }
            if (unlockedRef.current.has(pena.id)) {
                setStatus({ tone: 'success', text: `Ya tenías el sello de «${pena.name}»` });
                return;
            }

            handledRef.current = true;
            setUnlocking(true);
            const result = await unlockStamp(user.id, pena.id, eventId);
            setUnlocking(false);

            if (result.success) {
                unlockedRef.current.add(pena.id);
                setStatus({ tone: 'success', text: `¡Sello de «${pena.name}» desbloqueado!` });
            } else {
                handledRef.current = false;
                setStatus({
                    tone: 'error',
                    text: result.error || 'No se pudo desbloquear el sello.',
                });
            }
        },
        [eventId, user?.id],
    );

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
                    setCameraError('Sin permiso para la cámara. Escribe el código a mano.');
                } else if (error?.name === 'NotFoundError') {
                    setCameraError('No hay cámara. Escribe el código a mano.');
                } else {
                    setCameraError('No se pudo abrir la cámara. Escribe el código a mano.');
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
        <Screen>
            <PageHeader title="Escanear sello" onBack={() => navigate(-1)} />
            <ScanContent>
                <Frame>
                    <Corner $at="tl" />
                    <Corner $at="tr" />
                    <Corner $at="bl" />
                    <Corner $at="br" />
                    <Video ref={videoRef} autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    {cameraError && (
                        <FrameHint>
                            <Camera size={32} />
                            <span>{cameraError}</span>
                        </FrameHint>
                    )}
                </Frame>

                {status && <Status $tone={status.tone}>{status.text}</Status>}

                <Divider>o escribe el código a mano</Divider>

                <ManualRow>
                    <CodeInput
                        placeholder="previuca:stamp:..."
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        disabled={unlocking}
                    />
                    <Button
                        size="md"
                        onClick={handleManualUnlock}
                        disabled={!manualCode.trim() || unlocking}
                    >
                        {unlocking ? '...' : 'Canjear'}
                    </Button>
                </ManualRow>
            </ScanContent>
        </Screen>
    );
}
