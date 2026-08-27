import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { UsersRound } from 'lucide-react';
import { usePenas } from '../contexts/PenasContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getUnlockedStamps } from '../services/stampService';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import LoadingScreen from '../components/ui/LoadingScreen';
import Kicker from '../components/ui/Kicker';

const OwnPena = styled.button`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3.5)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ $color }) => $color};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  transition: transform ${({ theme }) => theme.transitions.base};

  &:active {
    transform: scale(0.995);
  }
`;

const Texts = styled.span`
  flex: 1;
  min-width: 0;
`;

const OwnKicker = styled.span`
  display: block;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ $color }) => $color};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const OwnName = styled.span`
  display: block;
  margin-top: 3px;
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const OwnMembers = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};

  > * {
    flex: 1;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  height: 60px;
  padding: 0 ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
`;

const RowName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 15px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowCount = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ListKicker = styled(Kicker)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Empty = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.faint};
  margin: 0;
`;

const SheetText = styled.p`
  margin: ${({ theme }) => theme.spacing(1.5)} 0 ${({ theme }) => theme.spacing(4)};
  font-size: 13.5px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ErrorText = styled.p`
  margin: ${({ theme }) => theme.spacing(2.5)} 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.error};
`;

export default function PenasList() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { penas, myPena, loading, loadPenas, joinPena } = usePenas();
    const { user, loading: flechazoLoading } = useFlechazo();
    const [joinOpen, setJoinOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinError, setJoinError] = useState('');
    const [joining, setJoining] = useState(false);
    const [unlocked, setUnlocked] = useState([]);

    useEffect(() => {
        // Esperar a que FlechazoContext resuelva la sesión — si no, en una carga
        // en frío loadPenas se ejecuta con user aún sin cargar y no se repite.
        if (flechazoLoading) return;
        loadPenas(eventId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, user?.id, flechazoLoading]);

    useEffect(() => {
        if (!user?.id || !eventId) return;
        getUnlockedStamps(user.id, eventId).then((result) =>
            setUnlocked(result.penaIds || []),
        );
    }, [user?.id, eventId]);

    const otherPenas = penas.filter((pena) => pena.id !== myPena?.id);

    if (flechazoLoading || loading) return <LoadingScreen />;

    const handleJoin = async () => {
        if (!joinCode.trim()) return;
        setJoining(true);
        setJoinError('');
        const result = await joinPena(eventId, joinCode);
        setJoining(false);
        if (result.success) {
            setJoinOpen(false);
            setJoinCode('');
        } else {
            setJoinError(result.error || 'No se pudo unir a la peña');
        }
    };

    const memberLabel = (count) =>
        `${count ?? 0} ${count === 1 ? 'miembro' : 'miembros'}`;

    return (
        <Screen>
            <PageHeader title="Peñas" onBack={() => navigate(-1)} />
            <Content>
                {myPena ? (
                    <OwnPena
                        $color={myPena.color}
                        onClick={() => navigate(`/eventos/${eventId}/penas/${myPena.id}`)}
                    >
                        <PenaStamp pena={myPena} size={56} />
                        <Texts>
                            <OwnKicker $color={myPena.color}>Tu peña</OwnKicker>
                            <OwnName>{myPena.name}</OwnName>
                            <OwnMembers>{memberLabel(myPena.memberCount ?? myPena.members?.length)}</OwnMembers>
                        </Texts>
                    </OwnPena>
                ) : (
                    <Actions>
                        <Button
                            size="md"
                            onClick={() => navigate(`/eventos/${eventId}/penas/nueva`)}
                        >
                            Crear peña
                        </Button>
                        <Button variant="secondary" size="md" onClick={() => setJoinOpen(true)}>
                            Con código
                        </Button>
                    </Actions>
                )}

                <ListKicker>Resto de peñas del evento</ListKicker>

                {otherPenas.length === 0 ? (
                    <Empty>Todavía no hay ninguna otra peña en este evento.</Empty>
                ) : (
                    <List>
                        {otherPenas.map((pena) => (
                            <Row key={pena.id}>
                                <PenaStamp
                                    pena={pena}
                                    size={36}
                                    locked={!unlocked.includes(pena.id)}
                                />
                                <RowName>{pena.name}</RowName>
                                <RowCount>
                                    <UsersRound size={15} />
                                    {pena.memberCount}
                                </RowCount>
                            </Row>
                        ))}
                    </List>
                )}
            </Content>

            <BottomSheet visible={joinOpen} onClose={() => setJoinOpen(false)}>
                <SheetTitle>Unirte con código</SheetTitle>
                <SheetText>
                    Pídeselo a alguien de la peña: lo tienen en el detalle de su peña.
                </SheetText>
                <Input
                    placeholder="Código de la peña"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                />
                {joinError && <ErrorText>{joinError}</ErrorText>}
                <div style={{ height: 20 }} />
                <Button
                    size="lg"
                    fullWidth
                    onClick={handleJoin}
                    disabled={!joinCode.trim() || joining}
                >
                    {joining ? 'Uniéndote...' : 'Unirme'}
                </Button>
            </BottomSheet>
        </Screen>
    );
}
