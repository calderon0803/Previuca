import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoPersonCircle, IoLogOut } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { useEvent } from '../contexts/EventContext';
import { deleteInstagramVerification } from '../services/instagramService';
import { supabase } from '../config/supabase';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Container = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    padding-bottom: ${({ theme }) => theme.spacing(10)};
`;

const Content = styled.div`
    padding: ${({ theme }) => theme.spacing(5)};
    max-width: 560px;
    margin: 0 auto;
`;

const EmptyState = styled.div`
    text-align: center;
    padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(5)};
`;

const EmptyTitle = styled.h2`
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const EmptyText = styled.p`
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const LoadingText = styled.div`
    text-align: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    padding: ${({ theme }) => theme.spacing(9)} ${({ theme }) => theme.spacing(5)};
`;

const Section = styled.div`
    margin-bottom: ${({ theme }) => theme.spacing(7)};
`;

const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    text-transform: uppercase;
    letter-spacing: 0.08em;
`;

const SettingItem = styled.div`
    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.md};
    padding: ${({ theme }) => theme.spacing(5)};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing(3)};
    cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
    transition: background ${({ theme }) => theme.transitions.fast},
        border-color ${({ theme }) => theme.transitions.fast};

    &:hover {
        border-color: ${({ theme, $interactive }) => ($interactive ? theme.colors.borderStrong : theme.colors.border)};
        background: ${({ theme, $interactive }) => ($interactive ? theme.colors.surfaceHover : theme.colors.surface)};
    }
`;

const SettingInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const SettingLabel = styled.div`
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    margin-bottom: 4px;
`;

const SettingValue = styled.div`
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Settings = () => {
    const navigate = useNavigate();
    const {
        user,
        logout,
        isVerified,
        instagramUsername,
        verificationCode,
        refreshInstagramVerification,
        firstName,
        lastName,
        birthdate,
        saveProfile,
        loading: contextLoading
    } = useFlechazo();
    const { events, redeemCode } = useEvent();
    const [eventCode, setEventCode] = useState('');
    const [eventStatus, setEventStatus] = useState('');
    const [redeeming, setRedeeming] = useState(false);
    const [firstNameInput, setFirstNameInput] = useState(firstName);
    const [lastNameInput, setLastNameInput] = useState(lastName);
    const [birthdateInput, setBirthdateInput] = useState(birthdate);
    const [profileStatus, setProfileStatus] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        setFirstNameInput(firstName);
        setLastNameInput(lastName);
        setBirthdateInput(birthdate);
    }, [firstName, lastName, birthdate]);

    // Construir objeto de datos de Instagram desde el contexto
    const instagramData = user && instagramUsername ? {
        instagram_username: instagramUsername,
        is_verified: isVerified,
        verification_code: verificationCode
    } : null;

    const handleBack = () => {
        navigate('/');
    };

    // Si está cargando, mostrar pantalla de carga
    if (contextLoading) {
        return (
            <Container>
                <PageHeader title="Ajustes" onBack={handleBack} />
                <Content>
                    <LoadingText>Cargando...</LoadingText>
                </Content>
            </Container>
        );
    }

    // Si no hay usuario, mostrar mensaje para iniciar sesión
    if (!user) {
        return (
            <Container>
                <PageHeader title="Ajustes" onBack={handleBack} />
                <Content>
                    <EmptyState>
                        <IoPersonCircle size={72} color="#5C616D" style={{ marginBottom: '20px' }} />
                        <EmptyTitle>No has iniciado sesión</EmptyTitle>
                        <EmptyText>
                            Inicia sesión para acceder a la configuración de tu cuenta
                        </EmptyText>
                        <Button onClick={() => navigate('/flechazo')}>
                            Iniciar sesión
                        </Button>
                    </EmptyState>
                </Content>
            </Container>
        );
    }

    const handleChangePassword = async () => {
        const email = user?.email;
        if (!email) {
            alert('No se pudo obtener el email del usuario');
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });

            if (error) throw error;
            alert('Se ha enviado un email para restablecer tu contraseña');
        } catch (error) {
            console.error('Error sending reset email:', error);
            alert('Error al enviar el email: ' + error.message);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setProfileStatus('');

        const result = await saveProfile(firstNameInput, lastNameInput, birthdateInput);

        setSavingProfile(false);
        setProfileStatus(result.success ? 'Guardado' : (result.error || 'Error al guardar'));
    };

    const handleRedeemEventCode = async () => {
        if (!eventCode.trim()) return;

        setRedeeming(true);
        setEventStatus('');

        const result = await redeemCode(eventCode);

        setRedeeming(false);
        if (result.success) {
            setEventStatus(`¡Apuntado a ${result.evento.name}!`);
            setEventCode('');
        } else {
            setEventStatus(result.error || 'Código no válido');
        }
    };

    const handleRemoveInstagram = async () => {
        if (!window.confirm('¿Estás seguro de que quieres desvincular tu cuenta de Instagram?')) {
            return;
        }

        try {
            const result = await deleteInstagramVerification(user.id);
            if (result.success) {
                alert('Instagram desvinculado correctamente');
                await refreshInstagramVerification();
            } else {
                alert('Error al desvincular Instagram');
            }
        } catch (error) {
            console.error('Error removing instagram:', error);
            alert('Error al desvincular Instagram');
        }
    };

    const handleDeleteAccount = async () => {
        const confirmation = window.prompt(
            'Esta acción no se puede deshacer. Para confirmar, escribe "ELIMINAR":'
        );

        if (confirmation !== 'ELIMINAR') {
            return;
        }

        try {
            // Eliminar datos del usuario
            const { error: flechazoError } = await supabase
                .from('users_flechazos')
                .delete()
                .eq('user_id', user.id);

            if (flechazoError) throw flechazoError;

            // Eliminar verificación de Instagram
            await deleteInstagramVerification(user.id);

            alert('Cuenta eliminada. Serás redirigido al inicio.');
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Error al eliminar la cuenta: ' + error.message);
        }
    };

    return (
        <Container>
            <PageHeader title="Ajustes" onBack={handleBack} />

            <Content>
                <Section>
                    <SectionTitle>Cuenta</SectionTitle>

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Email</SettingLabel>
                            <SettingValue>{user?.email || 'No disponible'}</SettingValue>
                        </SettingInfo>
                    </SettingItem>

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Contraseña</SettingLabel>
                            <SettingValue>••••••••</SettingValue>
                        </SettingInfo>
                        <Button variant="secondary" onClick={handleChangePassword}>Cambiar</Button>
                    </SettingItem>
                </Section>

                <Section>
                    <SectionTitle>Perfil</SectionTitle>

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Nombre</SettingLabel>
                            <Input
                                placeholder="Nombre"
                                value={firstNameInput}
                                onChange={(e) => setFirstNameInput(e.target.value)}
                                disabled={savingProfile}
                                style={{ marginTop: '8px' }}
                            />
                        </SettingInfo>
                    </SettingItem>

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Apellido</SettingLabel>
                            <Input
                                placeholder="Apellido"
                                value={lastNameInput}
                                onChange={(e) => setLastNameInput(e.target.value)}
                                disabled={savingProfile}
                                style={{ marginTop: '8px' }}
                            />
                        </SettingInfo>
                    </SettingItem>

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Fecha de nacimiento</SettingLabel>
                            <Input
                                type="date"
                                value={birthdateInput}
                                onChange={(e) => setBirthdateInput(e.target.value)}
                                disabled={savingProfile}
                                style={{ marginTop: '8px' }}
                            />
                        </SettingInfo>
                    </SettingItem>

                    <Button
                        variant="secondary"
                        fullWidth
                        onClick={handleSaveProfile}
                        disabled={!firstNameInput.trim() || !lastNameInput.trim() || !birthdateInput || savingProfile}
                    >
                        {savingProfile ? 'Guardando...' : 'Guardar'}
                    </Button>
                    {profileStatus && <SettingValue style={{ marginTop: '8px' }}>{profileStatus}</SettingValue>}
                </Section>

                <Section>
                    <SectionTitle>Eventos</SectionTitle>

                    {events.map((evento) => (
                        <SettingItem key={evento.id}>
                            <SettingInfo>
                                <SettingLabel>{evento.name}</SettingLabel>
                                {evento.description && <SettingValue>{evento.description}</SettingValue>}
                            </SettingInfo>
                        </SettingItem>
                    ))}

                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Apuntarse a otro evento</SettingLabel>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <Input
                                    placeholder="CÓDIGO"
                                    value={eventCode}
                                    onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                                    disabled={redeeming}
                                />
                                <Button
                                    variant="secondary"
                                    onClick={handleRedeemEventCode}
                                    disabled={!eventCode.trim() || redeeming}
                                >
                                    {redeeming ? '...' : 'Unirme'}
                                </Button>
                            </div>
                            {eventStatus && <SettingValue style={{ marginTop: '8px' }}>{eventStatus}</SettingValue>}
                        </SettingInfo>
                    </SettingItem>
                </Section>

                <Section>
                    <SectionTitle>Instagram</SectionTitle>

                    {contextLoading ? (
                        <SettingItem>
                            <SettingValue>Cargando...</SettingValue>
                        </SettingItem>
                    ) : instagramData?.is_verified ? (
                        <SettingItem>
                            <SettingInfo>
                                <SettingLabel>Usuario verificado</SettingLabel>
                                <SettingValue>@{instagramData.instagram_username}</SettingValue>
                            </SettingInfo>
                            <Button variant="danger" onClick={handleRemoveInstagram}>
                                Desvincular
                            </Button>
                        </SettingItem>
                    ) : (
                        <SettingItem>
                            <SettingInfo>
                                <SettingLabel>Instagram</SettingLabel>
                                <SettingValue>No vinculado</SettingValue>
                            </SettingInfo>
                            <Button variant="secondary" onClick={() => navigate('/instagram-verification')}>
                                Verificar
                            </Button>
                        </SettingItem>
                    )}
                </Section>

                <Section>
                    <SectionTitle>Sesión</SectionTitle>

                    <SettingItem $interactive onClick={logout}>
                        <SettingInfo>
                            <SettingLabel>Cerrar sesión</SettingLabel>
                        </SettingInfo>
                        <IoLogOut size={20} color="#D2D4D9" />
                    </SettingItem>
                </Section>

                <Section>
                    <SectionTitle>Zona de riesgo</SectionTitle>
                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Eliminar cuenta</SettingLabel>
                            <SettingValue>Esta acción no se puede deshacer</SettingValue>
                        </SettingInfo>
                        <Button variant="danger" onClick={handleDeleteAccount}>
                            Eliminar
                        </Button>
                    </SettingItem>
                </Section>
            </Content>
        </Container>
    );
};

export default Settings;
