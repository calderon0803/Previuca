import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoArrowBack, IoPersonCircle, IoTrash, IoLogOut } from 'react-icons/io5';
import { useCrush } from '../contexts/CrushContext';
import { getInstagramVerification, deleteInstagramVerification } from '../services/instagramService';
import { supabase } from '../config/supabase';

const Container = styled.div`
    min-height: 100vh;
    background: ${({ theme }) => theme.colors.background};
    padding-bottom: 80px;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: ${({ theme }) => theme.colors.background};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.h1`
    color: #fff;
    margin: 0;
    font-size: 24px;
`;

const IconButton = styled.button`
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
`;

const Content = styled.div`
    padding: 20px;
`;

const Section = styled.div`
    margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
    color: #fff;
    font-size: 18px;
    margin-bottom: 15px;
    padding-left: 10px;
`;

const SettingItem = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const SettingInfo = styled.div`
    flex: 1;
`;

const SettingLabel = styled.div`
    color: #fff;
    font-weight: 500;
    margin-bottom: 4px;
`;

const SettingValue = styled.div`
    color: #aaa;
    font-size: 14px;
`;

const Button = styled.button`
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-weight: bold;
    cursor: pointer;
    background: ${props => props.$danger ? '#ff4444' : props.theme.colors.secondary};
    color: ${props => props.$danger ? '#fff' : '#000'};
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.8;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DangerZone = styled.div`
    border: 2px solid #ff4444;
    border-radius: 10px;
    padding: 20px;
    margin-top: 20px;
`;

const DangerTitle = styled.h3`
    color: #ff4444;
    margin-top: 0;
    margin-bottom: 15px;
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
                <Header>
                    <IconButton onClick={handleBack}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Ajustes</HeaderTitle>
                    <div style={{ width: 40 }} />
                </Header>
                <Content>
                    <div style={{ textAlign: 'center', color: '#888', padding: '40px 20px' }}>
                        Cargando...
                    </div>
                </Content>
            </Container>
        );
    }
    
    // Si no hay usuario, mostrar mensaje para iniciar sesión
    if (!user) {
        return (
            <Container>
                <Header>
                    <IconButton onClick={handleBack}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Ajustes</HeaderTitle>
                    <div style={{ width: 40 }} />
                </Header>
                <Content>
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <IoPersonCircle size={80} color="#555" style={{ marginBottom: '20px' }} />
                        <h2 style={{ color: '#fff', marginBottom: '10px' }}>No has iniciado sesión</h2>
                        <p style={{ color: '#aaa', marginBottom: '30px' }}>
                            Inicia sesión para acceder a la configuración de tu cuenta
                        </p>
                        <Button onClick={() => navigate('/crush')}>
                            Iniciar Sesión
                        </Button>
                    </div>
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
            <Header>
                <IconButton onClick={handleBack}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Ajustes</HeaderTitle>
                <div style={{ width: 40 }} />
            </Header>

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
                        <Button onClick={handleChangePassword}>Cambiar</Button>
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
                            <Button $danger onClick={handleRemoveInstagram}>
                                Desvincular
                            </Button>
                        </SettingItem>
                    ) : (
                        <SettingItem>
                            <SettingInfo>
                                <SettingLabel>Instagram</SettingLabel>
                                <SettingValue>No vinculado</SettingValue>
                            </SettingInfo>
                            <Button onClick={() => navigate('/instagram-verification')}>
                                Verificar
                            </Button>
                        </SettingItem>
                    )}
                </Section>

                <Section>
                    <SectionTitle>Sesión</SectionTitle>
                    
                    <SettingItem style={{ cursor: 'pointer' }} onClick={logout}>
                        <SettingInfo>
                            <SettingLabel style={{ color: '#fff' }}>Cerrar sesión</SettingLabel>
                        </SettingInfo>
                        <IoLogOut size={24} color="#fff" />
                    </SettingItem>
                </Section>

                <Section>                    
                    <SettingItem>
                        <SettingInfo>
                            <SettingLabel>Eliminar cuenta</SettingLabel>
                            <SettingValue>Esta acción no se puede deshacer</SettingValue>
                        </SettingInfo>
                        <Button $danger onClick={handleDeleteAccount}>
                            Eliminar
                        </Button>
                    </SettingItem>
                </Section>
            </Content>
        </Container>
    );
};

export default Settings;
