import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Flag, Trash2 } from 'lucide-react';
import { useSalseos } from '../contexts/SalseosContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { useAdmin } from '../contexts/AdminContext';
import { getRepliesByPost, createReply, deleteReply, reportReply as reportReplyService } from '../services/salseosService';
import { formatRelativeTime } from '../utils/relativeTime';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import IconButton from '../components/ui/IconButton';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import ReportModal from '../components/ReportModal';
import SalseoUsernameModal from '../components/SalseoUsernameModal';

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
`;

const PostCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const AuthorNameGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
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

const SectionEyebrow = styled.span`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ReplyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ReplyCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const ReplyBody = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.4;
  margin: ${({ theme }) => theme.spacing(1)} 0 0 0;
  white-space: pre-wrap;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ComposeRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0;
`;

export default function SalseoDetail() {
    const navigate = useNavigate();
    const { eventId, postId } = useParams();
    const { posts, loading: postsLoading, loadPosts, deletePost, toggleLike, reportPost } = useSalseos();
    const { user, loading: flechazoLoading, salseoUsername } = useFlechazo();
    const { isAdmin } = useAdmin();
    const [replies, setReplies] = useState([]);
    const [loadingReplies, setLoadingReplies] = useState(true);
    const [replyBody, setReplyBody] = useState('');
    const [replyError, setReplyError] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);
    const [reportingTarget, setReportingTarget] = useState(null); // { type: 'post' | 'reply', id }
    const [reportError, setReportError] = useState('');
    const [reporting, setReporting] = useState(false);
    const [showUsernameModal, setShowUsernameModal] = useState(false);

    const post = posts.find((p) => p.id === postId);

    useEffect(() => {
        if (flechazoLoading) return;
        loadPosts(eventId);
    }, [eventId, user?.id, flechazoLoading]);

    const refreshReplies = () => {
        setLoadingReplies(true);
        getRepliesByPost(postId, user.id).then((result) => {
            setReplies(result.replies);
            setLoadingReplies(false);
        });
    };

    useEffect(() => {
        if (!postId) return;
        refreshReplies();
    }, [postId]);

    const canDelete = (authorId) => user?.id === authorId || isAdmin;

    const handleDeletePost = async () => {
        const confirmed = window.confirm('¿Seguro que quieres borrar este mensaje? No se puede deshacer.');
        if (!confirmed) return;

        const result = await deletePost(postId, eventId);
        if (result.success) {
            navigate(`/eventos/${eventId}/salseos`, { replace: true });
        } else {
            alert(result.error || 'No se pudo borrar el mensaje');
        }
    };

    const handleDeleteReply = async (replyId) => {
        const confirmed = window.confirm('¿Seguro que quieres borrar esta respuesta?');
        if (!confirmed) return;

        const result = await deleteReply(replyId);
        if (result.success) {
            refreshReplies();
            loadPosts(eventId, { force: true });
        } else {
            alert(result.error || 'No se pudo borrar la respuesta');
        }
    };

    const handleReportSubmit = async (reason) => {
        if (!reportingTarget) return;

        setReporting(true);
        setReportError('');

        const result = reportingTarget.type === 'post'
            ? await reportPost(reportingTarget.id, eventId, reason)
            : await reportReplyService({ eventId, replyId: reportingTarget.id, reporterId: user.id, reason });

        setReporting(false);

        if (result.success) {
            if (reportingTarget.type === 'reply') {
                setReplies((prev) =>
                    prev.map((r) => (r.id === reportingTarget.id ? { ...r, reportedByMe: true } : r))
                );
            }
            setReportingTarget(null);
        } else {
            setReportError(result.error || 'No se pudo enviar el reporte');
        }
    };

    const handleSubmitReply = async () => {
        if (!replyBody.trim()) return;

        if (!salseoUsername) {
            setShowUsernameModal(true);
            return;
        }

        setSubmittingReply(true);
        setReplyError('');
        const result = await createReply({ postId, eventId, authorId: user.id, body: replyBody });
        setSubmittingReply(false);

        if (result.success) {
            setReplyBody('');
            refreshReplies();
            loadPosts(eventId, { force: true });
        } else {
            setReplyError(result.error || 'No se pudo publicar la respuesta');
        }
    };

    if (flechazoLoading || postsLoading) return <LoadingScreen />;

    if (!post) {
        return (
            <Container>
                <PageHeader title="Salseo" onBack={() => navigate(-1)} />
                <Content>
                    <EmptyText>No se encontró este mensaje.</EmptyText>
                </Content>
            </Container>
        );
    }

    return (
        <Container>
            <PageHeader title="Salseo" onBack={() => navigate(-1)} />
            <Content>
                <PostCard>
                    <AuthorRow>
                        <AuthorNameGroup>
                            <AuthorName>{post.authorName}</AuthorName>
                            <TimeText>{formatRelativeTime(post.created_at)}</TimeText>
                        </AuthorNameGroup>
                        {canDelete(post.author_id) && (
                            <IconButton variant="ghost" size="sm" onClick={handleDeletePost} aria-label="Borrar mensaje">
                                <Trash2 size={16} />
                            </IconButton>
                        )}
                    </AuthorRow>
                    <BodyText>{post.body}</BodyText>
                    <ActionsBar>
                        <ActionButton $active={post.likedByMe} onClick={() => toggleLike(post.id, eventId)}>
                            <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} />
                            {post.likeCount}
                        </ActionButton>
                        {post.author_id !== user?.id && (
                            <ActionButton
                                $active={post.reportedByMe}
                                disabled={post.reportedByMe}
                                onClick={() => {
                                    setReportError('');
                                    setReportingTarget({ type: 'post', id: post.id });
                                }}
                            >
                                <Flag size={16} fill={post.reportedByMe ? 'currentColor' : 'none'} />
                                {post.reportedByMe ? 'Reportado' : 'Reportar'}
                            </ActionButton>
                        )}
                    </ActionsBar>
                </PostCard>

                <SectionEyebrow>Respuestas ({replies.length})</SectionEyebrow>

                {loadingReplies ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : replies.length === 0 ? (
                    <EmptyText>Todavía no hay respuestas.</EmptyText>
                ) : (
                    <ReplyList>
                        {replies.map((reply) => (
                            <ReplyCard key={reply.id}>
                                <AuthorRow>
                                    <AuthorNameGroup>
                                        <AuthorName>{reply.authorName}</AuthorName>
                                        <TimeText>{formatRelativeTime(reply.created_at)}</TimeText>
                                    </AuthorNameGroup>
                                    {canDelete(reply.author_id) && (
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteReply(reply.id)}
                                            aria-label="Borrar respuesta"
                                        >
                                            <Trash2 size={14} />
                                        </IconButton>
                                    )}
                                </AuthorRow>
                                <ReplyBody>{reply.body}</ReplyBody>
                                {reply.author_id !== user?.id && (
                                    <ActionsBar style={{ marginTop: '8px' }}>
                                        <ActionButton
                                            $active={reply.reportedByMe}
                                            disabled={reply.reportedByMe}
                                            onClick={() => {
                                                setReportError('');
                                                setReportingTarget({ type: 'reply', id: reply.id });
                                            }}
                                        >
                                            <Flag size={14} fill={reply.reportedByMe ? 'currentColor' : 'none'} />
                                            {reply.reportedByMe ? 'Reportado' : 'Reportar'}
                                        </ActionButton>
                                    </ActionsBar>
                                )}
                            </ReplyCard>
                        ))}
                    </ReplyList>
                )}

                <ComposeRow>
                    <Textarea
                        placeholder="Escribe una respuesta..."
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                    />
                    {replyError && <ErrorText>{replyError}</ErrorText>}
                    <Button onClick={handleSubmitReply} disabled={!replyBody.trim() || submittingReply}>
                        {submittingReply ? 'Enviando...' : 'Responder'}
                    </Button>
                </ComposeRow>
            </Content>

            <ReportModal
                visible={reportingTarget !== null}
                onClose={() => setReportingTarget(null)}
                onSubmit={handleReportSubmit}
                submitting={reporting}
                error={reportError}
            />

            <SalseoUsernameModal
                visible={showUsernameModal}
                onClose={() => setShowUsernameModal(false)}
                onSuccess={() => {
                    setShowUsernameModal(false);
                    handleSubmitReply();
                }}
            />
        </Container>
    );
}
