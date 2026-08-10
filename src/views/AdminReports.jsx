import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Trash2, Mail, Ban } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getReports, sendNotice, setUserBlocked } from '../services/adminService';
import { deletePost, deleteReply, REPORT_REASONS } from '../services/salseosService';
import { formatRelativeTime } from '../utils/relativeTime';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Modal from '../components/ui/Modal';
import Textarea from '../components/ui/Textarea';

const reasonLabel = (value) => REPORT_REASONS.find((r) => r.value === value)?.label || value;

const Container = styled.div`
  min-height: 100vh;
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

const ReasonBadge = styled.span`
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: ${({ theme }) => theme.colors.primaryMuted};
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-transform: uppercase;
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

const MetaRow = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
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

export default function AdminReports() {
    const navigate = useNavigate();
    const { user } = useFlechazo();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyReportId, setBusyReportId] = useState(null);
    const [blockedAuthorIds, setBlockedAuthorIds] = useState(new Set());
    const [noticeTarget, setNoticeTarget] = useState(null);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [sendingNotice, setSendingNotice] = useState(false);
    const [noticeError, setNoticeError] = useState('');

    const loadReports = async () => {
        setLoading(true);
        const result = await getReports();
        setReports(result.reports);
        setLoading(false);
    };

    useEffect(() => {
        loadReports();
    }, []);

    const handleDeleteContent = async (report) => {
        const confirmed = window.confirm('¿Seguro que quieres borrar este contenido? No se puede deshacer.');
        if (!confirmed) return;

        setBusyReportId(report.id);
        const result = report.contentType === 'post'
            ? await deletePost(report.post_id)
            : await deleteReply(report.reply_id);
        setBusyReportId(null);

        if (result.success) {
            loadReports();
        } else {
            alert(result.error || 'No se pudo borrar el contenido');
        }
    };

    const handleBlockAuthor = async (report) => {
        const confirmed = window.confirm(`¿Bloquear a «${report.authorName}»? No podrá seguir usando la app.`);
        if (!confirmed) return;

        setBusyReportId(report.id);
        const result = await setUserBlocked(report.authorId, true, user.id);
        setBusyReportId(null);

        if (result.success) {
            setBlockedAuthorIds((prev) => new Set(prev).add(report.authorId));
        } else {
            alert(result.error || 'No se pudo bloquear al usuario');
        }
    };

    const openNoticeModal = (report) => {
        setNoticeError('');
        setNoticeMessage('');
        setNoticeTarget(report);
    };

    const handleSendNotice = async () => {
        if (!noticeMessage.trim()) return;

        setSendingNotice(true);
        setNoticeError('');
        const result = await sendNotice(noticeTarget.authorId, noticeMessage, noticeTarget.id);
        setSendingNotice(false);

        if (result.success) {
            setNoticeTarget(null);
        } else {
            setNoticeError(result.error || 'No se pudo enviar el aviso');
        }
    };

    return (
        <Container>
            <PageHeader title="Administrar reportes" onBack={() => navigate('/admin')} />
            <Content>
                {loading ? (
                    <EmptyText>Cargando...</EmptyText>
                ) : reports.length === 0 ? (
                    <EmptyText>No hay reportes pendientes.</EmptyText>
                ) : (
                    <List>
                        {reports.map((report) => {
                            const busy = busyReportId === report.id;
                            const alreadyBlocked = blockedAuthorIds.has(report.authorId);
                            return (
                                <Card key={report.id}>
                                    <TopRow>
                                        <ReasonBadge>{reasonLabel(report.reason)}</ReasonBadge>
                                        <TimeText>{formatRelativeTime(report.created_at)}</TimeText>
                                    </TopRow>
                                    <BodyText>{report.body}</BodyText>
                                    <MetaRow>
                                        Autor: <strong>{report.authorName}</strong> · Reportado por: {report.reporterName}
                                    </MetaRow>
                                    <Actions>
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteContent(report)} disabled={busy}>
                                            <Trash2 size={14} />
                                            Eliminar comentario
                                        </Button>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openNoticeModal(report)}
                                            disabled={busy || !report.authorId}
                                            aria-label="Enviar aviso"
                                        >
                                            <Mail size={16} />
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleBlockAuthor(report)}
                                            disabled={busy || !report.authorId || alreadyBlocked}
                                            aria-label="Bloquear usuario"
                                        >
                                            <Ban size={16} />
                                        </IconButton>
                                    </Actions>
                                </Card>
                            );
                        })}
                    </List>
                )}
            </Content>

            <Modal visible={!!noticeTarget} onClose={() => setNoticeTarget(null)}>
                <ModalTitle>Enviar aviso a {noticeTarget?.authorName}</ModalTitle>
                <Textarea
                    placeholder="Explica por qué le avisas..."
                    value={noticeMessage}
                    onChange={(e) => setNoticeMessage(e.target.value)}
                />
                {noticeError && <ErrorText>{noticeError}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setNoticeTarget(null)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handleSendNotice} disabled={!noticeMessage.trim() || sendingNotice}>
                        {sendingNotice ? 'Enviando...' : 'Enviar'}
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}
