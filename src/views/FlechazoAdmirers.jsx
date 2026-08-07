import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoLockClosed, IoPersonCircleOutline, IoCheckmarkCircle } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent, getPenaAffiliationsByUserIds } from '../services/penasService';
import { getUnlockedStamps } from '../services/stampService';
import { getProfilesByUserIds, calculateAge } from '../services/profileService';
import PageHeader from '../components/ui/PageHeader';

const AGE_UNLOCK_STAMPS = 5;
const PENA_COLOR_UNLOCK_STAMPS = 10;
const IDENTITY_REVEAL_RATIO = 0.75;

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
        ]).then(([penasResult, unlockedResult, profilesResult, affiliationsResult]) => {
            if (!active) return;
            setTotalPenas(penasResult.penas.length);
            setUnlockedCount(unlockedResult.penaIds.length);
            setProfiles(profilesResult.profiles);
            setAffiliations(affiliationsResult.affiliations);
            setLoading(false);
        });

        return () => { active = false; };
    }, [eventId, user?.id, matchedByUserIds]);

    const ageUnlocked = unlockedCount >= AGE_UNLOCK_STAMPS;
    const penaColorUnlocked = unlockedCount >= PENA_COLOR_UNLOCK_STAMPS;
    const collectedRatio = totalPenas > 0 ? unlockedCount / totalPenas : 0;
    const identityRevealed = collectedRatio > IDENTITY_REVEAL_RATIO;

    return (
        <Container>
            <PageHeader title="Quién te tiene en su lista" onBack={() => navigate(-1)} />
            <Content>
                <ProgressCard>
                    <ProgressText>
                        Sellos coleccionados: {unlockedCount} de {totalPenas}
                    </ProgressText>
                    <ProgressText $done={ageUnlocked}>
                        <ProgressIcon done={ageUnlocked} />
                        Edad — se desbloquea con {AGE_UNLOCK_STAMPS} sellos
                    </ProgressText>
                    <ProgressText $done={penaColorUnlocked}>
                        <ProgressIcon done={penaColorUnlocked} />
                        Color de su peña — se desbloquea con {PENA_COLOR_UNLOCK_STAMPS} sellos
                    </ProgressText>
                    <ProgressText $done={identityRevealed}>
                        <ProgressIcon done={identityRevealed} />
                        Nombre de su peña — se desbloquea con más del 75% de los sellos
                    </ProgressText>
                </ProgressCard>

                {loading ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : matchedByUserIds.length === 0 ? (
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
                                            <StatLabel>Edad</StatLabel>
                                            {ageUnlocked ? (
                                                <StatValue>{age !== null ? `${age} años` : 'Sin datos'}</StatValue>
                                            ) : (
                                                <LockedValue>
                                                    <IoLockClosed size={12} />
                                                    {AGE_UNLOCK_STAMPS} sellos
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
                                                    {PENA_COLOR_UNLOCK_STAMPS} sellos
                                                </LockedValue>
                                            )}
                                        </Stat>
                                    </StatsRow>
                                </Row>
                            );
                        })}
                    </List>
                )}
            </Content>
        </Container>
    );
}
