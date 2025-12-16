import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { IoArrowBack, IoLogoInstagram, IoCheckmarkCircle, IoCloseCircle, IoCopy } from 'react-icons/io5';
import { 
    createInstagramVerification, 
    getInstagramVerification, 
    verifyInstagramCode,
    updateInstagramUsername 
} from '../services/instagramService';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 30px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 20px;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.secondary};
  color: #000;
  font-weight: bold;
  font-size: 16px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
`;

const CodeBox = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: center;
`;

const Code = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 4px;
  font-family: monospace;
  margin-bottom: 10px;
`;

const CodeHint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 12px;
  margin: 0;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  background: ${props => props.$verified ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
  color: ${props => props.$verified ? '#22c55e' : '#ef4444'};
  margin-top: 10px;
`;

const StepList = styled.ol`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  line-height: 1.8;
  padding-left: 20px;
  margin: 15px 0;
`;

const StatusMessage = styled.p`
  margin-top: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  text-align: center;
`;

export default function InstagramVerification() {
    const navigate = useNavigate();
    const { 
        user, 
        isVerified, 
        instagramUsername, 
        verificationCode,
        loading: contextLoading,
        refreshInstagramVerification 
    } = useCrush();
    const [username, setUsername] = useState(instagramUsername || '');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');
    
    // Objeto de verificación se construye a partir del contexto
    const verification = user && (instagramUsername || verificationCode) ? {
        user_id: user.id,
        instagram_username: instagramUsername,
        verification_code: verificationCode,
        is_verified: isVerified
    } : null;

    const handleSubmitUsername = async () => {
        if (!username.trim() || !user) return;

        setSubmitting(true);
        setStatus('Generando código...');

        const cleanUsername = username.replace('@', '').trim();
        
        const result = verification 
            ? await updateInstagramUsername(user.id, cleanUsername)
            : await createInstagramVerification(user.id, cleanUsername);

        if (result.success) {
            await refreshInstagramVerification();
            setStatus('¡Código generado! Cópialo en tu bio de Instagram.');
        } else {
            setStatus(`Error: ${result.error}`);
        }
        setSubmitting(false);
    };

    const handleVerify = async () => {
        if (!verification || !user) return;

        setSubmitting(true);
        setStatus('Verificando...');

        const result = await verifyInstagramCode(
            user.id,
            verification.instagram_username,
            verification.verification_code
        );

        if (result.success && result.verified) {
            await refreshInstagramVerification();
            setStatus('¡Instagram verificado correctamente!');
        } else {
            setStatus(result.error || 'No se encontró el código en tu biografía. Inténtalo de nuevo.');
        }
        setSubmitting(false);
    };

    const handleCopyCode = () => {
        if (verification?.verification_code) {
            navigator.clipboard.writeText(verification.verification_code);
            setStatus('¡Código copiado!');
            setTimeout(() => setStatus(''), 2000);
        }
    };

    if (contextLoading) {
        return (
            <Container>
                <Header>
                    <IconButton onClick={() => navigate('/my-crushes')}>
                        <IoArrowBack size={24} />
                    </IconButton>
                    <HeaderTitle>Verificación Instagram</HeaderTitle>
                </Header>
                <Content>
                    <Card>
                        <p style={{ textAlign: 'center', color: '#888' }}>Cargando...</p>
                    </Card>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <Header>
                <IconButton onClick={() => navigate('/my-crushes')}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Verificación Instagram</HeaderTitle>
            </Header>
            <Content>
                <Card>
                    <Title>
                        <IoLogoInstagram size={28} />
                        Verificar Instagram
                    </Title>
                    {verification?.is_verified && (
                        <StatusBadge $verified>
                            <IoCheckmarkCircle size={20} />
                            Verificado
                        </StatusBadge>
                    )}
                    {verification && !verification.is_verified && (
                        <StatusBadge $verified={false}>
                            <IoCloseCircle size={20} />
                            Pendiente de verificación
                        </StatusBadge>
                    )}
                    <Description>
                        Para usar la sección Match, necesitas verificar tu cuenta de Instagram.
                    </Description>

                    {!verification && (
                        <>
                            <InputGroup>
                                <Label>Nombre de usuario de Instagram</Label>
                                <Input
                                    type="text"
                                    placeholder="tu_usuario"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={submitting}
                                />
                            </InputGroup>
                            <Button onClick={handleSubmitUsername} disabled={!username.trim() || submitting}>
                                Generar Código
                            </Button>
                        </>
                    )}

                    {verification && !verification.is_verified && (
                        <>
                            <InputGroup>
                                <Label>Usuario de Instagram</Label>
                                <Input
                                    type="text"
                                    value={`@${verification.instagram_username}`}
                                    disabled
                                />
                            </InputGroup>

                            <CodeBox>
                                <Label>Tu código de verificación</Label>
                                <Code>{verification.verification_code}</Code>
                                <CodeHint>Copia este código en tu biografía de Instagram</CodeHint>
                            </CodeBox>

                            <StepList>
                                <li>Copia el código de arriba</li>
                                <li>Ve a tu perfil de Instagram</li>
                                <li>Edita tu biografía y pega el código</li>
                                <li>Guarda los cambios</li>
                                <li>Vuelve aquí y haz clic en "Verificar"</li>
                            </StepList>

                            <Button onClick={handleCopyCode} style={{ marginBottom: '10px' }}>
                                <IoCopy size={20} />
                                Copiar Código
                            </Button>

                            <Button onClick={handleVerify} disabled={submitting}>
                                Verificar Instagram
                            </Button>

                            <SecondaryButton 
                                onClick={handleSubmitUsername} 
                                disabled={submitting}
                                style={{ marginTop: '10px' }}
                            >
                                Cambiar Usuario
                            </SecondaryButton>
                        </>
                    )}

                    {verification?.is_verified && (
                        <>
                            <InputGroup>
                                <Label>Usuario verificado</Label>
                                <Input
                                    type="text"
                                    value={`@${verification.instagram_username}`}
                                    disabled
                                />
                            </InputGroup>
                            <Description style={{ marginTop: '20px', textAlign: 'center' }}>
                                ✓ Tu Instagram está verificado. Ya puedes usar la sección Crush.
                            </Description>
                            <Button onClick={() => navigate('/my-crushes')}>
                                Ir a Mis Crushes
                            </Button>
                        </>
                    )}

                    {status && <StatusMessage>{status}</StatusMessage>}
                </Card>
            </Content>
        </Container>
    );
}
