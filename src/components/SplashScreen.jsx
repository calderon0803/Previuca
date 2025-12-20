import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: ${props => props.$fading ? fadeOut : 'none'} 0.5s ease-out forwards;
`;

const Logo = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
`;

const SplashScreen = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onFinish, 500); // Wait for animation
    }, 1500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Container $fading={fading}>
      <Logo src="/logo.png" alt="Previuca" />
    </Container>
  );
};

export default SplashScreen;
