import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoKeyOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { usePenas } from '../contexts/PenasContext';
import { getPenaMembers } from '../services/penasService';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Photo = styled.div`
  height: 220px;
  background: ${({ $color, $image }) => ($image ? `url(${$image})` : $color)};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: ${({ theme }) => theme.spacing(5)};
  box-sizing: border-box;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(10, 11, 14, 0.75), transparent 60%);
  }
`;

const PenaName = styled.h1`
  color: #fff;
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.tight};
  margin: 0;
  position: relative;
  z-index: 1;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const SectionEyebrow = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
`;

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const MemberName = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const CodeValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.accent};
  letter-spacing: 0.15em;
  font-family: monospace;
  text-align: center;
  margin: ${({ theme }) => theme.spacing(5)} 0;
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  text-align: center;
`;

const ModalHint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: 0;
`;

export default function PenaDetail() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { penas, myPena } = usePenas();
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(true);
    const [showCodeModal, setShowCodeModal] = useState(false);

    const pena = penas.find((p) => p.id === id) || (myPena?.id === id ? myPena : null);

    useEffect(() => {
        if (!id) return;
        setLoadingMembers(true);
        getPenaMembers(id).then((result) => {
            setMembers(result.members);
            setLoadingMembers(false);
        });
    }, [id]);

    if (!pena) {
        return (
            <Container>
                <PageHeader title="Peña" onBack={() => navigate('/fiestas/penas')} />
                <Content>
                    <EmptyText>No se encontró esta peña.</EmptyText>
                </Content>
            </Container>
        );
    }

    const isOwnPena = myPena?.id === id;

    return (
        <Container>
            <PageHeader title="" onBack={() => navigate('/fiestas/penas')} />
            <Photo $color={pena.color} $image={pena.image_url}>
                <PenaName>{pena.name}</PenaName>
            </Photo>
            <Content>
                <SectionLabel>
                    <SectionEyebrow>Miembros ({members.length})</SectionEyebrow>
                </SectionLabel>

                {loadingMembers ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : members.length === 0 ? (
                    <EmptyText>Todavía no hay miembros.</EmptyText>
                ) : (
                    <MemberList>
                        {members.map((member) => (
                            <MemberRow key={member.user_id}>
                                <IoPersonCircleOutline size={22} color="#7C818C" />
                                <MemberName>{member.displayName}</MemberName>
                            </MemberRow>
                        ))}
                    </MemberList>
                )}

                {isOwnPena && (
                    <Button variant="secondary" onClick={() => setShowCodeModal(true)}>
                        <IoKeyOutline size={16} />
                        Ver código
                    </Button>
                )}
            </Content>

            <Modal visible={showCodeModal} onClose={() => setShowCodeModal(false)}>
                <ModalTitle>Código de la peña</ModalTitle>
                <CodeValue>{pena.code}</CodeValue>
                <ModalHint>Compártelo con quien quieras que se una a «{pena.name}».</ModalHint>
            </Modal>
        </Container>
    );
}
