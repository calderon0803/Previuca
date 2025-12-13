import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useDates } from '../contexts/DatesContext';
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

const LoginCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 20px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  align-items: center;
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
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;

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
  transition: transform 0.1s;
  margin-top: 10px;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const StatusMessage = styled.p`
  margin-top: 20px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 14px;
  min-height: 20px;
`;

export default function DatesLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const { login } = useDates();

  const handleLogin = () => {
    if (!email || !password) return;

    setIsVerifying(true);
    setStatus('Conectando con Instagram...');

    // Simulation of verification process
    setTimeout(() => {
      setStatus('Autenticando...');
      setTimeout(() => {
        setStatus('¡Bienvenido!');
        setTimeout(() => {
          login(email, password);
          navigate('/my-dates');
        }, 500);
      }, 1000);
    }, 1000);
  };

  return (
    <Container>
      <Header>
        <IconButton onClick={() => navigate('/')}>
          <IoArrowBack size={24} />
        </IconButton>
      </Header>
      <LoginCard>
        <Title>Iniciar Sesión</Title>
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

        <Button onClick={handleLogin} disabled={!email || !password || isVerifying}>
          {isVerifying ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
        <StatusMessage>{status}</StatusMessage>
      </LoginCard>
    </Container>
  );
}
