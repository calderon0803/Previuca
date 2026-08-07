import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoLockClosed, IoPersonCircleOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent, getPenaAffiliationsByUserIds, getMyPena } from '../services/penasService';
import { getUnlockedStamps } from '../services/stampService';
import { getProfilesByUserIds, calculateAge } from '../services/profileService';
import PageHeader from '../components/ui/PageHeader';

// El evento necesita este mínimo de peñas para que la revelación progresiva
// tenga sentido (con pocas peñas, los sellos disponibles no darían margen).
const MIN_PENAS_REQUIRED = 20;

// Umbrales como % de los sellos disponibles (sin contar el de la propia
// peña, que se obtiene gratis al unirse). Redondeo siempre hacia arriba.
const GENDER_UNLOCK_RATIO = 0.01;
const AGE_UNLOCK_RATIO = 0.05;
const PENA_COLOR_UNLOCK_RATIO = 0.10;
const IDENTITY_UNLOCK_RATIO = 0.50;

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

const ProgressCard = styled.div`
  background: ${({ theme }) => theme.colors.primaryMuted};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ProgressText = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme, $done }) => ($done ? theme.colors.success : theme.colors.text.primary)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressIcon = ({ done }) => (done ? <IoCheckmarkCircle size={14} /> : <IoLockClosed size={14} />);

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Row = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const RowIcon = styled.div`
  color: ${({ theme }) => theme.colors.text.disabled};
  flex-shrink: 0;
`;

const RowLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  flex-basis: 100%;
`;

const StatsRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5)};
  flex: 1;
  min-width: 0;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StatLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

const StatValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const LockedValue = styled.span`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const ColorDot = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export default function FlechazoAdmirers() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user, matchedByUserIds, loadFlechazos } = useFlechazo();
    const [totalPenas, setTotalPenas] = useState(0);
    const [unlockedCount, setUnlockedCount] = useState(0);
    const [profiles, setProfiles] = useState([]);
    const [affiliations, setAffiliations] = useState({});
    const [myPena, setMyPena] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.id || !eventId) return;
        loadFlechazos(eventId);
    }, [eventId, user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        let active = true;
        setLoading(true);

        Promise.all([
            getPenasByEvent(eventId),
            getUnlockedStamps(user.id, eventId),
            getProfilesByUserIds(matchedByUserIds),
            getPenaAffiliationsByUserIds(matchedByUserIds, eventId),
            getMyPena(user.id, eventId),
        ]).then(([penasResult, unlockedResult, profilesResult, affiliationsResult, myPenaResult]) => {
            if (!active) return;
            setTotalPenas(penasResult.penas.length);
            setUnlockedCount(unlockedResult.penaIds.length);
            setProfiles(profilesResult.profiles);
            setAffiliations(affiliationsResult.affiliations);
            setMyPena(myPenaResult.pena);
            setLoading(false);
        });

        return () => { active = false; };
    }, [eventId, user?.id, matchedByUserIds]);

    const hasEnoughPenas = totalPenas >= MIN_PENAS_REQUIRED;

    // El sello de la propia peña no cuenta para los requisitos: se resta de
    // ambos lados antes de calcular los umbrales.
    const ownStampCounted = myPena ? 1 : 0;
    const effectiveTotal = Math.max(0, totalPenas - ownStampCounted);
    const effectiveUnlocked = Math.max(0, unlockedCount - ownStampCounted);

    // Umbrales en orden ascendente de %. Si el de mayor porcentaje exigiría
    // los mismos sellos (o menos) que el anterior, se le suman 2 sellos para
    // que siga siendo más difícil de desbloquear.
    const requiredStamps = [
        Math.ceil(GENDER_UNLOCK_RATIO * effectiveTotal),
        Math.ceil(AGE_UNLOCK_RATIO * effectiveTotal),
        Math.ceil(PENA_COLOR_UNLOCK_RATIO * effectiveTotal),
        Math.ceil(IDENTITY_UNLOCK_RATIO * effectiveTotal),
    ];
    for (let i = 1; i < requiredStamps.length; i += 1) {
        if (requiredStamps[i] <= requiredStamps[i - 1]) {
            requiredStamps[i] = requiredStamps[i - 1] + 2;
        }
    }
    const [genderRequired, ageRequired, penaColorRequired, identityRequired] = requiredStamps;

    const genderUnlocked = effectiveUnlocked >= genderRequired;
    const ageUnlocked = effectiveUnlocked >= ageRequired;
    const penaColorUnlocked = effectiveUnlocked >= penaColorRequired;
    const identityRevealed = effectiveUnlocked >= identityRequired;

    return (
        <Container>
            <PageHeader title="Quién te tiene en su lista" onBack={() => navigate(-1)} />
            <Content>
                {loading ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : !hasEnoughPenas ? (
                    <EmptyText>
                        Esta función se desbloquea cuando el evento tiene al menos {MIN_PENAS_REQUIRED} peñas
                        (ahora mismo hay {totalPenas}).
                    </EmptyText>
                ) : (
                    <>
                        <ProgressCard>
                            <ProgressText>
                                Sellos coleccionados: {effectiveUnlocked} de {effectiveTotal} (sin contar el de tu propia peña)
                            </ProgressText>
                            <ProgressText $done={genderUnlocked}>
                                <ProgressIcon done={genderUnlocked} />
                                Género — se desbloquea con el {Math.round(GENDER_UNLOCK_RATIO * 100)}% de los sellos ({genderRequired})
                            </ProgressText>
                            <ProgressText $done={ageUnlocked}>
                                <ProgressIcon done={ageUnlocked} />
                                Edad — se desbloquea con el {Math.round(AGE_UNLOCK_RATIO * 100)}% de los sellos ({ageRequired})
                            </ProgressText>
                            <ProgressText $done={penaColorUnlocked}>
                                <ProgressIcon done={penaColorUnlocked} />
                                Color de su peña — se desbloquea con el {Math.round(PENA_COLOR_UNLOCK_RATIO * 100)}% de los sellos ({penaColorRequired})
                            </ProgressText>
                            <ProgressText $done={identityRevealed}>
                                <ProgressIcon done={identityRevealed} />
                                Nombre de su peña — se desbloquea con el {Math.round(IDENTITY_UNLOCK_RATIO * 100)}% de los sellos ({identityRequired})
                            </ProgressText>
                        </ProgressCard>

                        {matchedByUserIds.length === 0 ? (
                            <EmptyText>Todavía nadie te ha añadido a su lista.</EmptyText>
                        ) : (
                            <List>
                                {matchedByUserIds.map((uid, index) => {
                                    const profile = profiles.find((p) => p.user_id === uid);
                                    const affiliation = affiliations[uid];
                                    const age = calculateAge(profile?.birthdate);

                                    return (
                                        <Row key={uid}>
                                            <RowIcon>
                                                <IoPersonCircleOutline size={28} />
                                            </RowIcon>
                                            <RowLabel>Admirador/a #{index + 1}</RowLabel>
                                            <StatsRow>
                                                <Stat>
                                                    <StatLabel>Género</StatLabel>
                                                    {genderUnlocked ? (
                                                        <StatValue>{profile?.gender || 'Sin datos'}</StatValue>
                                                    ) : (
                                                        <LockedValue>
                                                            <IoLockClosed size={12} />
                                                            {Math.round(GENDER_UNLOCK_RATIO * 100)}%
                                                        </LockedValue>
                                                    )}
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Edad</StatLabel>
                                                    {ageUnlocked ? (
                                                        <StatValue>{age !== null ? `${age} años` : 'Sin datos'}</StatValue>
                                                    ) : (
                                                        <LockedValue>
                                                            <IoLockClosed size={12} />
                                                            {Math.round(AGE_UNLOCK_RATIO * 100)}%
                                                        </LockedValue>
                                                    )}
                                                </Stat>
                                                <Stat>
                                                    <StatLabel>Peña</StatLabel>
                                                    {penaColorUnlocked ? (
                                                        affiliation ? (
                                                            <StatValue>
                                                                <ColorDot $color={affiliation.color} />
                                                                {identityRevealed ? affiliation.name : null}
                                                            </StatValue>
                                                        ) : (
                                                            <StatValue>Sin peña</StatValue>
                                                        )
                                                    ) : (
                                                        <LockedValue>
                                                            <IoLockClosed size={12} />
                                                            {Math.round(PENA_COLOR_UNLOCK_RATIO * 100)}%
                                                        </LockedValue>
                                                    )}
                                                </Stat>
                                            </StatsRow>
                                        </Row>
                                    );
                                })}
                            </List>
                        )}
                    </>
                )}
            </Content>
        </Container>
    );
}
