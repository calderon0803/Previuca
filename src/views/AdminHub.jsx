import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Users, PartyPopper, Tent, Flag, MessageSquareWarning } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

// Rejilla de entrada: el icono grande, apagado, arriba a la derecha; el
// nombre abajo a la izquierda.
const Tile = styled.button`
  position: relative;
  overflow: hidden;
  height: 104px;
  padding: ${({ theme }) => theme.spacing(3.5)};
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: left;
  transition: border-color ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const Glyph = styled.span`
  position: absolute;
  right: 10px;
  top: 12px;
  display: flex;
  opacity: 0.4;
  color: ${({ theme }) => theme.colors.accent};
  pointer-events: none;
`;

const Name = styled.span`
  font-size: 15px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const sections = [
    { id: 'crear-evento', name: 'Crear evento', icon: Plus, route: '/eventos/nuevo' },
    { id: 'usuarios', name: 'Usuarios', icon: Users, route: '/admin/usuarios' },
    { id: 'eventos', name: 'Eventos', icon: PartyPopper, route: '/admin/eventos' },
    { id: 'penas', name: 'Peñas', icon: Tent, route: '/admin/penas' },
    { id: 'reportes', name: 'Reportes', icon: Flag, route: '/admin/reportes' },
    { id: 'feedback', name: 'Feedback', icon: MessageSquareWarning, route: '/admin/feedback' },
];

export default function AdminHub() {
    const navigate = useNavigate();

    return (
        <Screen>
            <PageHeader title="Administración" onBack={() => navigate(-1)} />
            <Content>
                <Grid>
                    {sections.map((section) => (
                        <Tile key={section.id} onClick={() => navigate(section.route)}>
                            <Glyph aria-hidden="true">
                                <section.icon size={34} strokeWidth={1.5} />
                            </Glyph>
                            <Name>{section.name}</Name>
                        </Tile>
                    ))}
                </Grid>
            </Content>
        </Screen>
    );
}
