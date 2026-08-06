import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { useEvent } from '../contexts/EventContext';
import { IoAdd, IoClose, IoPerson } from 'react-icons/io5';
import PageHeader from '../components/ui/PageHeader';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MatchedByInfo = styled.div`
  background: ${({ theme }) => theme.colors.accentMuted};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};

  span {
    display: block;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 6px;
  }

  strong {
    font-size: ${({ theme }) => theme.typography.fontSize.xxl};
    color: ${({ theme }) => theme.colors.accent};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const CrushCard = styled.div`
  background: ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accentMuted : theme.colors.surface)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accent : theme.colors.border)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CrushName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accent : theme.colors.text.primary)};
`;

const MatchBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const EmptySlot = styled.div`
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: border-color ${({ theme }) => theme.transitions.fast},
    background ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export default function CrushList() {
  const navigate = useNavigate();
  const {
    user,
    crushes,
    matches,
    logout,
    loadCrushes,
    addCrush,
    removeCrush,
    loading,
    isVerified,
    instagramUsername,
    matchedByCount
  } = useCrush();
  const { eventId } = useEvent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCrushName, setNewCrushName] = useState('');

  useEffect(() => {
    if (eventId) {
      loadCrushes(eventId);
    }
  }, [eventId]);

  const handleBack = () => {
    navigate('/eventos');
  };

  const handleAddClick = () => {
    if (!isVerified) {
      navigate('/instagram-verification');
      return;
    }

    if (crushes.length >= 5) {
      alert('Has alcanzado el límite de 5 crushes.');
      return;
    }

    setNewCrushName('');
    setIsModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (newCrushName.trim()) {
      addCrush(newCrushName, eventId);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
      navigate('/crush');
    }
  }

  // Generate 5 slots
  const slots = Array(5).fill(null).map((_, i) => crushes?.[i] || null);

  return (
    <Container>
      <PageHeader title="Mis Crushes" onBack={handleBack} />
      <Content>
        {!isVerified && (
          <div style={{ marginBottom: '20px' }}>
            <Button variant="secondary" fullWidth size="lg" onClick={() => navigate('/instagram-verification')}>
              Verificar Instagram
            </Button>
          </div>
        )}

        {isVerified && (
          <>
            <UserInfo>
              <span>@{instagramUsername}</span>
              <IoPerson />
            </UserInfo>

            <MatchedByInfo>
              <span>Personas que te tienen en su lista</span>
              <strong>{matchedByCount}</strong>
            </MatchedByInfo>
          </>
        )}

        <ListContainer>
          {slots.map((crush, index) => {
            const isMatch = crush && matches.includes(crush);
            return (
              <React.Fragment key={index}>
                {crush ? (
                  <CrushCard $isMatch={isMatch}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isMatch && <MatchBadge>❤️</MatchBadge>}
                      <CrushName $isMatch={isMatch}>@{crush}</CrushName>
                    </div>
                    <IconButton size="sm" variant="ghost" onClick={() => removeCrush(index, eventId)} aria-label="Eliminar">
                      <IoClose color="#E5484D" />
                    </IconButton>
                  </CrushCard>
                ) : (
                  <EmptySlot onClick={handleAddClick}>
                    <IoAdd size={20} />
                    <span style={{ marginLeft: 8 }}>Añadir Crush</span>
                  </EmptySlot>
                )}
              </React.Fragment>
            );
          })}
        </ListContainer>
      </Content>

      <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalTitle>Nuevo Crush</ModalTitle>
        <div style={{ marginBottom: '20px' }}>
          <Input
            placeholder="Usuario (sin espacios)"
            value={newCrushName}
            onChange={e => setNewCrushName(e.target.value.replace(/\s/g, ''))}
            autoFocus
          />
        </div>
        <ButtonGroup>
          <Button variant="secondary" fullWidth onClick={() => setIsModalOpen(false)}>Cancelar</Button>
          <Button fullWidth onClick={handleConfirmAdd}>Añadir</Button>
        </ButtonGroup>
      </Modal>
    </Container>
  );
}
