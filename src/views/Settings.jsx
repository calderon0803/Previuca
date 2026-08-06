import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoPersonCircle, IoLogOut } from 'react-icons/io5';
import { useCrush } from '../contexts/CrushContext';
import { useFiesta } from '../contexts/FiestaContext';
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
        loading: contextLoading
    } = useCrush();
    const { hasFiesta, fiestaName, redeemCode } = useFiesta();
    const [fiestaCode, setFiestaCode] = useState('');
    const [fiestaStatus, setFiestaStatus] = useState('');
    const [redeeming, setRedeeming] = useState(false);

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
                        <Button onClick={() => navigate('/crush')}>
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

    const handleRedeemFiestaCode = async () => {
        if (!fiestaCode.trim()) return;

        setRedeeming(true);
        setFiestaStatus('');

        const result = await redeemCode(fiestaCode);

        setRedeeming(false);
        if (result.success) {
            setFiestaStatus(`¡Apuntado a ${result.fiesta.name}!`);
            setFiestaCode('');
        } else {
            setFiestaStatus(result.error || 'Código no válido');
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
            const { error: crushError } = await supabase
                .from('users_crushes')
                .delete()
                .eq('user_id', user.id);

            if (crushError) throw crushError;

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
                    <SectionTitle>Fiesta</SectionTitle>

                    {hasFiesta ? (
                        <SettingItem>
                            <SettingInfo>
                                <SettingLabel>Fiesta activa</SettingLabel>
                                <SettingValue>{fiestaName}</SettingValue>
                            </SettingInfo>
                        </SettingItem>
                    ) : (
                        <SettingItem>
                            <SettingInfo>
                                <SettingLabel>Código de fiesta</SettingLabel>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <Input
                                        placeholder="CÓDIGO"
                                        value={fiestaCode}
                                        onChange={(e) => setFiestaCode(e.target.value.toUpperCase())}
                                        disabled={redeeming}
                                    />
                                    <Button
                                        variant="secondary"
                                        onClick={handleRedeemFiestaCode}
                                        disabled={!fiestaCode.trim() || redeeming}
                                    >
                                        {redeeming ? '...' : 'Unirme'}
                                    </Button>
                                </div>
                                {fiestaStatus && <SettingValue style={{ marginTop: '8px' }}>{fiestaStatus}</SettingValue>}
                            </SettingInfo>
                        </SettingItem>
                    )}
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
