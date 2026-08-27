import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CircleUser, LogOut } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { useEvent } from '../contexts/EventContext';
import { getEventStatus } from '../utils/eventStatus';
import { deleteInstagramVerification } from '../services/instagramService';
import { submitFeedback } from '../services/feedbackService';
import { supabase } from '../config/supabase';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import LoadingScreen from '../components/ui/LoadingScreen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Kicker from '../components/ui/Kicker';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import FeedbackModal from '../components/FeedbackModal';
import { version as appVersion } from '../../package.json';

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3.5)};
  margin-bottom: ${({ theme }) => theme.spacing(6.5)};
`;

const Avatar = styled.span`
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accentSurface};
  color: ${({ theme }) => theme.colors.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProfileName = styled.span`
  display: block;
  font-size: 20px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const ProfileMeta = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const GroupKicker = styled(Kicker)`
  margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.text.muted)};
`;

const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
`;

const RowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  text-align: left;
  color: ${({ theme }) => theme.colors.text.muted};
  transition: box-shadow ${({ theme }) => theme.transitions.fast};

  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  }
`;

const RowStack = styled.div`
  padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
`;

const RowLabel = styled.span`
  display: block;
  font-size: 14.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const RowValue = styled.span`
  display: block;
  margin-top: 3px;
  font-size: 13px;
  color: ${({ theme, $disabled }) =>
        $disabled ? theme.colors.text.disabled : theme.colors.text.muted};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RowTexts = styled.span`
  min-width: 0;
`;

const SmallAction = styled.button`
  height: 38px;
  flex-shrink: 0;
  padding: 0 ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  border: 1px solid
    ${({ theme, $danger }) => ($danger ? theme.colors.dangerBorder : theme.colors.borderStrong)};
  color: ${({ theme, $danger }) => ($danger ? theme.colors.danger : theme.colors.text.primary)};
  font-size: 13.5px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme, $danger }) => ($danger ? theme.colors.dangerTint : 'transparent')};
    border-color: ${({ theme, $danger }) =>
        $danger ? theme.colors.dangerBorder : theme.colors.borderHover};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const JoinRow = styled.div`
  display: flex;
  gap: 9px;
  margin-top: ${({ theme }) => theme.spacing(2.5)};
`;

const CodeInput = styled(Input)`
  height: 44px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.1em;
`;

const StatusText = styled.p`
  margin: ${({ theme }) => theme.spacing(2.5)} 0 0;
  font-size: 13px;
  color: ${({ theme, $ok }) => ($ok ? theme.colors.success : theme.colors.error)};
`;

const Version = styled.p`
  margin: 0;
  text-align: center;
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacing(10)} 0;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 26px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const EmptyText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(6)};
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const NoticeText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Settings = () => {
    const navigate = useNavigate();
    const {
        user,
        logout,
        isVerified,
        instagramUsername,
        refreshInstagramVerification,
        fullName,
        age,
        gender,
        loading: contextLoading,
    } = useFlechazo();
    const { events, redeemCode, leaveEvent } = useEvent();
    const [eventCode, setEventCode] = useState('');
    const [eventStatus, setEventStatus] = useState(null); // { ok, text }
    const [redeeming, setRedeeming] = useState(false);
    const [leavingEventId, setLeavingEventId] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [sendingFeedback, setSendingFeedback] = useState(false);
    const [feedbackError, setFeedbackError] = useState('');
    const [confirm, setConfirm] = useState(null);
    const [notice, setNotice] = useState(null);

    if (contextLoading) return <LoadingScreen />;

    if (!user) {
        return (
            <Screen>
                <PageHeader title="Ajustes" onBack={() => navigate(-1)} />
                <Content>
                    <Empty>
                        <EmptyTitle>No has iniciado sesión</EmptyTitle>
                        <EmptyText>
                            Inicia sesión para acceder a la configuración de tu cuenta.
                        </EmptyText>
                        <Button
                            size="lg"
                            fullWidth
                            onClick={() => navigate('/flechazo', { state: { from: '/ajustes' } })}
                        >
                            Iniciar sesión
                        </Button>
                    </Empty>
                </Content>
            </Screen>
        );
    }

    const handleChangePassword = async () => {
        const email = user?.email;
        if (!email) {
            setNotice('No se pudo obtener el email de tu cuenta.');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password',
            });
            if (error) throw error;
            setNotice('Te hemos enviado un email para restablecer la contraseña.');
        } catch (error) {
            console.error('Error sending reset email:', error);
            setNotice(`No se pudo enviar el email: ${error.message}`);
        }
    };

    const askLeaveEvent = (evento) =>
        setConfirm({
            title: `¿Abandonar «${evento.name}»?`,
            text: 'Pierdes tu peña, tus flechazos y los sellos coleccionados en este evento. No se puede deshacer.',
            cta: 'Abandonar',
            tone: 'danger',
            run: async () => {
                setLeavingEventId(evento.id);
                const result = await leaveEvent(evento.id);
                setLeavingEventId(null);
                if (!result.success) {
                    setNotice(result.error || 'No se pudo abandonar el evento');
                }
            },
        });

    const handleRedeemEventCode = async () => {
        if (!eventCode.trim()) return;

        setRedeeming(true);
        setEventStatus(null);

        const result = await redeemCode(eventCode);

        setRedeeming(false);
        if (result.success) {
            setEventStatus({ ok: true, text: `¡Apuntado a ${result.evento.name}!` });
            setEventCode('');
        } else {
            setEventStatus({ ok: false, text: result.error || 'Código no válido' });
        }
    };

    const askRemoveInstagram = () =>
        setConfirm({
            title: '¿Desvincular Instagram?',
            text: 'Dejas de estar verificado y tus flechazos actuales dejan de contar hasta que vuelvas a verificarte.',
            cta: 'Desvincular',
            tone: 'danger',
            run: async () => {
                try {
                    const result = await deleteInstagramVerification(user.id);
                    if (result.success) {
                        await refreshInstagramVerification();
                        setNotice('Instagram desvinculado.');
                    } else {
                        setNotice('No se pudo desvincular Instagram.');
                    }
                } catch (error) {
                    console.error('Error removing instagram:', error);
                    setNotice('No se pudo desvincular Instagram.');
                }
            },
        });

    const handleSendFeedback = async (type, message) => {
        setSendingFeedback(true);
        setFeedbackError('');
        const result = await submitFeedback({ userId: user.id, type, message });
        setSendingFeedback(false);
        if (!result.success) {
            setFeedbackError(result.error || 'No se pudo enviar el mensaje');
        }
        return result;
    };

    const askDeleteAccount = () =>
        setConfirm({
            title: '¿Eliminar tu cuenta?',
            text: 'Se borran tu perfil, tus peñas, tus sellos y tus flechazos. No se puede deshacer.',
            cta: 'Eliminar cuenta',
            tone: 'danger',
            run: async () => {
                try {
                    // Eliminar de todas las tablas asociadas al usuario
                    await Promise.all([
                        supabase.from('users_flechazos').delete().eq('user_id', user.id),
                        supabase.from('pena_members').delete().eq('user_id', user.id),
                        supabase.from('pena_stamp_unlocks').delete().eq('user_id', user.id),
                        supabase.from('user_eventos').delete().eq('user_id', user.id),
                        deleteInstagramVerification(user.id),
                        supabase.from('profiles').delete().eq('user_id', user.id),
                    ]);
                    await logout();
                    navigate('/');
                } catch (error) {
                    console.error('Error deleting account:', error);
                    setNotice(`No se pudo eliminar la cuenta: ${error.message}`);
                }
            },
        });

    const askLogout = () =>
        setConfirm({
            title: '¿Cerrar sesión?',
            text: 'Tendrás que volver a entrar para participar en los eventos.',
            cta: 'Cerrar sesión',
            run: logout,
        });

    return (
        <Screen>
            <PageHeader title="Ajustes" onBack={() => navigate(-1)} />

            <Content>
                <Profile>
                    <Avatar aria-hidden="true">
                        <CircleUser size={28} />
                    </Avatar>
                    <div>
                        <ProfileName>{fullName || 'Sin nombre'}</ProfileName>
                        {(age !== null || gender) && (
                            <ProfileMeta>
                                {[age !== null ? `${age} años` : null, gender || null]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </ProfileMeta>
                        )}
                    </div>
                </Profile>

                <GroupKicker>Cuenta</GroupKicker>
                <Group>
                    <Row>
                        <RowTexts>
                            <RowLabel>Email</RowLabel>
                            <RowValue>{user?.email || 'No disponible'}</RowValue>
                        </RowTexts>
                    </Row>
                    <Row>
                        <RowTexts>
                            <RowLabel>Contraseña</RowLabel>
                            <RowValue $disabled>••••••••</RowValue>
                        </RowTexts>
                        <SmallAction onClick={handleChangePassword}>Cambiar</SmallAction>
                    </Row>
                    <Row>
                        <RowTexts>
                            <RowLabel>Instagram</RowLabel>
                            <RowValue>
                                {instagramUsername
                                    ? `@${instagramUsername}${isVerified ? ' · verificado' : ' · sin verificar'}`
                                    : 'No vinculado'}
                            </RowValue>
                        </RowTexts>
                        {instagramUsername && isVerified ? (
                            <SmallAction $danger onClick={askRemoveInstagram}>
                                Desvincular
                            </SmallAction>
                        ) : (
                            <SmallAction onClick={() => navigate('/instagram-verification')}>
                                Verificar
                            </SmallAction>
                        )}
                    </Row>
                </Group>

                <GroupKicker>Eventos</GroupKicker>
                <Group>
                    {events.map((evento) => (
                        <Row key={evento.id}>
                            <RowTexts>
                                <RowLabel>{evento.name}</RowLabel>
                                <RowValue>
                                    {getEventStatus(evento) === 'archivado' ? 'Archivado' : 'Activo'}
                                    {evento.description ? ` · ${evento.description}` : ''}
                                </RowValue>
                            </RowTexts>
                            <SmallAction
                                $danger
                                onClick={() => askLeaveEvent(evento)}
                                disabled={leavingEventId === evento.id}
                            >
                                {leavingEventId === evento.id ? 'Abandonando...' : 'Abandonar'}
                            </SmallAction>
                        </Row>
                    ))}

                    <RowStack>
                        <RowLabel>Apuntarse a otro evento</RowLabel>
                        <JoinRow>
                            <CodeInput
                                placeholder="CÓDIGO"
                                value={eventCode}
                                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                disabled={redeeming}
                            />
                            <SmallAction
                                style={{ height: 44, borderColor: '#9184d9' }}
                                onClick={handleRedeemEventCode}
                                disabled={!eventCode.trim() || redeeming}
                            >
                                {redeeming ? '...' : 'Unirme'}
                            </SmallAction>
                        </JoinRow>
                        {eventStatus && (
                            <StatusText $ok={eventStatus.ok}>{eventStatus.text}</StatusText>
                        )}
                    </RowStack>
                </Group>

                <GroupKicker>Sesión y ayuda</GroupKicker>
                <Group>
                    <RowButton
                        onClick={() => {
                            setFeedbackError('');
                            setShowFeedback(true);
                        }}
                    >
                        <RowLabel>Reportar un problema o sugerencia</RowLabel>
                    </RowButton>
                    <RowButton onClick={askLogout}>
                        <RowLabel>Cerrar sesión</RowLabel>
                        <LogOut size={18} />
                    </RowButton>
                </Group>

                <GroupKicker $danger>Zona de riesgo</GroupKicker>
                <Group>
                    <Row>
                        <RowTexts>
                            <RowLabel>Eliminar cuenta</RowLabel>
                            <RowValue>No se puede deshacer</RowValue>
                        </RowTexts>
                        <SmallAction $danger onClick={askDeleteAccount}>
                            Eliminar
                        </SmallAction>
                    </Row>
                </Group>

                <Version>Previuca v{appVersion}</Version>
            </Content>

            <FeedbackModal
                visible={showFeedback}
                onClose={() => setShowFeedback(false)}
                onSubmit={handleSendFeedback}
                submitting={sendingFeedback}
                error={feedbackError}
            />

            <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />

            <BottomSheet visible={!!notice} onClose={() => setNotice(null)}>
                <SheetTitle>Aviso</SheetTitle>
                <div style={{ height: 12 }} />
                <NoticeText>{notice}</NoticeText>
                <div style={{ height: 20 }} />
                <Button size="lg" fullWidth onClick={() => setNotice(null)}>
                    Entendido
                </Button>
            </BottomSheet>
        </Screen>
    );
};

export default Settings;
