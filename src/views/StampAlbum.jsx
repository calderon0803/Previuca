import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoScanOutline } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent } from '../services/penasService';
import { getUnlockedStamps } from '../services/stampService';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
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
  padding-bottom: ${({ theme }) => theme.spacing(12)};
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const ProgressText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin: 0 0 ${({ theme }) => theme.spacing(6)} 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StampTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
`;

const StampName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, $locked }) => ($locked ? theme.colors.text.secondary : theme.colors.text.primary)};
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

const StampModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const ScanButtonWrap = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(6)};
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;

const ScanButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  border: none;
  border-radius: ${({ theme }) => theme.radii.pill};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

export default function StampAlbum() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user, loading: flechazoLoading } = useFlechazo();
    const [penas, setPenas] = useState([]);
    const [unlockedIds, setUnlockedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedPena, setSelectedPena] = useState(null);

    useEffect(() => {
        if (flechazoLoading || !user?.id) return;

        let active = true;
        setLoading(true);

        Promise.all([
            getPenasByEvent(eventId),
            getUnlockedStamps(user.id, eventId),
        ]).then(([penasResult, unlockedResult]) => {
            if (!active) return;
            setPenas(penasResult.penas);
            setUnlockedIds(new Set(unlockedResult.penaIds));
            setLoading(false);
        });

        return () => { active = false; };
    }, [eventId, user?.id, flechazoLoading]);

    const unlockedCount = penas.filter((p) => unlockedIds.has(p.id)).length;

    return (
        <Container>
            <PageHeader title="Álbum de sellos" onBack={() => navigate(`/eventos/${eventId}`)} />
            <Content>
                {!loading && penas.length > 0 && (
                    <ProgressText>{unlockedCount} de {penas.length} sellos coleccionados</ProgressText>
                )}

                {loading ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : penas.length === 0 ? (
                    <EmptyText>Todavía no hay ninguna peña en este evento.</EmptyText>
                ) : (
                    <Grid>
                        {penas.map((pena) => {
                            const isUnlocked = unlockedIds.has(pena.id);
                            return (
                                <StampTile key={pena.id} onClick={() => setSelectedPena(pena)}>
                                    <PenaStamp pena={pena} size={72} locked={!isUnlocked} />
                                    <StampName $locked={!isUnlocked}>{pena.name}</StampName>
                                </StampTile>
                            );
                        })}
                    </Grid>
                )}
            </Content>

            <ScanButtonWrap>
                <ScanButton onClick={() => navigate(`/eventos/${eventId}/album/escanear`)}>
                    <IoScanOutline size={20} />
                    Escanear sello
                </ScanButton>
            </ScanButtonWrap>

            <Modal visible={!!selectedPena} onClose={() => setSelectedPena(null)}>
                {selectedPena && (
                    <StampModalBody>
                        <ModalTitle>{selectedPena.name}</ModalTitle>
                        <PenaStamp pena={selectedPena} size={160} locked={!unlockedIds.has(selectedPena.id)} />
                        <ModalHint>
                            {unlockedIds.has(selectedPena.id)
                                ? 'Sello coleccionado.'
                                : 'Todavía no has desbloqueado este sello. Escanéalo desde el perfil de esa peña.'}
                        </ModalHint>
                    </StampModalBody>
                )}
            </Modal>
        </Container>
    );
}
