import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Pencil, Trash2 } from 'lucide-react';
import { getAllEvents, updateEvent, deleteEvent } from '../services/adminService';
import PageHeader from '../components/ui/PageHeader';
import LoadingScreen from '../components/ui/LoadingScreen';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const COLORS = [
    '#E5484D', '#D9455B', '#B23A63', '#D9377E', '#C23FA0', '#8A5FD9',
    '#6E56CF', '#3F8CD9', '#3FA0D9', '#3FA9A0', '#3FA772', '#5FA83F',
    '#8FB93F', '#D9C23F', '#D9A54B', '#D97C3F', '#D95F5F', '#7C818C', '#000000',
];
const DESCRIPTION_MAX_LENGTH = 80;

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
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Label = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const CharCount = styled.span`
  float: right;
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const DateRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  > div {
    flex: 1;
    min-width: 0;
  }

  input[type="date"] {
    min-width: 0;
    padding: 0 ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
  }
`;

const ColorRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
`;

const ColorSwatch = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.borderStrong)};
  cursor: pointer;
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

export default function AdminEvents() {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingEvent, setEditingEvent] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', startDate: '', endDate: '', colors: [] });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [busyEventId, setBusyEventId] = useState(null);

    const loadEventos = async () => {
        setLoading(true);
        const result = await getAllEvents();
        setEventos(result.eventos);
        setLoading(false);
    };

    useEffect(() => {
        loadEventos();
    }, []);

    const openEdit = (evento) => {
        setError('');
        setEditingEvent(evento);
        setEditForm({
            name: evento.name || '',
            description: evento.description || '',
            startDate: evento.start_date || '',
            endDate: evento.end_date || '',
            colors: evento.colors || [],
        });
    };

    const toggleColor = (color) => {
        setEditForm((prev) => ({
            ...prev,
            colors: prev.colors.includes(color)
                ? prev.colors.filter((c) => c !== color)
                : [...prev.colors, color],
        }));
    };

    const handleSaveEdit = async () => {
        if (!editForm.name.trim() || editForm.colors.length === 0) return;

        setSaving(true);
        setError('');
        const result = await updateEvent(editingEvent.id, editForm);
        setSaving(false);
        if (result.success) {
            setEditingEvent(null);
            loadEventos();
        } else {
            setError(result.error || 'No se pudo guardar');
        }
    };

    const handleDelete = async (evento) => {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar «${evento.name}»? Se borrarán también sus peñas, sellos, flechazos y mensajes de Salseo. No se puede deshacer.`
        );
        if (!confirmed) return;

        setBusyEventId(evento.id);
        const result = await deleteEvent(evento.id);
        setBusyEventId(null);
        if (result.success) {
            loadEventos();
        } else {
            alert(result.error || 'No se pudo eliminar el evento');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <PageHeader title="Administrar eventos" onBack={() => navigate(-1)} />
            <Content>
                {eventos.length === 0 ? (
                    <EmptyText>No hay eventos todavía.</EmptyText>
                ) : (
                    <List>
                        {eventos.map((evento) => (
                            <Row key={evento.id}>
                                <Info>
                                    <Name>{evento.name}</Name>
                                    <Meta>Código {evento.code}{evento.description ? ` · ${evento.description}` : ''}</Meta>
                                </Info>
                                <Actions>
                                    <IconButton variant="ghost" size="sm" onClick={() => openEdit(evento)} aria-label="Editar">
                                        <Pencil size={16} />
                                    </IconButton>
                                    <IconButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(evento)}
                                        disabled={busyEventId === evento.id}
                                        aria-label="Eliminar"
                                    >
                                        <Trash2 size={16} />
                                    </IconButton>
                                </Actions>
                            </Row>
                        ))}
                    </List>
                )}
            </Content>

            <Modal visible={!!editingEvent} onClose={() => setEditingEvent(null)}>
                <ModalTitle>Editar evento</ModalTitle>
                <Field>
                    <Label>Nombre</Label>
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </Field>
                <Field>
                    <Label>
                        Descripción
                        <CharCount>{editForm.description.length}/{DESCRIPTION_MAX_LENGTH}</CharCount>
                    </Label>
                    <Input
                        value={editForm.description}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                </Field>
                <Field>
                    <Label>Fechas</Label>
                    <DateRow>
                        <div>
                            <Input
                                type="date"
                                value={editForm.startDate || ''}
                                onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <Input
                                type="date"
                                value={editForm.endDate || ''}
                                min={editForm.startDate || undefined}
                                onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                            />
                        </div>
                    </DateRow>
                </Field>
                <Field>
                    <Label>Color</Label>
                    <ColorRow>
                        {COLORS.map((c) => (
                            <ColorSwatch
                                key={c}
                                type="button"
                                $color={c}
                                $active={editForm.colors.includes(c)}
                                onClick={() => toggleColor(c)}
                                aria-label={c}
                            />
                        ))}
                    </ColorRow>
                </Field>
                {error && <ErrorText>{error}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setEditingEvent(null)}>
                        Cancelar
                    </Button>
                    <Button
                        fullWidth
                        onClick={handleSaveEdit}
                        disabled={!editForm.name.trim() || editForm.colors.length === 0 || saving}
                    >
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}
