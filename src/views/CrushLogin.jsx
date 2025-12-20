import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { IoLogoInstagram, IoArrowBack, IoLockClosed, IoMail } from 'react-icons/io5';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const Header = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 24px;
  margin-bottom: 30px;
  text-align: center;
`;

const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 8px;
  font-size: 14px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${({ theme }) => theme.colors.secondary};
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
  transition: transform 0.1s, filter 0.2s;
  margin-top: 10px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.secondary};
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.secondary}15`};
  }
`;

const StatusMessage = styled.p`
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  min-height: 20px;
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
      <Header>
        <IconButton onClick={() => navigate('/')}>
          <IoArrowBack size={24} />
        </IconButton>
      </Header>
      <LoginCard>
        <Title>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</Title>

        {!isRegisterMode ? (
          // Formulario de Login
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} style={{ width: '100%' }}>
            <InputGroup>
              <Label>Correo Electrónico</Label>
              <InputWrapper>
                <InputIcon>
                  <IoMail size={20} />
                </InputIcon>
                <Input
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
                  <IoLockClosed size={20} />
                </InputIcon>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <Button type="submit" disabled={!email || !password || isVerifying}>
              {isVerifying ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        ) : (
          // Formulario de Registro
          <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} style={{ width: '100%' }}>
            <InputGroup>
              <Label>Correo Electrónico</Label>
              <InputWrapper>
                <InputIcon>
                  <IoMail size={20} />
                </InputIcon>
                <Input
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
                  <IoLockClosed size={20} />
                </InputIcon>
                <Input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Confirmar Contraseña</Label>
              <InputWrapper>
                <InputIcon>
                  <IoLockClosed size={20} />
                </InputIcon>
                <Input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <Button type="submit" disabled={!email || !password || !confirmPassword || isVerifying}>
              {isVerifying ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>
        )}

        <SecondaryButton
          type="button"
          onClick={toggleMode}
          disabled={isVerifying}
        >
          {isRegisterMode ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
        </SecondaryButton>

        <StatusMessage>{status}</StatusMessage>
      </LoginCard>
    </Container>
  );
}
