import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import QRCode from 'qrcode';
import { IoKeyOutline, IoPersonCircleOutline, IoRibbonOutline, IoExitOutline } from 'react-icons/io5';
import { usePenas } from '../contexts/PenasContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenaMembers } from '../services/penasService';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Photo = styled.div`
  height: 220px;
  background: ${({ $color, $image }) => ($image ? `url(${$image})` : $color)};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: ${({ theme }) => theme.spacing(5)};
  box-sizing: border-box;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 11, 14, 0.75), transparent 60%);
  }
`;

const StampBadgeWrap = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(5)};
  right: ${({ theme }) => theme.spacing(5)};
  z-index: 1;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing(1)};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const PenaName = styled.h1`
  color: #fff;
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  margin: 0;
  position: relative;
  z-index: 1;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const SectionEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const MemberName = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CodeValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: 0.15em;
  font-family: monospace;
  text-align: center;
  margin: ${({ theme }) => theme.spacing(5)} 0;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  text-align: center;
`;

const ModalHint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: 0;
`;

const StampModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const QrImage = styled.img`
  width: 220px;
  height: 220px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: #fff;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const PayloadText = styled.code`
  display: block;
  font-family: monospace;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surfaceRaised};
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
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [showStampModal, setShowStampModal] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [stampPayload, setStampPayload] = useState('');
    const [leaving, setLeaving] = useState(false);

    const pena = penas.find((p) => p.id === penaId) || (myPena?.id === penaId ? myPena : null);

    useEffect(() => {
        if (flechazoLoading) return;
        loadPenas(eventId);
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
            .catch((error) => console.error('Error generating stamp QR:', error));
    }, [pena?.id, eventId]);

    const isOwnPena = myPena?.id === penaId;

    const handleLeavePena = async () => {
        const confirmed = window.confirm(
            `¿Seguro que quieres abandonar «${pena?.name}»? Podrás crear o unirte a otra peña de este evento.`
        );
        if (!confirmed) return;

        setLeaving(true);
        const result = await leavePena(eventId);
        setLeaving(false);

        if (result.success) {
            navigate(`/eventos/${eventId}/penas`, { replace: true });
        } else {
            alert(result.error || 'No se pudo abandonar la peña');
        }
    };

    if (flechazoLoading || penasLoading) return <LoadingScreen />;

    // Solo el perfil de tu propia peña es visible; el resto de peñas del
    // evento solo aparecen como nombre en el listado, sin poder entrar.
    if (!pena || !isOwnPena) {
        return (
            <Container>
                <PageHeader title="Peña" onBack={() => navigate(-1)} />
                <Content>
                    <EmptyText>
                        {!pena ? 'No se encontró esta peña.' : 'Solo puedes ver el perfil de tu propia peña.'}
                    </EmptyText>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title="" onBack={() => navigate(-1)} />
            <Photo $color={pena.color} $image={pena.image_url}>
                <StampBadgeWrap>
                    <PenaStamp pena={pena} size={56} locked={false} />
                </StampBadgeWrap>
                <PenaName>{pena.name}</PenaName>
            </Photo>
            <Content>
                <SectionLabel>
                    <SectionEyebrow>Miembros ({members.length})</SectionEyebrow>
                </SectionLabel>

                {loadingMembers ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : members.length === 0 ? (
                    <EmptyText>Todavía no hay miembros.</EmptyText>
                ) : (
                    <MemberList>
                        {members.map((member) => (
                            <MemberRow key={member.user_id}>
                                <IoPersonCircleOutline size={22} color="#7C818C" />
                                <MemberName>{member.displayName}</MemberName>
                            </MemberRow>
                        ))}
                    </MemberList>
                )}

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => setShowStampModal(true)}>
                        <IoRibbonOutline size={16} />
                        Mostrar sello
                    </Button>
                    <Button variant="secondary" onClick={() => setShowCodeModal(true)}>
                        <IoKeyOutline size={16} />
                        Ver código
                    </Button>
                    <Button variant="danger" onClick={handleLeavePena} disabled={leaving}>
                        <IoExitOutline size={16} />
                        {leaving ? 'Abandonando...' : 'Abandonar peña'}
                    </Button>
                </div>
            </Content>

            <Modal visible={showCodeModal} onClose={() => setShowCodeModal(false)}>
                <ModalTitle>Código de la peña</ModalTitle>
                <CodeValue>{pena.code}</CodeValue>
                <ModalHint>Compártelo con quien quieras que se una a «{pena.name}».</ModalHint>
            </Modal>

            <Modal visible={showStampModal} onClose={() => setShowStampModal(false)}>
                <ModalTitle>Sello de «{pena.name}»</ModalTitle>
                <StampModalBody>
                    <PenaStamp pena={pena} size={120} locked={false} />
                    {qrDataUrl && <QrImage src={qrDataUrl} alt="Código para desbloquear este sello" />}
                    <ModalHint>
                        Que alguien de otra peña lo escanee desde Álbum de sellos → Escanear, para
                        añadir el sello de «{pena.name}» a su álbum. Si su cámara no funciona, puede
                        escribir este código a mano:
                    </ModalHint>
                    <PayloadText>{stampPayload}</PayloadText>
                </StampModalBody>
            </Modal>
        </Container>
    );
}
