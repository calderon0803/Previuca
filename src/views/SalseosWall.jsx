import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, MessageCircle, Flag, Pencil } from 'lucide-react';
import { useSalseos } from '../contexts/SalseosContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { formatRelativeTime } from '../utils/relativeTime';
import { activityColors } from '../styles/theme';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import BottomSheet, { SheetTitle } from '../components/ui/BottomSheet';
import LoadingScreen from '../components/ui/LoadingScreen';
import ReportModal from '../components/ReportModal';
import SalseoUsernameModal from '../components/SalseoUsernameModal';

const SALSEO = activityColors.salseo;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const PostCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(3.5)} ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
  transition: box-shadow ${({ theme }) => theme.transitions.fast};

  &:hover {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  }
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Author = styled.span`
  font-size: 13px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accentText};
`;

const Time = styled.span`
  font-size: 11.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const Body = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(3)};
  font-size: 15px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text.primary};
  text-wrap: pretty;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const BarAction = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  padding: 0;
  font-size: 13px;
  color: ${({ theme, $active }) =>
        $active ? theme.colors.accentText : theme.colors.text.muted};

  &:disabled {
    cursor: default;
  }
`;

const ReportAction = styled(BarAction)`
  margin-left: auto;
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const Empty = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.faint};
`;

const LoadMore = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const ErrorText = styled.p`
  margin: ${({ theme }) => theme.spacing(2.5)} 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.error};
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(2.5)};
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

export default function SalseosWall() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const {
        posts,
        loading,
        loadingMore,
        hasMorePosts,
        loadPosts,
        loadMorePosts,
        createPost,
        toggleLike,
        reportPost,
    } = useSalseos();
    const { user, loading: flechazoLoading, salseoUsername } = useFlechazo();
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [pendingIntent, setPendingIntent] = useState(null);
    const [composeOpen, setComposeOpen] = useState(false);
    const [newBody, setNewBody] = useState('');
    const [composeError, setComposeError] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [reportingPostId, setReportingPostId] = useState(null);
    const [reportError, setReportError] = useState('');
    const [reporting, setReporting] = useState(false);
    const [likingPostIds, setLikingPostIds] = useState(() => new Set());

    useEffect(() => {
        if (flechazoLoading) return;
        loadPosts(eventId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId, user?.id, flechazoLoading]);

    const handlePublish = async () => {
        setPublishing(true);
        setComposeError('');
        const result = await createPost(eventId, newBody);
        setPublishing(false);
        if (result.success) {
            setComposeOpen(false);
            setNewBody('');
        } else {
            setComposeError(result.error || 'No se pudo publicar el mensaje');
        }
    };

    const handleLikeClick = async (event, postId) => {
        event.stopPropagation();
        if (likingPostIds.has(postId)) return;

        setLikingPostIds((prev) => new Set(prev).add(postId));
        try {
            await toggleLike(postId, eventId);
        } finally {
            setLikingPostIds((prev) => {
                const next = new Set(prev);
                next.delete(postId);
                return next;
            });
        }
    };

    const handleComposeClick = () => {
        if (!salseoUsername) {
            setPendingIntent({ type: 'compose' });
            setShowUsernameModal(true);
            return;
        }
        setComposeOpen(true);
    };

    const handleUsernameChosen = () => {
        setShowUsernameModal(false);
        // Responder vive en el detalle del salseo, no en el muro.
        if (pendingIntent?.type === 'compose') setComposeOpen(true);
        setPendingIntent(null);
    };

    const handleReportClick = (event, postId) => {
        event.stopPropagation();
        setReportError('');
        setReportingPostId(postId);
    };

    const handleReportSubmit = async (reason) => {
        setReporting(true);
        setReportError('');
        const result = await reportPost(reportingPostId, eventId, reason);
        setReporting(false);
        if (result.success) {
            setReportingPostId(null);
        } else {
            setReportError(result.error || 'No se pudo enviar el reporte');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Screen>
            <PageHeader
                kicker="Salseo"
                kickerColor={SALSEO.kicker}
                status="Anónimo, dentro del evento"
                onBack={() => navigate(-1)}
                rightAction={
                    <IconButton variant="outline" onClick={handleComposeClick} aria-label="Escribir">
                        <Pencil size={19} />
                    </IconButton>
                }
            />
            <Content>
                {posts.length === 0 ? (
                    <Empty>Todavía no hay ningún mensaje en este evento. Sé el primero.</Empty>
                ) : (
                    <List>
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                onClick={() => navigate(`/eventos/${eventId}/salseos/${post.id}`)}
                            >
                                <AuthorRow>
                                    <Author>{post.authorName}</Author>
                                    <Time>{formatRelativeTime(post.created_at)}</Time>
                                </AuthorRow>
                                <Body>{post.body}</Body>
                                <Bar>
                                    <BarAction
                                        $active={post.likedByMe}
                                        disabled={likingPostIds.has(post.id)}
                                        onClick={(e) => handleLikeClick(e, post.id)}
                                        aria-label="Me gusta"
                                    >
                                        <Heart
                                            size={16}
                                            fill={post.likedByMe ? 'currentColor' : 'none'}
                                        />
                                        {post.likeCount}
                                    </BarAction>
                                    <BarAction as="span">
                                        <MessageCircle size={16} />
                                        {post.replyCount}
                                    </BarAction>
                                    {post.author_id !== user?.id && (
                                        <ReportAction
                                            disabled={post.reportedByMe}
                                            onClick={(e) => handleReportClick(e, post.id)}
                                        >
                                            <Flag
                                                size={15}
                                                fill={post.reportedByMe ? 'currentColor' : 'none'}
                                            />
                                            {post.reportedByMe ? 'Reportado' : 'Reportar'}
                                        </ReportAction>
                                    )}
                                </Bar>
                            </PostCard>
                        ))}
                    </List>
                )}

                {hasMorePosts && (
                    <LoadMore>
                        <Button
                            variant="secondary"
                            size="md"
                            fullWidth
                            onClick={() => loadMorePosts(eventId)}
                            disabled={loadingMore}
                        >
                            {loadingMore ? 'Cargando...' : 'Cargar más mensajes'}
                        </Button>
                    </LoadMore>
                )}
            </Content>

            <BottomSheet
                visible={composeOpen}
                onClose={() => {
                    setComposeOpen(false);
                    setComposeError('');
                }}
            >
                <SheetTitle>Nuevo salseo</SheetTitle>
                <div style={{ height: 14 }} />
                <Textarea
                    placeholder="¿Qué está pasando?"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                />
                {composeError && <ErrorText>{composeError}</ErrorText>}
                <Actions>
                    <Button variant="secondary" size="md" onClick={() => setComposeOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        size="md"
                        onClick={handlePublish}
                        disabled={!newBody.trim() || publishing}
                    >
                        {publishing ? 'Publicando...' : 'Publicar'}
                    </Button>
                </Actions>
            </BottomSheet>

            <ReportModal
                visible={reportingPostId !== null}
                onClose={() => setReportingPostId(null)}
                onSubmit={handleReportSubmit}
                submitting={reporting}
                error={reportError}
            />

            <SalseoUsernameModal
                visible={showUsernameModal}
                onClose={() => {
                    setShowUsernameModal(false);
                    setPendingIntent(null);
                }}
                onSuccess={handleUsernameChosen}
            />
        </Screen>
    );
}
