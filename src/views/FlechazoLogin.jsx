import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useFlechazo } from '../contexts/FlechazoContext';
import { IoArrowBack, IoLockClosed, IoMail, IoPersonOutline } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';
import { isAtLeastMinAge, MIN_AGE, GENDER_OPTIONS } from '../services/profileService';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DateInput from '../components/ui/DateInput';
import Modal from '../components/ui/Modal';
import TermsAndConditions from '../components/TermsAndConditions';

const Container = styled.div`
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(20)} ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(5)};
  position: relative;
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
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

const TermsRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  cursor: pointer;
`;

const TermsCheckbox = styled.input`
  margin-top: 3px;
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.primary};
  flex-shrink: 0;
`;

const TermsText = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.4;
`;

const TermsLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: underline;
  cursor: pointer;
`;

export default function FlechazoLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();
  const { user, login, register, loading } = useFlechazo();
  // Si venimos de una sección protegida (FlechazoRoute nos mandó aquí), al
  // loguearnos hay que volver exactamente ahí, no a un destino genérico.
  const redirectTarget = location.state?.from || (eventId ? `/eventos/${eventId}/mis-flechazos` : '/ajustes');

  // Redirigir si ya está autenticado
  React.useEffect(() => {
    if (!loading && user?.id) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user?.id, loading, navigate, redirectTarget]);

  // Mostrar loading mientras verifica sesión
  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center' }}>
          <Spinner size={32} />
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
      const result = await login(email, password);

      if (result?.success) {
        setStatus('¡Bienvenido!');
        setTimeout(() => {
          navigate(redirectTarget);
        }, 500);
      } else {
        const errorMsg = typeof result?.error === 'string'
          ? result.error
          : result?.error?.message || 'Error al iniciar sesión';
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
    if (!email || !password || !firstName.trim() || !lastName.trim() || !birthdate || !gender) return;

    if (!acceptedTerms) {
      setStatus('Debes aceptar los términos y condiciones para registrarte');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setStatus('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!isAtLeastMinAge(birthdate)) {
      setStatus(`Debes ser mayor de ${MIN_AGE} años para registrarte`);
      return;
    }

    setIsVerifying(true);
    setStatus('Creando cuenta...');

    try {
      const result = await register(email, password, firstName, lastName, birthdate, gender);

      if (result.success) {
        setStatus('¡Cuenta creada! Verifica tu email para continuar.');
        setIsVerifying(false);
        setTimeout(() => {
          setIsRegisterMode(false);
          setPassword('');
          setConfirmPassword('');
          setFirstName('');
          setLastName('');
          setBirthdate('');
          setGender('');
          setAcceptedTerms(false);
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
    setFirstName('');
    setLastName('');
    setBirthdate('');
    setGender('');
    setAcceptedTerms(false);
  };

  return (
    <Container>
      <BackButtonWrap>
        <IconButton onClick={() => navigate(-1)} aria-label="Volver">
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
              <Label>Nombre</Label>
              <InputWrapper>
                <InputIcon>
                  <IoPersonOutline size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="text"
                  placeholder="Tu nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Apellido</Label>
              <InputWrapper>
                <InputIcon>
                  <IoPersonOutline size={18} />
                </InputIcon>
                <Input
                  $hasIcon
                  type="text"
                  placeholder="Tu apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isVerifying}
                />
              </InputWrapper>
            </InputGroup>

            <InputGroup>
              <Label>Fecha de nacimiento</Label>
              <DateInput
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                disabled={isVerifying}
              />
            </InputGroup>

            <InputGroup>
              <Label>Género</Label>
              <Input
                as="select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isVerifying}
              >
                <option value="" disabled>Selecciona una opción</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </Input>
            </InputGroup>

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

            <TermsRow>
              <TermsCheckbox
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={isVerifying}
              />
              <TermsText>
                He leído y acepto los{' '}
                <TermsLink type="button" onClick={(e) => { e.preventDefault(); setShowTerms(true); }}>
                  términos y condiciones
                </TermsLink>
              </TermsText>
            </TermsRow>

            <Button type="submit" fullWidth size="lg" disabled={!email || !password || !confirmPassword || !firstName.trim() || !lastName.trim() || !birthdate || !gender || !acceptedTerms || isVerifying}>
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

      <Modal visible={showTerms} onClose={() => setShowTerms(false)}>
        <TermsAndConditions />
      </Modal>
    </Container>
  );
}
