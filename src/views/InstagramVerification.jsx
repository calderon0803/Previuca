import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlechazo } from '../contexts/FlechazoContext';
import { IoLogoInstagram, IoCheckmarkCircle, IoCloseCircle, IoCopy } from 'react-icons/io5';
import { CheckCircle2 } from 'lucide-react';
import {
    createInstagramVerification,
    verifyInstagramCode,
    updateInstagramUsername
} from '../services/instagramService';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Container = styled.div`
  min-height: 100dvh;
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

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing(2)} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing(5)} 0;
  line-height: 1.5;
`;

const InputGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const CodeBox = styled.div`
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  margin: ${({ theme }) => theme.spacing(5)} 0;
  text-align: center;
`;

const Code = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: 0.15em;
  font-family: monospace;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const CodeHint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin: 0;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  background: ${({ theme, $verified }) => $verified ? 'rgba(63, 167, 114, 0.14)' : 'rgba(229, 72, 77, 0.14)'};
  color: ${({ theme, $verified }) => $verified ? theme.colors.success : theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StepList = styled.ol`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.8;
  padding-left: ${({ theme }) => theme.spacing(5)};
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const StatusMessage = styled.p`
  margin-top: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
`;

const ButtonStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export default function InstagramVerification() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const backPath = eventId ? `/eventos/${eventId}/mis-flechazos` : '/ajustes';
    const {
        user,
        isVerified,
        instagramUsername,
        verificationCode,
        loading: contextLoading,
        refreshInstagramVerification
    } = useFlechazo();
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

    if (contextLoading) return <LoadingScreen />;

    return (
        <Container>
            <PageHeader title="Verificación Instagram" onBack={() => navigate(-1)} />
            <Content>
                <Card>
                    <Title>
                        <IoLogoInstagram size={24} />
                        Verificar Instagram
                    </Title>
                    {verification?.is_verified && (
                        <StatusBadge $verified>
                            <IoCheckmarkCircle size={18} />
                            Verificado
                        </StatusBadge>
                    )}
                    {verification && !verification.is_verified && (
                        <StatusBadge $verified={false}>
                            <IoCloseCircle size={18} />
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
                            <Button fullWidth size="lg" onClick={handleSubmitUsername} disabled={!username.trim() || submitting}>
                                Generar código
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

                            <ButtonStack>
                                <Button fullWidth size="lg" onClick={handleCopyCode}>
                                    <IoCopy size={18} />
                                    Copiar código
                                </Button>

                                <Button fullWidth size="lg" onClick={handleVerify} disabled={submitting}>
                                    Verificar Instagram
                                </Button>

                                <Button
                                    fullWidth
                                    variant="secondary"
                                    onClick={handleSubmitUsername}
                                    disabled={submitting}
                                >
                                    Cambiar usuario
                                </Button>
                            </ButtonStack>
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
                            <Description style={{ marginTop: '4px', textAlign: 'center' }}>
                                <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Tu Instagram está verificado. Ya puedes usar la sección Flechazo.
                            </Description>
                            <Button fullWidth size="lg" onClick={() => navigate(backPath)}>
                                Ir a Mis Flechazos
                            </Button>
                        </>
                    )}

                    {status && <StatusMessage>{status}</StatusMessage>}
                </Card>
            </Content>
        </Container>
    );
}
