import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Tent, BookOpen, Heart, MessageCircle, ChevronRight } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import { useAdmin } from '../contexts/AdminContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { usePenas } from '../contexts/PenasContext';
import { getUnlockedStamps } from '../services/stampService';
import { hasEventStarted } from '../utils/eventStatus';
import { activityColors } from '../styles/theme';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import LoadingScreen from '../components/ui/LoadingScreen';
import { SignatureLine, SignatureHalo } from '../components/ui/Signature';

const Title = styled.h1`
  margin: 0 0 ${({ theme }) => theme.spacing(5.5)};
  font-size: 30px;
  line-height: 1.1;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.03em;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

// Fila de actividad: la misma anatomía que las tarjetas `row` de los juegos.
const ActivityRow = styled.button`
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3.5)};
  width: 100%;
  height: 78px;
  padding: 0 ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  text-align: left;
  opacity: ${({ $locked }) => ($locked ? 0.55 : 1)};
  transition: border-color ${({ theme }) => theme.transitions.base},
    transform ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:active {
    transform: scale(0.995);
  }
`;

const Glyph = styled.span`
  position: relative;
  display: flex;
  flex-shrink: 0;
  color: ${({ $color }) => $color};
`;

const Texts = styled.span`
  position: relative;
  flex: 1;
  min-width: 0;
`;

const Name = styled.span`
  display: block;
  font-size: 17px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Note = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.muted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Caret = styled.span`
  position: relative;
  display: flex;
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const Empty = styled.div`
  padding: ${({ theme }) => theme.spacing(10)} 0;
`;

const EmptyTitle = styled.h2`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 26px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
`;

const EmptyText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(6)};
  font-size: 15px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.muted};
`;

// «Del 21 al 25 de agosto» a partir de las fechas del evento.
const formatDates = (evento) => {
    if (!evento?.start_date) return evento?.description || '';
    const parse = (value) => {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d);
    };
    const opts = { day: 'numeric', month: 'long' };
    const start = parse(evento.start_date).toLocaleDateString('es-ES', opts);
    if (!evento.end_date) return `Desde el ${start}`;
    const end = parse(evento.end_date).toLocaleDateString('es-ES', opts);
    return `Del ${start} al ${end}`;
};

export default function EventsHub() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { events, loading } = useEvent();
    const { isAdmin } = useAdmin();
    const { user, flechazos, matches, loadFlechazos } = useFlechazo();
    const { penas, myPena, loadPenas } = usePenas();
    const [unlocked, setUnlocked] = useState(null);

    useEffect(() => {
        if (!eventId) return;
        loadPenas(eventId);
        loadFlechazos(eventId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, user?.id]);

    useEffect(() => {
        if (!user?.id || !eventId) return;
        getUnlockedStamps(user.id, eventId).then((result) =>
            setUnlocked(result.penaIds?.length ?? 0),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, eventId]);

    if (loading) return <LoadingScreen />;

    const evento = events.find((e) => e.id === eventId);

    if (!evento) {
        return (
            <Screen>
                <PageHeader title="Eventos" onBack={() => navigate(-1)} />
                <Content>
                    <Empty>
                        <EmptyTitle>No perteneces a este evento</EmptyTitle>
                        <EmptyText>
                            Introduce el código de un evento en Ajustes para apuntarte.
                        </EmptyText>
                        <Button size="lg" fullWidth onClick={() => navigate('/ajustes')}>
                            Ir a Ajustes
                        </Button>
                    </Empty>
                </Content>
            </Screen>
        );
    }

    // A un admin no le afecta el bloqueo por fechas: necesita poder entrar a
    // revisar/organizar antes de que el evento empiece oficialmente.
    const eventStarted = hasEventStarted(evento) || isAdmin;

    const matchCount = matches?.length ?? 0;
    const activities = [
        {
            id: 'penas',
            name: 'Peñas',
            icon: Tent,
            ...activityColors.penas,
            note: myPena
                ? `Tu peña: ${myPena.name}`
                : penas.length > 0
                    ? `${penas.length} peñas en el evento`
                    : 'Crea la tuya o únete con un código',
            route: `/eventos/${eventId}/penas`,
        },
        {
            id: 'album',
            name: 'Álbum de sellos',
            icon: BookOpen,
            ...activityColors.album,
            note:
                unlocked == null
                    ? 'Colecciona los sellos de las peñas'
                    : `${unlocked} de ${penas.length || '?'} sellos`,
            route: `/eventos/${eventId}/album`,
            locked: !eventStarted,
        },
        {
            id: 'flechazo',
            name: 'Flechazo',
            icon: Heart,
            ...activityColors.flechazo,
            note: `${flechazos?.length ?? 0} de 5${matchCount > 0 ? ` · ${matchCount} correspondido${matchCount === 1 ? '' : 's'}` : ''}`,
            route: `/eventos/${eventId}/flechazo`,
            locked: !eventStarted,
        },
        {
            id: 'salseos',
            name: 'Salseo',
            icon: MessageCircle,
            ...activityColors.salseo,
            note: 'Anónimo, dentro del evento',
            route: `/eventos/${eventId}/salseos`,
        },
    ];

    return (
        <Screen>
            <PageHeader
                kicker={eventStarted ? 'Evento en curso' : 'Evento'}
                status={formatDates(evento)}
                onBack={() => navigate(-1)}
            />
            <Content>
                <Title>{evento.name}</Title>
                <List>
                    {activities.map((activity) => (
                        <ActivityRow
                            key={activity.id}
                            $locked={activity.locked}
                            onClick={() => !activity.locked && navigate(activity.route)}
                        >
                            <SignatureLine $color={activity.color} aria-hidden="true" />
                            <SignatureHalo $glow={activity.glow} aria-hidden="true" />
                            <Glyph $color={activity.color} aria-hidden="true">
                                <activity.icon size={26} strokeWidth={1.5} />
                            </Glyph>
                            <Texts>
                                <Name>{activity.name}</Name>
                                <Note>
                                    {activity.locked
                                        ? 'Se abre cuando empiece el evento'
                                        : activity.note}
                                </Note>
                            </Texts>
                            <Caret aria-hidden="true">
                                <ChevronRight size={16} />
                            </Caret>
                        </ActivityRow>
                    ))}
                </List>
            </Content>
        </Screen>
    );
}
