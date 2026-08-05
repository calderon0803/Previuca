import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { IoArrowBack, IoLockClosed, IoMail } from 'react-icons/io5';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(5)};
  position: relative;
`;

const BackButtonWrap = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(5)};
  left: ${({ theme }) => theme.spacing(5)};
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  box-sizing: border-box;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
  text-align: center;
`;

const InputGroup = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
`;

const StatusMessage = styled.p`
  margin-top: ${({ theme }) => theme.spacing(5)};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  min-height: 20px;
  text-align: center;
`;

export default function CrushLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();
  const { user, login, register, loading } = useCrush();

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (!loading && user?.id) {
      navigate('/my-crushes', { replace: true });
    }
  }, [user?.id, loading, navigate]);

  // Mostrar loading mientras verifica sesión
  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '32px', marginBottom: '20px' }}>🍷</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Verificando sesión...</div>
        </div>
      </Container>
    );
  }

  const handleLogin = async () => {
    if (!email || !password) return;

    setIsVerifying(true);
    setStatus('Autenticando...');

    try {
      console.log('Intentando login con:', email);
      const result = await login(email, password);
      console.log('Login result completo:', JSON.stringify(result, null, 2));
      console.log('result.success:', result?.success);
      console.log('Tipo de result:', typeof result);

      if (result?.success) {
        setStatus('¡Bienvenido!');
        setTimeout(() => {
          navigate('/my-crushes');
        }, 500);
      } else {
        const errorMsg = typeof result?.error === 'string'
          ? result.error
          : result?.error?.message || 'Error al iniciar sesión';
        console.log('Error message:', errorMsg);
        setStatus(errorMsg);
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Login exception:', error);
      setStatus('Error al conectar con el servidor');
      setIsVerifying(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password) return;

    if (password !== confirmPassword) {
      setStatus('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setStatus('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsVerifying(true);
    setStatus('Creando cuenta...');

    try {
      const result = await register(email, password);

      if (result.success) {
        setStatus('¡Cuenta creada! Verifica tu email para continuar.');
        setIsVerifying(false);
        setTimeout(() => {
          setIsRegisterMode(false);
          setPassword('');
          setConfirmPassword('');
        }, 3000);
      } else {
        setStatus(result.error || 'Error al crear cuenta');
        setIsVerifying(false);
      }
    } catch (error) {
      setStatus('Error al conectar con el servidor');
      setIsVerifying(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setStatus('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Container>
      <BackButtonWrap>
        <IconButton onClick={() => navigate('/')} aria-label="Volver">
          <IoArrowBack size={20} />
        </IconButton>
      </BackButtonWrap>
      <LoginCard>
        <Title>{isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}</Title>

        {!isRegisterMode ? (
          // Formulario de Login
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={{ width: '100%' }}>
            <InputGroup>
              <Label>Correo electrónico</Label>
              <InputWrapper>
                <InputIcon>
                  <IoMail size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Contraseña</Label>
              <InputWrapper>
                <InputIcon>
                  <IoLockClosed size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <Button type="submit" fullWidth size="lg" disabled={!email || !password || isVerifying}>
              {isVerifying ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        ) : (
          // Formulario de Registro
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} style={{ width: '100%' }}>
            <InputGroup>
              <Label>Correo electrónico</Label>
              <InputWrapper>
                <InputIcon>
                  <IoMail size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Contraseña</Label>
              <InputWrapper>
                <InputIcon>
                  <IoLockClosed size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Confirmar contraseña</Label>
              <InputWrapper>
                <InputIcon>
                  <IoLockClosed size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <Button type="submit" fullWidth size="lg" disabled={!email || !password || !confirmPassword || isVerifying}>
              {isVerifying ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>
        )}

        <div style={{ width: '100%', marginTop: '12px' }}>
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={toggleMode}
            disabled={isVerifying}
          >
            {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </Button>
        </div>

        <StatusMessage>{status}</StatusMessage>
      </LoginCard>
    </Container>
  );
}
