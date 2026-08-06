import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoLockClosed } from 'react-icons/io5';
import { useFiesta } from '../contexts/FiestaContext';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(5)};
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    max-width: 560px;
    padding-top: ${({ theme }) => theme.spacing(10)};
  }
`;

const Kicker = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
`;

const Logo = styled.img`
  width: 28px;
  height: 28px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const Wordmark = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

const Headline = styled.h1`
  font-size: 2rem;
  line-height: 1.15;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(9)} 0;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
`;

const HeroCard = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.primaryMuted};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(6)};
  min-height: 148px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  opacity: ${({ $locked }) => ($locked ? 0.6 : 1)};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:active {
    transform: scale(0.99);
  }
`;

const HeroWatermark = styled.span`
  position: absolute;
  bottom: -18px;
  right: -6px;
  font-size: 96px;
  opacity: 0.16;
  transform: rotate(-8deg);
  pointer-events: none;
`;

const LockBadge = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing(4)};
  right: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.colors.text.secondary};
  z-index: 1;
`;

const HeroLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  z-index: 1;
`;

const HeroTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 4px 0;
  z-index: 1;
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  z-index: 1;
`;

const SecondaryRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const SecondaryTile = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }

  &:active {
    transform: scale(0.99);
  }
`;

const SecondaryIcon = styled.span`
  font-size: 18px;
  flex-shrink: 0;
`;

const SecondaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default function MainMenu() {
  const navigate = useNavigate();
  const { hasFiesta } = useFiesta();

  const handleFiestasClick = () => {
    navigate(hasFiesta ? '/fiestas' : '/ajustes');
  };

  return (
    <Container>
      <Content>
        <Kicker>
          <Logo src="/logo.png" alt="Previuca" />
          <Wordmark>Previuca</Wordmark>
        </Kicker>

        <Headline>¿A qué jugamos hoy?</Headline>

        <HeroCard onClick={() => navigate('/games')}>
          <HeroWatermark aria-hidden="true">🎮</HeroWatermark>
          <HeroLabel>Empezar</HeroLabel>
          <HeroTitle>Juegos</HeroTitle>
          <HeroSubtitle>Diversión sin límites</HeroSubtitle>
        </HeroCard>

        <HeroCard onClick={handleFiestasClick} $locked={!hasFiesta}>
          <HeroWatermark aria-hidden="true">🎉</HeroWatermark>
          {!hasFiesta && (
            <LockBadge>
              <IoLockClosed size={16} />
            </LockBadge>
          )}
          <HeroLabel>{hasFiesta ? 'Empezar' : 'Bloqueado'}</HeroLabel>
          <HeroTitle>Fiestas</HeroTitle>
          <HeroSubtitle>
            {hasFiesta ? 'Peñas y Crush de tu fiesta' : 'Introduce un código en Ajustes'}
          </HeroSubtitle>
        </HeroCard>

        <SecondaryRow>
          <SecondaryTile onClick={() => navigate('/ajustes')}>
            <SecondaryIcon>⚙️</SecondaryIcon>
            <SecondaryLabel>Ajustes</SecondaryLabel>
          </SecondaryTile>
        </SecondaryRow>
      </Content>
    </Container>
  );
}
