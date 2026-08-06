import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { useEvent } from '../contexts/EventContext';
import { useAdmin } from '../contexts/AdminContext';

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

// Un color -> borde sólido de ese color. Varios -> degradado.
// No se usa border-image: ignora border-radius y deja las esquinas cuadradas.
// En su lugar, dos fondos apilados (uno en el padding-box, otro en el
// border-box) simulan el borde degradado respetando el radio de la tarjeta.
const coloredBorder = ($colors, theme) => {
  if (!$colors || $colors.length === 0) return '';
  if ($colors.length === 1) {
    return css`
      border-color: ${$colors[0]};
    `;
  }
  return css`
    border-color: transparent;
    background: linear-gradient(${theme.colors.surface}, ${theme.colors.surface}) padding-box,
      linear-gradient(90deg, ${$colors.join(', ')}) border-box;
  `;
};

const HeroCard = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.base};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  opacity: ${({ $locked }) => ($locked ? 0.6 : 1)};
  ${({ $colors, theme }) => coloredBorder($colors, theme)}

  &:active {
    transform: scale(0.99);
  }
`;

const PrimaryHeroCard = styled(HeroCard)`
  background: ${({ theme }) => theme.colors.primaryMuted};
  border-color: ${({ theme }) => theme.colors.primary};
  transition: transform ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const HeroWatermark = styled.span`
  position: absolute;
  bottom: -16px;
  right: -4px;
  font-size: 72px;
  opacity: 0.14;
  transform: rotate(-8deg);
  pointer-events: none;
`;

const HeroTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: 4px;
  position: relative;
  z-index: 1;
`;

const LockPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  flex-shrink: 0;
`;

const HeroTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
`;

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
`;

const SecondaryRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => ($columns === 2 ? '1fr 1fr' : '1fr')};
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
  const { events, hasEvents } = useEvent();
  const { isAdmin } = useAdmin();

  return (
    <Container>
      <Content>
        <Kicker>
          <Logo src="/logo.png" alt="Previuca" />
          <Wordmark>Previuca</Wordmark>
        </Kicker>

        <Headline>¿A qué jugamos hoy?</Headline>

        <PrimaryHeroCard onClick={() => navigate('/games')}>
          <HeroWatermark aria-hidden="true">🎮</HeroWatermark>
          <HeroTop>
            <HeroTitle>Juegos</HeroTitle>
          </HeroTop>
          <HeroSubtitle>Diversión sin límites</HeroSubtitle>
        </PrimaryHeroCard>

        {hasEvents ? (
          events.map((evento) => (
            <HeroCard
              key={evento.id}
              onClick={() => navigate(`/eventos/${evento.id}`)}
              $colors={evento.colors}
            >
              <HeroWatermark aria-hidden="true">🎉</HeroWatermark>
              <HeroTop>
                <HeroTitle>{evento.name}</HeroTitle>
              </HeroTop>
              <HeroSubtitle>{evento.description || 'Peñas y Flechazo de este evento'}</HeroSubtitle>
            </HeroCard>
          ))
        ) : (
          <HeroCard onClick={() => navigate('/ajustes')} $locked>
            <HeroWatermark aria-hidden="true">🎉</HeroWatermark>
            <HeroTop>
              <HeroTitle>Eventos</HeroTitle>
              <LockPill>Bloqueado</LockPill>
            </HeroTop>
            <HeroSubtitle>Introduce un código en Ajustes</HeroSubtitle>
          </HeroCard>
        )}

        <SecondaryRow $columns={isAdmin ? 2 : 1}>
          <SecondaryTile onClick={() => navigate('/ajustes')}>
            <SecondaryIcon>⚙️</SecondaryIcon>
            <SecondaryLabel>Ajustes</SecondaryLabel>
          </SecondaryTile>
          {isAdmin && (
            <SecondaryTile onClick={() => navigate('/eventos/nuevo')}>
              <SecondaryIcon>➕</SecondaryIcon>
              <SecondaryLabel>Crear evento</SecondaryLabel>
            </SecondaryTile>
          )}
        </SecondaryRow>
      </Content>
    </Container>
  );
}
