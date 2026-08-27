import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import QRCode from 'qrcode';
import { CircleUser } from 'lucide-react';
import { usePenas } from '../contexts/PenasContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenaMembers } from '../services/penasService';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import LoadingScreen from '../components/ui/LoadingScreen';
import Kicker from '../components/ui/Kicker';

const Hero = styled.div`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(4.5)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
`;

// Lavado radial del color de la peña, al 22%: da identidad sin gritar.
const Wash = styled.span`
  position: absolute;
  inset: 0;
  opacity: 0.22;
  pointer-events: none;
  background: radial-gradient(120% 100% at 100% 0%, ${({ $color }) => $color}, transparent 62%);
`;

const HeroStamp = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const HeroTexts = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const HeroName = styled.h1`
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const HeroMembers = styled.p`
  margin: 5px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 48px;
  padding: 0 ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.faint};
`;

const MemberName = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const SectionKicker = styled(Kicker)`
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Empty = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.faint};
  margin: 0 0 ${({ theme }) => theme.spacing(5)};
`;

const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3.5)};
`;

const CodeValue = styled.p`
  margin: ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: 40px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  letter-spacing: 0.14em;
  color: ${({ theme }) => theme.colors.accentText};
`;

const SheetHint = styled.p`
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
`;

const QrImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: #fff;
  padding: 8px;
`;

const PayloadText = styled.code`
  display: block;
  width: 100%;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.text.faint};
  background: ${({ theme }) => theme.colors.surfaceInput};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  word-break: break-all;
  text-align: center;
`;

export default function PenaDetail() {
    const navigate = useNavigate();
    const { eventId, penaId } = useParams();
    const { penas, myPena, loading: penasLoading, loadPenas, leavePena } = usePenas();
    const { user, loading: flechazoLoading } = useFlechazo();
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [codeOpen, setCodeOpen] = useState(false);
    const [stampOpen, setStampOpen] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [stampPayload, setStampPayload] = useState('');
    const [leaving, setLeaving] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [error, setError] = useState('');

    const pena = penas.find((p) => p.id === penaId) || (myPena?.id === penaId ? myPena : null);

    useEffect(() => {
        if (flechazoLoading) return;
        loadPenas(eventId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, user?.id, flechazoLoading]);

    useEffect(() => {
        if (!penaId) return;
        setLoadingMembers(true);
        getPenaMembers(penaId).then((result) => {
            setMembers(result.members);
            setLoadingMembers(false);
        });
    }, [penaId]);

    useEffect(() => {
        if (!pena) return;
        // Payload propio de la app: inerte para cualquier lector de QR genérico,
        // solo la pantalla de escaneo de Previuca hace algo con este prefijo.
        const payload = `previuca:stamp:${eventId}:${pena.id}`;
        setStampPayload(payload);
        QRCode.toDataURL(payload, { margin: 1, width: 400 })
            .then(setQrDataUrl)
            .catch((err) => console.error('Error generating stamp QR:', err));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pena?.id, eventId]);

    const isOwnPena = myPena?.id === penaId;

    const doLeave = async () => {
        setLeaving(true);
        const result = await leavePena(eventId);
        setLeaving(false);
        if (result.success) {
            navigate(`/eventos/${eventId}/penas`, { replace: true });
        } else {
            setError(result.error || 'No se pudo abandonar la peña');
        }
    };

    if (flechazoLoading || penasLoading) return <LoadingScreen />;

    // Solo el perfil de tu propia peña es visible; el resto de peñas del
    // evento solo aparecen como nombre en el listado, sin poder entrar.
    if (!pena || !isOwnPena) {
        return (
            <Screen>
                <PageHeader title="Peña" onBack={() => navigate(-1)} />
                <Content>
                    <Empty>
                        {!pena
                            ? 'No se encontró esta peña.'
                            : 'Solo puedes ver el perfil de tu propia peña.'}
                    </Empty>
                </Content>
            </Screen>
        );
    }

    return (
        <Screen>
            <PageHeader title="Tu peña" onBack={() => navigate(-1)} />
            <Content>
                <Hero>
                    <Wash $color={pena.color} aria-hidden="true" />
                    <HeroStamp>
                        <PenaStamp pena={pena} size={132} />
                    </HeroStamp>
                    <HeroTexts>
                        <HeroName>{pena.name}</HeroName>
                        <HeroMembers>
                            {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
                        </HeroMembers>
                    </HeroTexts>
                </Hero>

                <SectionKicker>Miembros</SectionKicker>

                {loadingMembers ? (
                    <Empty>Cargando...</Empty>
                ) : members.length === 0 ? (
                    <Empty>Todavía no hay miembros.</Empty>
                ) : (
                    <MemberList>
                        {members.map((member) => (
                            <MemberRow key={member.user_id}>
                                <CircleUser size={20} />
                                <MemberName>{member.displayName}</MemberName>
                            </MemberRow>
                        ))}
                    </MemberList>
                )}

                {error && <Empty style={{ color: '#e08a8f' }}>{error}</Empty>}

                <Actions>
                    <Button size="md" onClick={() => setStampOpen(true)}>
                        Mostrar sello para que lo escaneen
                    </Button>
                    <Button variant="secondary" size="md" onClick={() => setCodeOpen(true)}>
                        Ver código de invitación
                    </Button>
                    <Button
                        variant="danger"
                        size="md"
                        disabled={leaving}
                        onClick={() =>
                            setConfirm({
                                title: `¿Abandonar «${pena.name}»?`,
                                text: 'Dejas de contar como miembro y podrás crear o unirte a otra peña de este evento.',
                                cta: leaving ? 'Abandonando...' : 'Abandonar',
                                tone: 'danger',
                                run: doLeave,
                            })
                        }
                    >
                        Abandonar peña
                    </Button>
                </Actions>
            </Content>

            <BottomSheet visible={codeOpen} onClose={() => setCodeOpen(false)}>
                <SheetTitle>Código de invitación</SheetTitle>
                <CodeValue>{pena.code}</CodeValue>
                <SheetHint>
                    Compártelo con quien quieras que se una a «{pena.name}».
                </SheetHint>
            </BottomSheet>

            <BottomSheet visible={stampOpen} onClose={() => setStampOpen(false)}>
                <SheetTitle>Sello de «{pena.name}»</SheetTitle>
                <div style={{ height: 18 }} />
                <SheetBody>
                    <PenaStamp pena={pena} size={132} />
                    {qrDataUrl && (
                        <QrImage src={qrDataUrl} alt="Código para desbloquear este sello" />
                    )}
                    <SheetHint>
                        Que alguien de otra peña lo escanee desde Álbum de sellos → Escanear. Si su
                        cámara no funciona, puede escribir este código a mano:
                    </SheetHint>
                    <PayloadText>{stampPayload}</PayloadText>
                </SheetBody>
            </BottomSheet>

            <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />
        </Screen>
    );
}
