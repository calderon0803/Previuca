import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useFiesta } from '../contexts/FiestaContext';
import GameModeCard from '../components/GameModeCard';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

const subsections = [
    { id: 'penas', name: 'Peñas', icon: '🎪', route: '/fiestas/penas' },
    { id: 'crush', name: 'Crush', icon: '💕', route: '/crush' },
];

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

export default function FiestasHub() {
    const navigate = useNavigate();
    const { hasFiesta, fiestaName, loading } = useFiesta();

    if (loading) return null;

    if (!hasFiesta) {
        return (
            <Container>
                <PageHeader title="Fiestas" onBack={() => navigate('/')} />
                <Content>
                    <LockedState>
                        <LockedTitle>Necesitas un código de fiesta</LockedTitle>
                        <LockedText>
                            Introduce el código de tu fiesta en Ajustes para desbloquear esta sección.
                        </LockedText>
                        <Button size="lg" onClick={() => navigate('/ajustes')}>
                            Ir a Ajustes
                        </Button>
                    </LockedState>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title={fiestaName || 'Fiestas'} onBack={() => navigate('/')} />
            <Content>
                <SectionLabel>
                    <SectionEyebrow>Subsecciones</SectionEyebrow>
                </SectionLabel>
                <Grid>
                    {subsections.map((section) => (
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
