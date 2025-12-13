import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useCrush } from '../contexts/CrushContext';
import { IoArrowBack, IoAdd, IoClose, IoPerson, IoLogOut, IoLogoInstagram } from 'react-icons/io5';
import { getInstagramVerification } from '../services/instagramService';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const IconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text.primary};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;

const UserInfo = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const MatchedByInfo = styled.div`
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1));
  border: 2px solid rgba(255, 215, 0, 0.3);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
  
  span {
    display: block;
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 5px;
  }
  
  strong {
    font-size: 24px;
    color: #FFD700;
    font-weight: bold;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CrushCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CrushName = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
`;

const EmptySlot = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const InputOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
`;

const InputCard = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: 24px;
  border-radius: 20px;
  width: 100%;
  max-width: 350px;
`;

const ModalTitle = styled.h3`
  color: #fff;
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #ccc;
  background: #fff;
  color: #000;
  font-size: 16px;
  margin-bottom: 20px;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const ModalButton = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  background: ${props => props.$cancel ? '#444' : props.theme.colors.secondary};
  color: ${props => props.$cancel ? '#fff' : '#000'};
`;

const VerifyButton = styled.button`
  width: 100%;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid ${({ theme }) => theme.colors.secondary};
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
    color: #000;
  }
`;

export default function CrushList() {
    const navigate = useNavigate();
    const { user, crushes, logout, addCrush, removeCrush } = useCrush();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCrushName, setNewCrushName] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [instagramUsername, setInstagramUsername] = useState('');
    const [isCheckingVerification, setIsCheckingVerification] = useState(true);
    const [matchedByCount, setMatchedByCount] = useState(0);

    useEffect(() => {
        let isMounted = true;
        
        const checkVerification = async () => {
            if (!user?.id) {
                setIsCheckingVerification(false);
                return;
            }
            
            try {
                const result = await getInstagramVerification(user.id);
                if (isMounted) {
                    setIsVerified(result?.data?.is_verified || false);
                    setInstagramUsername(result?.data?.instagram_username || user?.email?.split('@')[0] || 'Usuario');
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error checking verification:', error);
                    setIsVerified(false);
                    setInstagramUsername(user?.email?.split('@')[0] || 'Usuario');
                }
            } finally {
                if (isMounted) {
                    setIsCheckingVerification(false);
                }
            }
        };

        checkVerification();
        
        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    useEffect(() => {
        let isMounted = true;
        
        const countMatchedBy = async () => {
            if (!instagramUsername || !user?.id) return;
            
            try {
                const { supabase } = await import('../config/supabase');
                const { count, error } = await supabase
                    .from('users_crushes')
                    .select('*', { count: 'exact', head: true })
                    .eq('match_name', instagramUsername);
                
                if (error) throw error;
                if (isMounted) {
                    setMatchedByCount(count || 0);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error counting matched by:', error);
                    setMatchedByCount(0);
                }
            }
        };

        countMatchedBy();
        
        return () => {
            isMounted = false;
        };
    }, [instagramUsername, user?.id]);

    const handleBack = () => {
        navigate('/');
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
            addCrush(newCrushName);
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
            <Header>
                <IconButton onClick={handleBack}>
                    <IoArrowBack size={24} />
                </IconButton>
                <HeaderTitle>Mis Crushes</HeaderTitle>
                <div style={{ width: 40 }} />
            </Header>
            <Content>
                {!isVerified && (
                    <VerifyButton onClick={() => navigate('/instagram-verification')}>
                        Verificar Instagram
                    </VerifyButton>
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
                    {slots.map((crush, index) => (
                        <React.Fragment key={index}>
                            {crush ? (
                                <CrushCard>
                                    <CrushName>@{crush}</CrushName>
                                    <IconButton
                                        style={{ width: 30, height: 30, background: 'rgba(255,50,50,0.2)', border: 'none' }}
                                        onClick={() => removeCrush(index)}
                                    >
                                        <IoClose color="#ff5555" />
                                    </IconButton>
                                </CrushCard>
                            ) : (
                                <EmptySlot onClick={handleAddClick}>
                                    <IoAdd size={24} />
                                    <span style={{ marginLeft: 8 }}>Añadir Crush</span>
                                </EmptySlot>
                            )}
                        </React.Fragment>
                    ))}
                </ListContainer>
            </Content>

            {isModalOpen && (
                <InputOverlay onClick={() => setIsModalOpen(false)}>
                    <InputCard onClick={e => e.stopPropagation()}>
                        <ModalTitle>Nuevo Crush</ModalTitle>
                        <Input
                            placeholder="Usuario (sin espacios)"
                            value={newCrushName}
                            onChange={e => setNewCrushName(e.target.value.replace(/\s/g, ''))}
                            autoFocus
                        />
                        <ButtonGroup>
                            <ModalButton $cancel onClick={() => setIsModalOpen(false)}>Cancelar</ModalButton>
                            <ModalButton onClick={handleConfirmAdd}>Añadir</ModalButton>
                        </ButtonGroup>
                    </InputCard>
                </InputOverlay>
            )}
        </Container>
    );
}
