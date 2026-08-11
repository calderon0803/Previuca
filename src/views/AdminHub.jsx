import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Users, PartyPopper, Tent, Flag, MessageSquareWarning } from 'lucide-react';
import GameModeCard from '../components/GameModeCard';
import PageHeader from '../components/ui/PageHeader';

const Container = styled.div`
  min-height: 100dvh;
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing(3)};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${({ theme }) => theme.spacing(4)};
  }
`;

const sections = [
    { id: 'crear-evento', name: 'Crear evento', icon: Plus, route: '/eventos/nuevo' },
    { id: 'usuarios', name: 'Administrar usuarios', icon: Users, route: '/admin/usuarios' },
    { id: 'eventos', name: 'Administrar eventos', icon: PartyPopper, route: '/admin/eventos' },
    { id: 'penas', name: 'Administrar peñas', icon: Tent, route: '/admin/penas' },
    { id: 'reportes', name: 'Administrar reportes', icon: Flag, route: '/admin/reportes' },
    { id: 'feedback', name: 'Reportes de la app', icon: MessageSquareWarning, route: '/admin/feedback' },
];

export default function AdminHub() {
    const navigate = useNavigate();

    return (
        <Container>
            <PageHeader title="Administración" onBack={() => navigate(-1)} />
            <Content>
                <Grid>
                    {sections.map((section) => (
                        <GameModeCard
                            key={section.id}
                            game={section}
                            isLocked={false}
                            onClick={() => navigate(section.route)}
                        />
                    ))}
                </Grid>
            </Content>
        </Container>
    );
}
