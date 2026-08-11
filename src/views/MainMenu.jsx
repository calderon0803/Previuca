import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Gamepad2, PartyPopper, Settings, ShieldCheck, Download } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAdmin } from '../contexts/AdminContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getUnreadNotices, markNoticeRead } from '../services/adminService';
import { isEventVisibleInMenu } from '../utils/eventStatus';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import TermsAndConditions from '../components/TermsAndConditions';
import InstallPwaModal from '../components/InstallPwaModal';

const Container = styled.div`
  min-height: 100dvh;
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
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
`;

const KickerBrand = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
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
  display: flex;
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
  display: flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SecondaryLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NoticesTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const NoticeItem = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const LoginBanner = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  background: ${({ theme }) => theme.colors.primaryMuted};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  cursor: pointer;
  text-align: left;
`;

const LoginBannerText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const LoginBannerCta = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  flex-shrink: 0;
  white-space: nowrap;
`;

const TermsFooter = styled.button`
  background: none;
  border: none;
  margin: ${({ theme }) => theme.spacing(6)} 0 0 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.disabled};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-decoration: underline;
  cursor: pointer;
  align-self: center;
`;

export default function MainMenu() {
  const navigate = useNavigate();
  const { events, loading: eventsLoading } = useEvent();
  const { isAdmin } = useAdmin();
  const { user, loading: userLoading } = useFlechazo();
  const visibleEvents = events.filter(isEventVisibleInMenu);
  const hasEvents = visibleEvents.length > 0;
  const [showTerms, setShowTerms] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [pendingNotices, setPendingNotices] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    getUnreadNotices(user.id).then((result) => setPendingNotices(result.notices));
  }, [user?.id]);

  const handleDismissNotices = async () => {
    await Promise.all(pendingNotices.map((notice) => markNoticeRead(notice.id)));
    setPendingNotices([]);
  };

  return (
    <Container>
      <Content>
        <Kicker>
          <KickerBrand>
            <Logo src="/logo.png" alt="Previuca" />
            <Wordmark>Previuca</Wordmark>
          </KickerBrand>
          <IconButton variant="ghost" size="sm" onClick={() => setShowInstall(true)} aria-label="Instalar app">
            <Download size={18} />
          </IconButton>
        </Kicker>

        {!userLoading && !user && (
          <LoginBanner onClick={() => navigate('/flechazo', { state: { from: '/' } })}>
            <LoginBannerText>Inicia sesión para participar en los eventos</LoginBannerText>
            <LoginBannerCta>Entrar →</LoginBannerCta>
          </LoginBanner>
        )}

        <Headline>¿Qué hacemos hoy?</Headline>

        <PrimaryHeroCard onClick={() => navigate('/games')}>
          <HeroWatermark aria-hidden="true"><Gamepad2 size={72} /></HeroWatermark>
          <HeroTop>
            <HeroTitle>Juegos</HeroTitle>
          </HeroTop>
          <HeroSubtitle>Diversión sin límites</HeroSubtitle>
        </PrimaryHeroCard>

        {eventsLoading ? (
          <HeroCard $locked>
            <HeroWatermark aria-hidden="true"><PartyPopper size={72} /></HeroWatermark>
            <HeroTop>
              <HeroTitle>Eventos</HeroTitle>
            </HeroTop>
            <HeroSubtitle>Cargando...</HeroSubtitle>
          </HeroCard>
        ) : hasEvents ? (
          visibleEvents.map((evento) => (
            <HeroCard
              key={evento.id}
              onClick={() => navigate(`/eventos/${evento.id}`)}
              $colors={evento.colors}
            >
              <HeroWatermark aria-hidden="true"><PartyPopper size={72} /></HeroWatermark>
              <HeroTop>
                <HeroTitle>{evento.name}</HeroTitle>
              </HeroTop>
              <HeroSubtitle>{evento.description || 'Peñas y Flechazo de este evento'}</HeroSubtitle>
            </HeroCard>
          ))
        ) : (
          <HeroCard onClick={() => navigate('/ajustes')} $locked>
            <HeroWatermark aria-hidden="true"><PartyPopper size={72} /></HeroWatermark>
            <HeroTop>
              <HeroTitle>Eventos</HeroTitle>
              <LockPill>Bloqueado</LockPill>
            </HeroTop>
            <HeroSubtitle>Introduce un código en Ajustes</HeroSubtitle>
          </HeroCard>
        )}

        <SecondaryRow $columns={isAdmin ? 2 : 1}>
          <SecondaryTile onClick={() => navigate('/ajustes')}>
            <SecondaryIcon><Settings size={18} /></SecondaryIcon>
            <SecondaryLabel>Ajustes</SecondaryLabel>
          </SecondaryTile>
          {isAdmin && (
            <SecondaryTile onClick={() => navigate('/admin')}>
              <SecondaryIcon><ShieldCheck size={18} /></SecondaryIcon>
              <SecondaryLabel>Administración</SecondaryLabel>
            </SecondaryTile>
          )}
        </SecondaryRow>

        <TermsFooter type="button" onClick={() => setShowTerms(true)}>
          Términos y condiciones
        </TermsFooter>
      </Content>

      <Modal visible={showTerms} onClose={() => setShowTerms(false)}>
        <TermsAndConditions />
      </Modal>

      <InstallPwaModal visible={showInstall} onClose={() => setShowInstall(false)} />

      <Modal visible={pendingNotices.length > 0} onClose={handleDismissNotices}>
        <NoticesTitle>Avisos del equipo organizador</NoticesTitle>
        {pendingNotices.map((notice) => (
          <NoticeItem key={notice.id}>{notice.message}</NoticeItem>
        ))}
        <Button fullWidth onClick={handleDismissNotices}>Entendido</Button>
      </Modal>
    </Container>
  );
}
