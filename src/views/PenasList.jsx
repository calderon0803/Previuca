import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoPeopleOutline } from 'react-icons/io5';
import { usePenas } from '../contexts/PenasContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

// Tinte suave del color de la peña para el fondo de "Tu peña" — el color
// completo se reserva para el borde y la etiqueta, así el texto principal
// sigue siendo legible sea cual sea el color elegido.
function hexToRgba(hex, alpha) {
    const clean = (hex || '#B23A63').replace('#', '');
    const full = clean.length === 3
        ? clean.split('').map((ch) => ch + ch).join('')
        : clean.padEnd(6, '0');
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const ActionsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const OwnPenaBanner = styled.div`
  background: ${({ $color }) => hexToRgba($color, 0.14)};
  border: 1px solid ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  cursor: pointer;
`;

const OwnPenaLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ $color }) => $color};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 4px 0;
`;

const OwnPenaName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
`;

const SectionLabel = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const PenaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const Thumb = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $color, $image }) => ($image ? `url(${$image})` : $color)};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const PenaInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PenaName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MemberCount = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  flex-shrink: 0;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: center;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: ${({ theme }) => theme.spacing(3)} 0 0 0;
`;

export default function PenasList() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { penas, myPena, loading, loadPenas, joinPena } = usePenas();
    const { user, loading: flechazoLoading } = useFlechazo();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        // Esperar a que FlechazoContext resuelva la sesión — si no, en una carga
        // en frío loadPenas se ejecuta con user aún sin cargar y no se repite.
        if (flechazoLoading) return;
        loadPenas(eventId);
    }, [eventId, user?.id, flechazoLoading]);

    const otherPenas = penas.filter((pena) => pena.id !== myPena?.id);

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        setJoinError('');
        const result = await joinPena(eventId, joinCode);
        setJoining(false);
        if (result.success) {
            setShowJoinModal(false);
            setJoinCode('');
        } else {
            setJoinError(result.error || 'No se pudo unir a la peña');
        }
    };

    return (
        <Container>
            <PageHeader title="Peñas" onBack={() => navigate(-1)} />
            <Content>
                {myPena ? (
                    <OwnPenaBanner $color={myPena.color} onClick={() => navigate(`/eventos/${eventId}/penas/${myPena.id}`)}>
                        <OwnPenaLabel $color={myPena.color}>Tu peña</OwnPenaLabel>
                        <OwnPenaName>{myPena.name}</OwnPenaName>
                    </OwnPenaBanner>
                ) : (
                    <ActionsRow>
                        <Button fullWidth onClick={() => navigate(`/eventos/${eventId}/penas/nueva`)}>
                            Crear peña
                        </Button>
                        <Button variant="secondary" fullWidth onClick={() => setShowJoinModal(true)}>
                            Unirme con código
                        </Button>
                    </ActionsRow>
                )}

                <SectionLabel>Resto de peñas</SectionLabel>

                {loading ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : otherPenas.length === 0 ? (
                    <EmptyText>Todavía no hay ninguna otra peña en este evento.</EmptyText>
                ) : (
                    <List>
                        {otherPenas.map((pena) => (
                            <PenaRow key={pena.id}>
                                <Thumb $color={pena.color} $image={pena.image_url} />
                                <PenaInfo>
                                    <PenaName>{pena.name}</PenaName>
                                </PenaInfo>
                                <MemberCount>
                                    <IoPeopleOutline size={16} />
                                    {pena.memberCount}
                                </MemberCount>
                            </PenaRow>
                        ))}
                    </List>
                )}
            </Content>

            <Modal visible={showJoinModal} onClose={() => setShowJoinModal(false)}>
                <ModalTitle>Unirme a una peña</ModalTitle>
                <Input
                    placeholder="Código de la peña"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />
                {joinError && <ErrorText>{joinError}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setShowJoinModal(false)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handleJoin} disabled={!joinCode.trim() || joining}>
                        {joining ? 'Uniendo...' : 'Unirme'}
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}
