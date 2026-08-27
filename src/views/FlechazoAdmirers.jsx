import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent, getPenaAffiliationsByUserIds, getMyPena } from '../services/penasService';
import { getUnlockedStamps } from '../services/stampService';
import { getProfilesByUserIds, calculateAge } from '../services/profileService';
import { activityColors } from '../styles/theme';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import LoadingScreen from '../components/ui/LoadingScreen';

const FLECHAZO = activityColors.flechazo;

// El evento necesita este mínimo de peñas para que la revelación progresiva
// tenga sentido (con pocas peñas, los sellos disponibles no darían margen).
const MIN_PENAS_REQUIRED = 20;

// Umbrales como % de los sellos disponibles (sin contar el de la propia
// peña, que se obtiene gratis al unirse). Redondeo siempre hacia arriba.
const GENDER_UNLOCK_RATIO = 0.01;
const AGE_UNLOCK_RATIO = 0.05;
const PENA_COLOR_UNLOCK_RATIO = 0.10;
const IDENTITY_UNLOCK_RATIO = 0.50;

const StepsCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const StepsLede = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 12.5px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const Mark = styled.span`
  width: 16px;
  flex-shrink: 0;
  text-align: center;
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $done }) => ($done ? theme.colors.success : theme.colors.text.faint)};
`;

const StepLabel = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 13.5px;
  color: ${({ theme, $done }) => ($done ? theme.colors.success : theme.colors.text.muted)};
`;

const StepReq = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
`;

const Card = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
`;

const CardTitle = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Stats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(5.5)};
  flex-wrap: wrap;
`;

const StatLabel = styled.span`
  display: block;
  font-size: 10.5px;
  color: ${({ theme }) => theme.colors.text.faint};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const StatValue = styled.span`
  display: block;
  margin-top: 3px;
  font-size: 14px;
  color: ${({ theme, $locked }) => ($locked ? theme.colors.text.disabled : theme.colors.text.primary)};
`;

const PenaValue = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 5px;
`;

const Dot = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ theme, $color }) => $color || theme.colors.borderStrong};
`;

const PenaName = styled.span`
  font-size: 14px;
  color: ${({ theme, $locked }) => ($locked ? theme.colors.text.disabled : theme.colors.text.primary)};
`;

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.faint};
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

        return () => {
            active = false;
        };
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

    if (loading) return <LoadingScreen />;

    const steps = [
        { label: 'Género', done: genderUnlocked, req: genderRequired },
        { label: 'Edad', done: ageUnlocked, req: ageRequired },
        { label: 'Color de su peña', done: penaColorUnlocked, req: penaColorRequired },
        { label: 'Nombre de su peña', done: identityRevealed, req: identityRequired },
    ];

    return (
        <Screen>
            <PageHeader
                kicker="Quién te tiene en su lista"
                kickerColor={FLECHAZO.kicker}
                status={`${effectiveUnlocked} de ${effectiveTotal} sellos ajenos`}
                onBack={() => navigate(-1)}
            />
            <Content>
                {!hasEnoughPenas ? (
                    <Empty>
                        Esto se abre cuando el evento tiene al menos {MIN_PENAS_REQUIRED} peñas
                        (ahora mismo hay {totalPenas}).
                    </Empty>
                ) : (
                    <>
                        <StepsCard>
                            <StepsLede>
                                Cada sello que coleccionas revela un dato más de cada admirador.
                            </StepsLede>
                            <Steps>
                                {steps.map((step) => (
                                    <Step key={step.label}>
                                        <Mark $done={step.done}>{step.done ? '✓' : '·'}</Mark>
                                        <StepLabel $done={step.done}>{step.label}</StepLabel>
                                        <StepReq>
                                            {step.req} {step.req === 1 ? 'sello' : 'sellos'}
                                        </StepReq>
                                    </Step>
                                ))}
                            </Steps>
                        </StepsCard>

                        {matchedByUserIds.length === 0 ? (
                            <Empty>Todavía nadie te ha añadido a su lista.</Empty>
                        ) : (
                            <List>
                                {matchedByUserIds.map((uid, index) => {
                                    const profile = profiles.find((p) => p.user_id === uid);
                                    const affiliation = affiliations[uid];
                                    const age = calculateAge(profile?.birthdate);

                                    return (
                                        <Card key={uid}>
                                            <CardTitle>Admirador/a #{index + 1}</CardTitle>
                                            <Stats>
                                                <span>
                                                    <StatLabel>Género</StatLabel>
                                                    <StatValue $locked={!genderUnlocked}>
                                                        {genderUnlocked
                                                            ? profile?.gender || 'Sin datos'
                                                            : 'bloqueado'}
                                                    </StatValue>
                                                </span>
                                                <span>
                                                    <StatLabel>Edad</StatLabel>
                                                    <StatValue $locked={!ageUnlocked}>
                                                        {ageUnlocked
                                                            ? age !== null
                                                                ? `${age} años`
                                                                : 'Sin datos'
                                                            : 'bloqueado'}
                                                    </StatValue>
                                                </span>
                                                <span>
                                                    <StatLabel>Peña</StatLabel>
                                                    <PenaValue>
                                                        <Dot
                                                            $color={
                                                                penaColorUnlocked
                                                                    ? affiliation?.color
                                                                    : undefined
                                                            }
                                                        />
                                                        <PenaName $locked={!identityRevealed}>
                                                            {!penaColorUnlocked
                                                                ? 'bloqueado'
                                                                : !affiliation
                                                                    ? 'Sin peña'
                                                                    : identityRevealed
                                                                        ? affiliation.name
                                                                        : 'bloqueado'}
                                                        </PenaName>
                                                    </PenaValue>
                                                </span>
                                            </Stats>
                                        </Card>
                                    );
                                })}
                            </List>
                        )}
                    </>
                )}
            </Content>
        </Screen>
    );
}
