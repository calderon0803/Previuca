import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, MessageCircle, Reply, Flag, RefreshCw } from 'lucide-react';
import { useSalseos } from '../contexts/SalseosContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { formatRelativeTime } from '../utils/relativeTime';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';
import ReportModal from '../components/ReportModal';
import SalseoUsernameModal from '../components/SalseoUsernameModal';

const Container = styled.div`
  min-height: 100dvh;
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
`;

const ActionsRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const LoadMoreRow = styled.div`
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

const PostCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  cursor: pointer;
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const AuthorName = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
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

const ActionsBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(5)};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text.secondary)};

  &:disabled {
    cursor: not-allowed;
  }
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: ${({ theme }) => theme.spacing(3)} 0 0 0;
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
        replyFromFeed,
    } = useSalseos();
    const { user, loading: flechazoLoading, salseoUsername } = useFlechazo();
    const [showUsernameModal, setShowUsernameModal] = useState(false);
    const [pendingIntent, setPendingIntent] = useState(null);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [newBody, setNewBody] = useState('');
    const [composeError, setComposeError] = useState('');
    const [publishing, setPublishing] = useState(false);
    const [reportingPostId, setReportingPostId] = useState(null);
    const [reportError, setReportError] = useState('');
    const [reporting, setReporting] = useState(false);
    const [replyingPostId, setReplyingPostId] = useState(null);
    const [replyBody, setReplyBody] = useState('');
    const [replyError, setReplyError] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [likingPostIds, setLikingPostIds] = useState(() => new Set());

    useEffect(() => {
        if (flechazoLoading) return;
        loadPosts(eventId);
    }, [eventId, user?.id, flechazoLoading]);

    const handlePublish = async () => {
        setPublishing(true);
        setComposeError('');
        const result = await createPost(eventId, newBody);
        setPublishing(false);
        if (result.success) {
            setShowComposeModal(false);
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
        setShowComposeModal(true);
    };

    const handleReplyClick = (event, postId) => {
        event.stopPropagation();
        if (!salseoUsername) {
            setPendingIntent({ type: 'reply', postId });
            setShowUsernameModal(true);
            return;
        }
        setReplyError('');
        setReplyBody('');
        setReplyingPostId(postId);
    };

    const handleUsernameChosen = () => {
        setShowUsernameModal(false);
        if (pendingIntent?.type === 'compose') {
            setShowComposeModal(true);
        } else if (pendingIntent?.type === 'reply') {
            setReplyError('');
            setReplyBody('');
            setReplyingPostId(pendingIntent.postId);
        }
        setPendingIntent(null);
    };

    const handleReplySubmit = async () => {
        setSendingReply(true);
        setReplyError('');
        const result = await replyFromFeed(replyingPostId, eventId, replyBody);
        setSendingReply(false);
        if (result.success) {
            setReplyingPostId(null);
            setReplyBody('');
        } else {
            setReplyError(result.error || 'No se pudo enviar la respuesta');
        }
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
        <Container>
            <PageHeader
                title="Salseo"
                onBack={() => navigate(-1)}
                rightAction={
                    <IconButton variant="ghost" onClick={() => loadPosts(eventId, { force: true })} aria-label="Recargar">
                        <RefreshCw size={18} />
                    </IconButton>
                }
            />
            <Content>
                <ActionsRow>
                    <Button fullWidth onClick={handleComposeClick}>
                        Nuevo mensaje
                    </Button>
                </ActionsRow>

                {posts.length === 0 ? (
                    <EmptyText>Todavía no hay ningún mensaje en este evento. ¡Sé el primero!</EmptyText>
                ) : (
                    <List>
                        {posts.map((post) => (
                            <PostCard key={post.id} onClick={() => navigate(`/eventos/${eventId}/salseos/${post.id}`)}>
                                <AuthorRow>
                                    <AuthorName>{post.authorName}</AuthorName>
                                    <TimeText>{formatRelativeTime(post.created_at)}</TimeText>
                                </AuthorRow>
                                <BodyText>{post.body}</BodyText>
                                <ActionsBar>
                                    <ActionButton
                                        $active={post.likedByMe}
                                        disabled={likingPostIds.has(post.id)}
                                        onClick={(e) => handleLikeClick(e, post.id)}
                                    >
                                        <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} />
                                        {post.likeCount}
                                    </ActionButton>
                                    <ActionButton onClick={(e) => handleReplyClick(e, post.id)} aria-label="Responder">
                                        <Reply size={16} />
                                    </ActionButton>
                                    <ActionButton>
                                        <MessageCircle size={16} />
                                        {post.replyCount}
                                    </ActionButton>
                                    {post.author_id !== user?.id && (
                                        <ActionButton
                                            $active={post.reportedByMe}
                                            disabled={post.reportedByMe}
                                            onClick={(e) => handleReportClick(e, post.id)}
                                        >
                                            <Flag size={16} fill={post.reportedByMe ? 'currentColor' : 'none'} />
                                            {post.reportedByMe ? 'Reportado' : 'Reportar'}
                                        </ActionButton>
                                    )}
                                </ActionsBar>
                            </PostCard>
                        ))}
                    </List>
                )}

                {hasMorePosts && (
                    <LoadMoreRow>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => loadMorePosts(eventId)}
                            disabled={loadingMore}
                        >
                            {loadingMore ? 'Cargando...' : 'Cargar más mensajes'}
                        </Button>
                    </LoadMoreRow>
                )}
            </Content>

            <Modal
                visible={showComposeModal}
                onClose={() => {
                    setShowComposeModal(false);
                    setComposeError('');
                }}
            >
                <ModalTitle>Nuevo mensaje</ModalTitle>
                <Textarea
                    placeholder="¿Qué está pasando?"
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                />
                {composeError && <ErrorText>{composeError}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setShowComposeModal(false)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handlePublish} disabled={!newBody.trim() || publishing}>
                        {publishing ? 'Publicando...' : 'Publicar'}
                    </Button>
                </div>
            </Modal>

            <ReportModal
                visible={reportingPostId !== null}
                onClose={() => setReportingPostId(null)}
                onSubmit={handleReportSubmit}
                submitting={reporting}
                error={reportError}
            />

            <Modal
                visible={replyingPostId !== null}
                onClose={() => {
                    setReplyingPostId(null);
                    setReplyError('');
                }}
            >
                <ModalTitle>Responder</ModalTitle>
                <Textarea
                    placeholder="Escribe una respuesta..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                />
                {replyError && <ErrorText>{replyError}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setReplyingPostId(null)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handleReplySubmit} disabled={!replyBody.trim() || sendingReply}>
                        {sendingReply ? 'Enviando...' : 'Responder'}
                    </Button>
                </div>
            </Modal>

            <SalseoUsernameModal
                visible={showUsernameModal}
                onClose={() => {
                    setShowUsernameModal(false);
                    setPendingIntent(null);
                }}
                onSuccess={handleUsernameChosen}
            />
        </Container>
    );
}
