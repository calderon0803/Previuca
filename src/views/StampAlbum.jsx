import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ScanLine } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getPenasByEvent } from '../services/penasService';
import { getUnlockedStamps } from '../services/stampService';
import { activityColors } from '../styles/theme';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content, Footer } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import LoadingScreen from '../components/ui/LoadingScreen';

const ALBUM = activityColors.album;

// Barra de progreso de 2px justo bajo la cabecera.
const ProgressTrack = styled.div`
  flex-shrink: 0;
  height: 2px;
  margin: 0 ${({ theme }) => theme.spacing(5)};
  background: ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 2px;
  background: ${ALBUM.color};
  width: ${({ $pct }) => $pct}%;
  transition: width 0.3s ease;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing(4.5)};
`;

const Tile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  background: none;
  padding: 0;
`;

const TileName = styled.span`
  font-size: 11.5px;
  color: ${({ theme, $locked }) => ($locked ? theme.colors.text.faint : theme.colors.text.primary)};
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Empty = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.faint};
  margin: 0;
`;

const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const SheetHint = styled.p`
  margin: 0;
  font-size: 13.5px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.text.muted};
  text-align: center;
`;

const AlbumContent = styled(Content)`
  padding: ${({ theme }) => theme.spacing(5)};
`;

export default function StampAlbum() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { user, loading: flechazoLoading } = useFlechazo();
    const [penas, setPenas] = useState([]);
    const [unlockedIds, setUnlockedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

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

        return () => {
            active = false;
        };
    }, [eventId, user?.id, flechazoLoading]);

    const unlockedCount = penas.filter((p) => unlockedIds.has(p.id)).length;
    const pct = penas.length > 0 ? (unlockedCount / penas.length) * 100 : 0;

    if (loading) return <LoadingScreen />;

    return (
        <Screen>
            <PageHeader
                kicker="Álbum de sellos"
                kickerColor={ALBUM.kicker}
                status={
                    penas.length > 0
                        ? `${unlockedCount} de ${penas.length} sellos coleccionados`
                        : 'Sin peñas todavía'
                }
                onBack={() => navigate(-1)}
            />
            <ProgressTrack>
                <ProgressFill $pct={pct} />
            </ProgressTrack>

            <AlbumContent>
                {penas.length === 0 ? (
                    <Empty>Todavía no hay ninguna peña en este evento.</Empty>
                ) : (
                    <Grid>
                        {penas.map((pena) => {
                            const isUnlocked = unlockedIds.has(pena.id);
                            return (
                                <Tile key={pena.id} onClick={() => setSelected(pena)}>
                                    <PenaStamp pena={pena} size={74} locked={!isUnlocked} />
                                    <TileName $locked={!isUnlocked}>{pena.name}</TileName>
                                </Tile>
                            );
                        })}
                    </Grid>
                )}
            </AlbumContent>

            <Footer>
                <Button
                    size="lg"
                    color={ALBUM.color}
                    fullWidth
                    onClick={() => navigate(`/eventos/${eventId}/album/escanear`)}
                >
                    <ScanLine size={19} />
                    Escanear un sello
                </Button>
            </Footer>

            <BottomSheet visible={!!selected} onClose={() => setSelected(null)}>
                {selected && (
                    <>
                        <SheetTitle>{selected.name}</SheetTitle>
                        <div style={{ height: 18 }} />
                        <SheetBody>
                            <PenaStamp
                                pena={selected}
                                size={132}
                                locked={!unlockedIds.has(selected.id)}
                            />
                            <SheetHint>
                                {unlockedIds.has(selected.id)
                                    ? 'Sello coleccionado.'
                                    : 'Todavía no lo tienes. Pídele a alguien de esa peña que te muestre su sello y escanéalo.'}
                            </SheetHint>
                        </SheetBody>
                    </>
                )}
            </BottomSheet>
        </Screen>
    );
}
