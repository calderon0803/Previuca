import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Tent, BookOpen, Heart } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { hasEventStarted } from '../utils/eventStatus';
import GameModeCard from '../components/GameModeCard';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const SectionEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};

  &::before {
    content: '';
    display: inline-block;
    width: 12px;
    height: 2px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    background: ${({ theme }) => theme.colors.primary};
    vertical-align: middle;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;

const LockedState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(10)} ${({ theme }) => theme.spacing(5)};
`;

const LockedTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const LockedText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

export default function EventsHub() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { events, loading } = useEvent();

    if (loading) return null;

    const evento = events.find((e) => e.id === eventId);

    if (!evento) {
        return (
            <Container>
                <PageHeader title="Eventos" onBack={() => navigate('/')} />
                <Content>
                    <LockedState>
                        <LockedTitle>No perteneces a este evento</LockedTitle>
                        <LockedText>
                            Introduce el código de un evento en Ajustes para apuntarte.
                        </LockedText>
                        <Button size="lg" onClick={() => navigate('/ajustes')}>
                            Ir a Ajustes
                        </Button>
                    </LockedState>
                </Content>
            </Container>
        );
    }

    const eventStarted = hasEventStarted(evento);

    const subsections = [
        { id: 'penas', name: 'Peñas', icon: Tent, route: `/eventos/${eventId}/penas`, isLocked: false },
        { id: 'album', name: 'Álbum de sellos', icon: BookOpen, route: `/eventos/${eventId}/album`, isLocked: !eventStarted },
        { id: 'flechazo', name: 'Flechazo', icon: Heart, route: `/eventos/${eventId}/flechazo`, isLocked: !eventStarted },
    ];

    const handleSectionClick = (section) => {
        if (section.isLocked) {
            alert('Disponible cuando empiece el evento. Mientras tanto puedes ir organizando tu peña.');
            return;
        }
        navigate(section.route);
    };

    return (
        <Container>
            <PageHeader title={evento.name} onBack={() => navigate('/')} />
            <Content>
                <SectionLabel>
                    <SectionEyebrow>Subsecciones</SectionEyebrow>
                </SectionLabel>
                <Grid>
                    {subsections.map((section) => (
                        <GameModeCard
                            key={section.id}
                            game={section}
                            isLocked={section.isLocked}
                            onClick={() => handleSectionClick(section)}
                        />
                    ))}
                </Grid>
            </Content>
        </Container>
    );
}
