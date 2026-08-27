import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Gamepad2, Settings, ShieldCheck, Download } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAdmin } from '../contexts/AdminContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getUnreadNotices, markNoticeRead } from '../services/adminService';
import { isEventVisibleInMenu, hasEventStarted } from '../utils/eventStatus';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import { SignatureLine, SignatureHalo } from '../components/ui/Signature';
import TermsAndConditions from '../components/TermsAndConditions';
import InstallPwaModal from '../components/InstallPwaModal';

const Container = styled.div`
  min-height: 100dvh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: calc(${({ theme }) => theme.spacing(3.5)} + env(safe-area-inset-top, 0px))
    ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(7)};
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  animation: pv-in 0.22s ease;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(8.5)};
`;

const BrandMark = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const Logo = styled.img`
  width: 26px;
  height: 26px;
  object-fit: cover;
  border-radius: 6px;
`;

const Wordmark = styled.span`
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.muted};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const Greeting = styled.p`
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accent};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const Headline = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing(7.5)};
  font-size: 32px;
  line-height: 1.1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

// Tarjeta principal (Juegos): superficie elevada y halo blurple más marcado.
const GamesCard = styled.button`
  position: relative;
  overflow: hidden;
  display: block;
  width: 100%;
  text-align: left;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border: 1px solid #423a6a;
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  transition: border-color ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: #5d5294;
  }

  &:active {
    transform: scale(0.995);
  }
`;

const Watermark = styled.span`
  position: absolute;
  right: 14px;
  bottom: 10px;
  display: flex;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.accent};
  pointer-events: none;
`;

const CardTitle = styled.span`
  position: relative;
  display: block;
  font-size: ${({ $size }) => $size || '26px'};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardSub = styled.span`
  position: relative;
  display: block;
  font-size: 13px;
  color: ${({ theme, $dim }) => ($dim ? theme.colors.text.muted : theme.colors.text.secondary)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EventCard = styled.button`
  position: relative;
  overflow: hidden;
  display: block;
  width: 100%;
  text-align: left;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4.5)} ${({ theme }) => theme.spacing(5)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  opacity: ${({ $dim }) => ($dim ? 0.6 : 1)};
  transition: border-color ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:active {
    transform: scale(0.995);
  }
`;

const EventTop = styled.span`
  position: relative;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: 3px;
`;

const EventState = styled.span`
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accent};
  white-space: nowrap;
  flex-shrink: 0;
`;

const TileRow = styled.div`
  display: grid;
  grid-template-columns: ${({ $columns }) => ($columns === 2 ? '1fr 1fr' : '1fr')};
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-top: ${({ theme }) => theme.spacing(4.5)};
`;

const Tile = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2.5)};
  min-height: 48px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3.5)};
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: border-color ${({ theme }) => theme.transitions.fast};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const TileLabel = styled.span`
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LoginBanner = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3.5)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: left;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.accentTint};
  }
`;

const LoginBannerText = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const LoginBannerCta = styled.span`
  color: ${({ theme }) => theme.colors.accentText};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  font-size: 14px;
  flex-shrink: 0;
  white-space: nowrap;
`;

const NoticeItem = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 15px;
  line-height: 1.5;
  background: ${({ theme }) => theme.colors.surfaceRaised};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3.5)};
  margin: 0 0 ${({ theme }) => theme.spacing(2.5)};
`;

const TermsFooter = styled.button`
  margin: ${({ theme }) => theme.spacing(7)} 0 0;
  padding: 0;
  color: ${({ theme }) => theme.colors.text.disabled};
  font-size: 11.5px;
  text-decoration: underline;
  align-self: center;
`;

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// «Jueves noche», «Sábado tarde»: da contexto sin repetir el nombre del usuario.
function greeting() {
    const now = new Date();
    const hour = now.getHours();
    const day = WEEKDAYS[now.getDay()];
    if (hour < 6) return `${day} de madrugada`;
    if (hour < 13) return `${day} por la mañana`;
    if (hour < 20) return `${day} tarde`;
    return `${day} noche`;
}

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
                <Brand>
                    <BrandMark>
                        <Logo src="/logo.png" alt="Previuca" />
                        <Wordmark>Previuca</Wordmark>
                    </BrandMark>
                    <IconButton onClick={() => setShowInstall(true)} aria-label="Instalar app">
                        <Download size={20} />
                    </IconButton>
                </Brand>

                {!userLoading && !user && (
                    <LoginBanner onClick={() => navigate('/flechazo', { state: { from: '/' } })}>
                        <LoginBannerText>Inicia sesión para participar en los eventos</LoginBannerText>
                        <LoginBannerCta>Entrar →</LoginBannerCta>
                    </LoginBanner>
                )}

                <Greeting>{greeting()}</Greeting>
                <Headline>¿Qué hacemos hoy?</Headline>

                <GamesCard onClick={() => navigate('/games')}>
                    <SignatureLine $color="#9184d9" aria-hidden="true" />
                    <SignatureHalo
                        $glow="rgba(145, 132, 217, 0.28)"
                        $size="150px"
                        $right="-30px"
                        $bottom="-40px"
                        aria-hidden="true"
                    />
                    <Watermark aria-hidden="true"><Gamepad2 size={64} /></Watermark>
                    <CardTitle>Juegos</CardTitle>
                    <CardSub>Con quien tengas al lado</CardSub>
                </GamesCard>

                {eventsLoading ? (
                    <EventCard $dim as="div">
                        <SignatureLine $color="#a7a1db" aria-hidden="true" />
                        <EventTop>
                            <CardTitle $size="20px">Eventos</CardTitle>
                        </EventTop>
                        <CardSub $dim>Cargando...</CardSub>
                    </EventCard>
                ) : hasEvents ? (
                    visibleEvents.map((evento) => (
                        <EventCard key={evento.id} onClick={() => navigate(`/eventos/${evento.id}`)}>
                            <SignatureLine $color={evento.colors?.[0] || '#a7a1db'} aria-hidden="true" />
                            <EventTop>
                                <CardTitle $size="20px">{evento.name}</CardTitle>
                                <EventState>
                                    {hasEventStarted(evento) ? 'en curso' : 'pronto'}
                                </EventState>
                            </EventTop>
                            <CardSub $dim>
                                {evento.description || 'Peñas · Álbum de sellos · Flechazo · Salseo'}
                            </CardSub>
                        </EventCard>
                    ))
                ) : (
                    <EventCard $dim onClick={() => navigate('/ajustes')}>
                        <SignatureLine $color="#a7a1db" aria-hidden="true" />
                        <EventTop>
                            <CardTitle $size="20px">Eventos</CardTitle>
                            <EventState>bloqueado</EventState>
                        </EventTop>
                        <CardSub $dim>Introduce un código en Ajustes</CardSub>
                    </EventCard>
                )}

                <TileRow $columns={isAdmin ? 2 : 1}>
                    <Tile onClick={() => navigate('/ajustes')}>
                        <Settings size={18} />
                        <TileLabel>Ajustes</TileLabel>
                    </Tile>
                    {isAdmin && (
                        <Tile onClick={() => navigate('/admin')}>
                            <ShieldCheck size={18} />
                            <TileLabel>Administración</TileLabel>
                        </Tile>
                    )}
                </TileRow>

                <TermsFooter type="button" onClick={() => setShowTerms(true)}>
                    Términos y condiciones
                </TermsFooter>
            </Content>

            <BottomSheet visible={showTerms} onClose={() => setShowTerms(false)}>
                <TermsAndConditions />
            </BottomSheet>

            <InstallPwaModal visible={showInstall} onClose={() => setShowInstall(false)} />

            <BottomSheet visible={pendingNotices.length > 0} onClose={handleDismissNotices}>
                <SheetTitle>Avisos del equipo organizador</SheetTitle>
                <div style={{ height: 16 }} />
                {pendingNotices.map((notice) => (
                    <NoticeItem key={notice.id}>{notice.message}</NoticeItem>
                ))}
                <div style={{ height: 8 }} />
                <Button size="lg" fullWidth onClick={handleDismissNotices}>
                    Entendido
                </Button>
            </BottomSheet>
        </Container>
    );
}
