import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Trash2 } from 'lucide-react';
import { getAllFeedback, deleteFeedback, FEEDBACK_TYPES } from '../services/feedbackService';
import { formatRelativeTime } from '../utils/relativeTime';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import IconButton from '../components/ui/IconButton';

const typeLabel = (value) => FEEDBACK_TYPES.find((t) => t.value === value)?.label || value;

const Container = styled.div`
  min-height: 100dvh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(5)};
  max-width: 640px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const TypeBadge = styled.span`
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryMuted};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
`;

const TimeText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const BodyText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  line-height: 1.4;
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
  white-space: pre-wrap;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const AuthorText = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export default function AdminFeedback() {
    const navigate = useNavigate();
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);

    const loadFeedback = async () => {
        setLoading(true);
        const result = await getAllFeedback();
        setFeedback(result.feedback);
        setLoading(false);
    };

    useEffect(() => {
        loadFeedback();
    }, []);

    const handleDelete = async (item) => {
        const confirmed = window.confirm('¿Borrar este reporte? No se puede deshacer.');
        if (!confirmed) return;

        setBusyId(item.id);
        const result = await deleteFeedback(item.id);
        setBusyId(null);

        if (result.success) {
            setFeedback((prev) => prev.filter((f) => f.id !== item.id));
        } else {
            alert(result.error || 'No se pudo borrar el reporte');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <PageHeader title="Reportes de la app" onBack={() => navigate(-1)} />
            <Content>
                {feedback.length === 0 ? (
                    <EmptyText>No hay reportes todavía.</EmptyText>
                ) : (
                    <List>
                        {feedback.map((item) => (
                            <Card key={item.id}>
                                <TopRow>
                                    <TypeBadge>{typeLabel(item.type)}</TypeBadge>
                                    <TimeText>{formatRelativeTime(item.created_at)}</TimeText>
                                </TopRow>
                                <BodyText>{item.message}</BodyText>
                                <MetaRow>
                                    <AuthorText>{item.authorName}</AuthorText>
                                    <IconButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(item)}
                                        disabled={busyId === item.id}
                                        aria-label="Borrar reporte"
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </MetaRow>
                            </Card>
                        ))}
                    </List>
                )}
            </Content>
        </Container>
    );
}
