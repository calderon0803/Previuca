import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Pencil, Ban, ShieldCheck, Trash2, Mail } from 'lucide-react';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getAllProfiles, updateProfileAdmin, setUserBlocked, deleteUserAccount, sendNotice } from '../services/adminService';
import { GENDER_OPTIONS, calculateAge } from '../services/profileService';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import DateInput from '../components/ui/DateInput';
import Textarea from '../components/ui/Textarea';

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

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
`;

const Info = styled.div`
  flex: 1;
  min-width: 0;
`;

const Name = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 2px 0 0 0;
`;

const BlockedBadge = styled.span`
  display: inline-block;
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
  background: rgba(210, 55, 61, 0.14);
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  text-transform: uppercase;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-shrink: 0;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Select = styled.select`
  width: 100%;
  height: 46px;
  padding: 0 ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-family: inherit;
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

export default function AdminUsers() {
    const navigate = useNavigate();
    const { user } = useFlechazo();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ firstName: '', lastName: '', birthdate: '', gender: '' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [busyUserId, setBusyUserId] = useState(null);
    const [noticeTarget, setNoticeTarget] = useState(null);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [sendingNotice, setSendingNotice] = useState(false);
    const [noticeError, setNoticeError] = useState('');

    const loadProfiles = async () => {
        setLoading(true);
        const result = await getAllProfiles();
        setProfiles(result.profiles);
        setLoading(false);
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    const openEdit = (profile) => {
        setError('');
        setEditingUser(profile);
        setEditForm({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            birthdate: profile.birthdate || '',
            gender: profile.gender || '',
        });
    };

    const handleSaveEdit = async () => {
        setSaving(true);
        setError('');
        const result = await updateProfileAdmin(editingUser.user_id, editForm);
        setSaving(false);
        if (result.success) {
            setEditingUser(null);
            loadProfiles();
        } else {
            setError(result.error || 'No se pudo guardar');
        }
    };

    const handleToggleBlocked = async (profile) => {
        setBusyUserId(profile.user_id);
        await setUserBlocked(profile.user_id, !profile.isBlocked, user.id);
        setBusyUserId(null);
        loadProfiles();
    };

    const handleDelete = async (profile) => {
        const confirmed = window.prompt(
            `Esto borrará todos los datos de «${profile.first_name} ${profile.last_name}» (peñas, sellos, flechazos, mensajes de Salseo) y bloqueará su cuenta. Para confirmar, escribe "ELIMINAR":`
        );
        if (confirmed !== 'ELIMINAR') return;

        setBusyUserId(profile.user_id);
        const result = await deleteUserAccount(profile.user_id, user.id);
        setBusyUserId(null);
        if (result.success) {
            loadProfiles();
        } else {
            alert(result.error || 'No se pudo eliminar la cuenta');
        }
    };

    const openNoticeModal = (profile) => {
        setNoticeError('');
        setNoticeMessage('');
        setNoticeTarget(profile);
    };

    const handleSendNotice = async () => {
        if (!noticeMessage.trim()) return;

        setSendingNotice(true);
        setNoticeError('');
        const result = await sendNotice(noticeTarget.user_id, noticeMessage, null);
        setSendingNotice(false);

        if (result.success) {
            setNoticeTarget(null);
        } else {
            setNoticeError(result.error || 'No se pudo enviar el aviso');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <PageHeader title="Administrar usuarios" onBack={() => navigate(-1)} />
            <Content>
                {profiles.length === 0 ? (
                    <EmptyText>No hay usuarios todavía.</EmptyText>
                ) : (
                    <List>
                        {profiles.map((profile) => {
                            const age = calculateAge(profile.birthdate);
                            const busy = busyUserId === profile.user_id;
                            return (
                                <Row key={profile.user_id}>
                                    <Info>
                                        <Name>
                                            {profile.first_name} {profile.last_name}
                                            {profile.isBlocked && <BlockedBadge>Bloqueado</BlockedBadge>}
                                        </Name>
                                        <Meta>
                                            {[age !== null ? `${age} años` : null, profile.gender || null]
                                                .filter(Boolean)
                                                .join(' · ') || 'Sin datos'}
                                        </Meta>
                                    </Info>
                                    <Actions>
                                        <IconButton variant="ghost" size="sm" onClick={() => openEdit(profile)} aria-label="Editar">
                                            <Pencil size={16} />
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openNoticeModal(profile)}
                                            aria-label="Enviar aviso"
                                        >
                                            <Mail size={16} />
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleToggleBlocked(profile)}
                                            disabled={busy}
                                            aria-label={profile.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                        >
                                            {profile.isBlocked ? <ShieldCheck size={16} /> : <Ban size={16} />}
                                        </IconButton>
                                        <IconButton
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(profile)}
                                            disabled={busy}
                                            aria-label="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </IconButton>
                                    </Actions>
                                </Row>
                            );
                        })}
                    </List>
                )}
            </Content>

            <Modal visible={!!editingUser} onClose={() => setEditingUser(null)}>
                <ModalTitle>Editar usuario</ModalTitle>
                <Field>
                    <Label>Nombre</Label>
                    <Input
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                </Field>
                <Field>
                    <Label>Apellido</Label>
                    <Input
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                </Field>
                <Field>
                    <Label>Fecha de nacimiento</Label>
                    <DateInput
                        value={editForm.birthdate || ''}
                        onChange={(e) => setEditForm({ ...editForm, birthdate: e.target.value })}
                    />
                </Field>
                <Field>
                    <Label>Género</Label>
                    <Select
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                        <option value="">Sin especificar</option>
                        {GENDER_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </Select>
                </Field>
                {error && <ErrorText>{error}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setEditingUser(null)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handleSaveEdit} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </Modal>

            <Modal visible={!!noticeTarget} onClose={() => setNoticeTarget(null)} closeOnOverlayClick={false}>
                <ModalTitle>Enviar aviso a {noticeTarget?.first_name}</ModalTitle>
                <Textarea
                    placeholder="Ej: tu nombre de usuario no es apropiado, cámbialo desde Ajustes..."
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
