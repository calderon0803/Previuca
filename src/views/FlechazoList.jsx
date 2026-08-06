import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { useFlechazo } from '../contexts/FlechazoContext';
import { IoAdd, IoClose, IoPerson } from 'react-icons/io5';
import { Heart } from 'lucide-react';
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

const FlechazoCard = styled.div`
  background: ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accentMuted : theme.colors.surface)};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(5)};
  border: 1px solid ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accent : theme.colors.border)};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FlechazoName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme, $isMatch }) => ($isMatch ? theme.colors.accent : theme.colors.text.primary)};
`;

const MatchBadge = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.colors.accent};
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

export default function FlechazoList() {
  const navigate = useNavigate();
  const {
    user,
    flechazos,
    matches,
    logout,
    loadFlechazos,
    addFlechazo,
    removeFlechazo,
    loading,
    isVerified,
    instagramUsername,
    matchedByCount
  } = useFlechazo();
  const { eventId } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFlechazoName, setNewFlechazoName] = useState('');

  useEffect(() => {
    if (eventId) {
      loadFlechazos(eventId);
    }
  }, [eventId]);

  const handleBack = () => {
    navigate(`/eventos/${eventId}`);
  };

  const handleAddClick = () => {
    if (!isVerified) {
      navigate(`/eventos/${eventId}/instagram-verification`);
      return;
    }

    if (flechazos.length >= 5) {
      alert('Has alcanzado el límite de 5 flechazos.');
      return;
    }

    setNewFlechazoName('');
    setIsModalOpen(true);
  };

  const handleConfirmAdd = () => {
    if (newFlechazoName.trim()) {
      addFlechazo(newFlechazoName, eventId);
      setIsModalOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      logout();
      navigate(`/eventos/${eventId}/flechazo`);
    }
  }

  // Generate 5 slots
  const slots = Array(5).fill(null).map((_, i) => flechazos?.[i] || null);

  return (
    <Container>
      <PageHeader title="Mis Flechazos" onBack={handleBack} />
      <Content>
        {!isVerified && (
          <div style={{ marginBottom: '20px' }}>
            <Button variant="secondary" fullWidth size="lg" onClick={() => navigate(`/eventos/${eventId}/instagram-verification`)}>
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
          {slots.map((flechazo, index) => {
            const isMatch = flechazo && matches.includes(flechazo);
            return (
              <React.Fragment key={index}>
                {flechazo ? (
                  <FlechazoCard $isMatch={isMatch}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {isMatch && <MatchBadge><Heart size={16} fill="currentColor" /></MatchBadge>}
                      <FlechazoName $isMatch={isMatch}>@{flechazo}</FlechazoName>
                    </div>
                    <IconButton size="sm" variant="ghost" onClick={() => removeFlechazo(index, eventId)} aria-label="Eliminar">
                      <IoClose color="#E5484D" />
                    </IconButton>
                  </FlechazoCard>
                ) : (
                  <EmptySlot onClick={handleAddClick}>
                    <IoAdd size={20} />
                    <span style={{ marginLeft: 8 }}>Añadir Flechazo</span>
                  </EmptySlot>
                )}
              </React.Fragment>
            );
          })}
        </ListContainer>
      </Content>

      <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalTitle>Nuevo Flechazo</ModalTitle>
        <div style={{ marginBottom: '20px' }}>
          <Input
            placeholder="Usuario (sin espacios)"
            value={newFlechazoName}
            onChange={e => setNewFlechazoName(e.target.value.replace(/\s/g, ''))}
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
