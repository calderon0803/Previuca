import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Heart, Flag, Trash2, SendHorizontal } from 'lucide-react';
import { useSalseos } from '../contexts/SalseosContext';
import { useFlechazo } from '../contexts/FlechazoContext';
import { useAdmin } from '../contexts/AdminContext';
import { getRepliesByPost, createReply, deleteReply, reportReply as reportReplyService } from '../services/salseosService';
import { formatRelativeTime } from '../utils/relativeTime';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content } from '../components/ui/Screen';
import LoadingScreen from '../components/ui/LoadingScreen';
import Input from '../components/ui/Input';
import ConfirmSheet from '../components/ui/ConfirmSheet';
import Kicker from '../components/ui/Kicker';
import ReportModal from '../components/ReportModal';
import SalseoUsernameModal from '../components/SalseoUsernameModal';

const PostCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderStrong};
  padding: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const ReplyCard = styled.div`
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.border};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(3.5)};
`;

const AuthorRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const AuthorGroup = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
`;

const Author = styled.span`
  font-size: ${({ $small }) => ($small ? '12.5px' : '13px')};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.accentText};
`;

const Time = styled.span`
  font-size: ${({ $small }) => ($small ? '11px' : '11.5px')};
  color: ${({ theme }) => theme.colors.text.faint};
`;

const PostBody = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(3.5)};
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};
  text-wrap: pretty;
`;

const ReplyBody = styled.p`
  margin: 5px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.text.primary};
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

const DeleteAction = styled.button`
  width: 32px;
  height: 32px;
  margin: -6px -6px 0 0;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.faint};

  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const RepliesKicker = styled(Kicker)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Replies = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const Empty = styled.p`
  margin: 2px 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.text.faint};
`;

// Pie fijo con el campo de respuesta, separado del contenido por un hairline.
const ComposeBar = styled.div`
  flex-shrink: 0;
  display: flex;
  gap: 9px;
  padding: ${({ theme }) => theme.spacing(2.5)} ${({ theme }) => theme.spacing(5)}
    calc(${({ theme }) => theme.spacing(6.5)} + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  box-sizing: border-box;
`;

const SendButton = styled.button`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.accentText};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background ${({ theme }) => theme.transitions.fast};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentTint};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.p`
  margin: ${({ theme }) => theme.spacing(2.5)} 0 0;
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.error};
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
    const [confirm, setConfirm] = useState(null);

    const post = posts.find((p) => p.id === postId);

    useEffect(() => {
        if (flechazoLoading) return;
        loadPosts(eventId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId]);

    const canDelete = (authorId) => user?.id === authorId || isAdmin;

    const askDeletePost = () =>
        setConfirm({
            title: '¿Borrar este mensaje?',
            text: 'Desaparece del muro con sus respuestas. No se puede deshacer.',
            cta: 'Borrar',
            tone: 'danger',
            run: async () => {
                const result = await deletePost(postId, eventId);
                if (result.success) {
                    navigate(`/eventos/${eventId}/salseos`, { replace: true });
                } else {
                    setReplyError(result.error || 'No se pudo borrar el mensaje');
                }
            },
        });

    const askDeleteReply = (replyId) =>
        setConfirm({
            title: '¿Borrar esta respuesta?',
            text: 'Desaparece del hilo. No se puede deshacer.',
            cta: 'Borrar',
            tone: 'danger',
            run: async () => {
                const result = await deleteReply(replyId);
                if (result.success) {
                    refreshReplies();
                    loadPosts(eventId, { force: true });
                } else {
                    setReplyError(result.error || 'No se pudo borrar la respuesta');
                }
            },
        });

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
            <Screen>
                <PageHeader title="Salseo" onBack={() => navigate(-1)} />
                <Content>
                    <Empty>No se encontró este mensaje.</Empty>
                </Content>
            </Screen>
        );
    }

    return (
        <Screen>
            <PageHeader title="Salseo" onBack={() => navigate(-1)} />
            <Content>
                <PostCard>
                    <AuthorRow>
                        <AuthorGroup>
                            <Author>{post.authorName}</Author>
                            <Time>{formatRelativeTime(post.created_at)}</Time>
                        </AuthorGroup>
                        {canDelete(post.author_id) && (
                            <DeleteAction onClick={askDeletePost} aria-label="Borrar mensaje">
                                <Trash2 size={16} />
                            </DeleteAction>
                        )}
                    </AuthorRow>
                    <PostBody>{post.body}</PostBody>
                    <Bar>
                        <BarAction
                            $active={post.likedByMe}
                            onClick={() => toggleLike(post.id, eventId)}
                            aria-label="Me gusta"
                        >
                            <Heart size={16} fill={post.likedByMe ? 'currentColor' : 'none'} />
                            {post.likeCount}
                        </BarAction>
                        {post.author_id !== user?.id && (
                            <ReportAction
                                disabled={post.reportedByMe}
                                onClick={() => {
                                    setReportError('');
                                    setReportingTarget({ type: 'post', id: post.id });
                                }}
                            >
                                <Flag size={15} fill={post.reportedByMe ? 'currentColor' : 'none'} />
                                {post.reportedByMe ? 'Reportado' : 'Reportar'}
                            </ReportAction>
                        )}
                    </Bar>
                </PostCard>

                <RepliesKicker>Respuestas ({replies.length})</RepliesKicker>

                {loadingReplies ? (
                    <Empty>Cargando...</Empty>
                ) : replies.length === 0 ? (
                    <Empty>Todavía no hay respuestas.</Empty>
                ) : (
                    <Replies>
                        {replies.map((reply) => (
                            <ReplyCard key={reply.id}>
                                <AuthorRow style={{ marginBottom: 0 }}>
                                    <AuthorGroup>
                                        <Author $small>{reply.authorName}</Author>
                                        <Time $small>{formatRelativeTime(reply.created_at)}</Time>
                                    </AuthorGroup>
                                    {canDelete(reply.author_id) && (
                                        <DeleteAction
                                            onClick={() => askDeleteReply(reply.id)}
                                            aria-label="Borrar respuesta"
                                        >
                                            <Trash2 size={14} />
                                        </DeleteAction>
                                    )}
                                </AuthorRow>
                                <ReplyBody>{reply.body}</ReplyBody>
                                {reply.author_id !== user?.id && (
                                    <Bar style={{ marginTop: 10 }}>
                                        <ReportAction
                                            disabled={reply.reportedByMe}
                                            onClick={() => {
                                                setReportError('');
                                                setReportingTarget({ type: 'reply', id: reply.id });
                                            }}
                                        >
                                            <Flag
                                                size={14}
                                                fill={reply.reportedByMe ? 'currentColor' : 'none'}
                                            />
                                            {reply.reportedByMe ? 'Reportado' : 'Reportar'}
                                        </ReportAction>
                                    </Bar>
                                )}
                            </ReplyCard>
                        ))}
                    </Replies>
                )}

                {replyError && <ErrorText>{replyError}</ErrorText>}
            </Content>

            <ComposeBar>
                <Input
                    placeholder="Escribe una respuesta..."
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
                />
                <SendButton
                    onClick={handleSubmitReply}
                    disabled={!replyBody.trim() || submittingReply}
                    aria-label="Enviar respuesta"
                >
                    <SendHorizontal size={19} />
                </SendButton>
            </ComposeBar>

            <ReportModal
                visible={reportingTarget !== null}
                onClose={() => setReportingTarget(null)}
                onSubmit={handleReportSubmit}
                submitting={reporting}
                error={reportError}
            />

            <ConfirmSheet confirm={confirm} onClose={() => setConfirm(null)} />

            <SalseoUsernameModal
                visible={showUsernameModal}
                onClose={() => setShowUsernameModal(false)}
                onSuccess={() => {
                    setShowUsernameModal(false);
                    handleSubmitReply();
                }}
            />
        </Screen>
    );
}
