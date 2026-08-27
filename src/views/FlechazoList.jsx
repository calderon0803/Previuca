import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Plus, X } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { activityColors } from '../styles/theme';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import LoadingScreen from '../components/ui/LoadingScreen';
import Kicker from '../components/ui/Kicker';

const FLECHAZO = activityColors.flechazo;

const AdmirersCard = styled.button`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(4.5)};
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid #423a6a;
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: #5d5294;
  }
`;

const Halo = styled.span`
  position: absolute;
  right: -20px;
  bottom: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, ${FLECHAZO.glow}, transparent 70%);
`;

const AdmirersTexts = styled.span`
  position: relative;
`;

const AdmirersLabel = styled.span`
  display: block;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const AdmirersCount = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 32px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const AdmirersCta = styled.span`
  position: relative;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accentText};
`;

const Slots = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const Slot = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  min-height: 56px;
  padding: 0 ${({ theme }) => theme.spacing(2)} 0 ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid
    ${({ theme, $match }) => ($match ? FLECHAZO.color : theme.colors.borderStrong)};
`;

const SlotName = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 16px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $match }) => ($match ? FLECHAZO.color : theme.colors.text.primary)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MatchHeart = styled.span`
  display: flex;
  flex-shrink: 0;
  color: ${FLECHAZO.kicker};
`;

const SlotAction = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.muted};

  &:hover {
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const EmptySlot = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
  height: 54px;
  background: transparent;
  text-align: left;
  color: ${({ theme }) => theme.colors.text.faint};
  font-size: 15px;
`;

const ListKicker = styled(Kicker)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Note = styled.p`
  margin: ${({ theme }) => theme.spacing(4.5)} 2px 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const SheetText = styled.p`
  margin: ${({ theme }) => theme.spacing(1.5)} 0 ${({ theme }) => theme.spacing(3.5)};
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const AtRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};
`;

const At = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

export default function FlechazoList() {
    const navigate = useNavigate();
    const {
        flechazos,
        matches,
        loadFlechazos,
        addFlechazo,
        removeFlechazo,
        loading,
        isVerified,
        instagramUsername,
        matchedByCount,
    } = useFlechazo();
    const { eventId } = useParams();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [newName, setNewName] = useState('');
    const [loadingFlechazos, setLoadingFlechazos] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        setLoadingFlechazos(true);
        loadFlechazos(eventId).finally(() => setLoadingFlechazos(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleAddClick = () => {
        if (!isVerified) {
            navigate(`/eventos/${eventId}/instagram-verification`);
            return;
        }
        if (flechazos.length >= 5) return;
        setNewName('');
        setSheetOpen(true);
    };

    const handleConfirmAdd = () => {
        if (newName.trim()) {
            addFlechazo(newName, eventId);
            setSheetOpen(false);
        }
    };

    if (loading || loadingFlechazos) return <LoadingScreen />;

    const slots = Array(5)
        .fill(null)
        .map((_, i) => flechazos?.[i] || null);

    return (
        <Screen>
            <PageHeader
                kicker="Flechazo"
                kickerColor={FLECHAZO.kicker}
                status={isVerified ? `@${instagramUsername} · verificado` : 'Sin verificar'}
                onBack={() => navigate(-1)}
            />
            <Content>
                {!isVerified && (
                    <div style={{ marginBottom: 22 }}>
                        <Button
                            variant="secondary"
                            size="lg"
                            fullWidth
                            onClick={() => navigate(`/eventos/${eventId}/instagram-verification`)}
                        >
                            Verificar Instagram
                        </Button>
                    </div>
                )}

                {isVerified && (
                    <AdmirersCard
                        onClick={() =>
                            matchedByCount > 0 &&
                            navigate(`/eventos/${eventId}/flechazo/admiradores`)
                        }
                    >
                        <Halo aria-hidden="true" />
                        <AdmirersTexts>
                            <AdmirersLabel>Te tienen en su lista</AdmirersLabel>
                            <AdmirersCount>{matchedByCount}</AdmirersCount>
                        </AdmirersTexts>
                        {matchedByCount > 0 && <AdmirersCta>Ver pistas →</AdmirersCta>}
                    </AdmirersCard>
                )}

                <ListKicker>Tus 5 flechazos</ListKicker>

                <Slots>
                    {slots.map((flechazo, index) => {
                        const isMatch = flechazo && matches.includes(flechazo);
                        return (
                            <Slot key={index} $match={isMatch}>
                                {flechazo ? (
                                    <>
                                        <SlotName $match={isMatch}>@{flechazo}</SlotName>
                                        {isMatch && (
                                            <MatchHeart
                                                aria-label="Flechazo correspondido"
                                                title="Correspondido"
                                            >
                                                <Heart size={18} fill="currentColor" />
                                            </MatchHeart>
                                        )}
                                        <SlotAction
                                            onClick={() => removeFlechazo(index, eventId)}
                                            aria-label={`Quitar @${flechazo}`}
                                        >
                                            <X size={17} />
                                        </SlotAction>
                                    </>
                                ) : (
                                    <EmptySlot onClick={handleAddClick}>
                                        <Plus size={18} />
                                        Añadir flechazo
                                    </EmptySlot>
                                )}
                            </Slot>
                        );
                    })}
                </Slots>

                <Note>Nadie ve tu lista. Solo se avisa cuando el flechazo es mutuo.</Note>
            </Content>

            <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
                <SheetTitle>Nuevo flechazo</SheetTitle>
                <SheetText>Su usuario de Instagram. Nadie ve tu lista.</SheetText>
                <AtRow>
                    <At>@</At>
                    <Input
                        placeholder="usuario"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value.replace(/\s/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
                    />
                </AtRow>
                <Button
                    size="lg"
                    color={FLECHAZO.color}
                    fullWidth
                    onClick={handleConfirmAdd}
                    disabled={!newName.trim()}
                >
                    Añadir
                </Button>
            </BottomSheet>
        </Screen>
    );
}
