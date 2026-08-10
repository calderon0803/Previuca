import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Pencil, Trash2 } from 'lucide-react';
import { IoImageOutline, IoPeopleOutline } from 'react-icons/io5';
import { useFlechazo } from '../contexts/FlechazoContext';
import { getAllPenas, updatePena, deletePena } from '../services/adminService';
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

const Thumb = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ $color, $image }) => ($image ? `url(${$image})` : $color)};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
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

const ImagePicker = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 140px;
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  background: ${({ theme, $hasImage }) => ($hasImage ? 'transparent' : theme.colors.surface)};
  background-image: ${({ $preview }) => ($preview ? `url(${$preview})` : 'none')};
  background-size: cover;
  background-position: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  cursor: pointer;
  overflow: hidden;

  input {
    display: none;
  }
`;

const ImageHint = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
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

export default function AdminPenas() {
    const navigate = useNavigate();
    const { user } = useFlechazo();
    const [penas, setPenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPena, setEditingPena] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', color: '', imageFile: null });
    const [preview, setPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [busyPenaId, setBusyPenaId] = useState(null);

    const loadPenas = async () => {
        setLoading(true);
        const result = await getAllPenas();
        setPenas(result.penas);
        setLoading(false);
    };

    useEffect(() => {
        loadPenas();
    }, []);

    const openEdit = (pena) => {
        setError('');
        setEditingPena(pena);
        setEditForm({ name: pena.name || '', color: pena.color || COLORS[0], imageFile: null });
        setPreview(pena.image_url || null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setEditForm((prev) => ({ ...prev, imageFile: file }));
        setPreview(URL.createObjectURL(file));
    };

    const handleSaveEdit = async () => {
        if (!editForm.name.trim()) return;

        setSaving(true);
        setError('');
        const result = await updatePena(editingPena.id, { ...editForm, adminUserId: user.id });
        setSaving(false);
        if (result.success) {
            setEditingPena(null);
            loadPenas();
        } else {
            setError(result.error || 'No se pudo guardar');
        }
    };

    const handleDelete = async (pena) => {
        const confirmed = window.confirm(
            `¿Seguro que quieres eliminar la peña «${pena.name}»? Sus miembros perderán su membresía y sellos asociados. No se puede deshacer.`
        );
        if (!confirmed) return;

        setBusyPenaId(pena.id);
        const result = await deletePena(pena.id);
        setBusyPenaId(null);
        if (result.success) {
            loadPenas();
        } else {
            alert(result.error || 'No se pudo eliminar la peña');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Container>
            <PageHeader title="Administrar peñas" onBack={() => navigate(-1)} />
            <Content>
                {penas.length === 0 ? (
                    <EmptyText>No hay peñas todavía.</EmptyText>
                ) : (
                    <List>
                        {penas.map((pena) => (
                            <Row key={pena.id}>
                                <Thumb $color={pena.color} $image={pena.image_url} />
                                <Info>
                                    <Name>{pena.name}</Name>
                                    <Meta>
                                        {pena.eventName}
                                        <IoPeopleOutline size={14} />
                                        {pena.memberCount}
                                    </Meta>
                                </Info>
                                <Actions>
                                    <IconButton variant="ghost" size="sm" onClick={() => openEdit(pena)} aria-label="Editar">
                                        <Pencil size={16} />
                                    </IconButton>
                                    <IconButton
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(pena)}
                                        disabled={busyPenaId === pena.id}
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

            <Modal visible={!!editingPena} onClose={() => setEditingPena(null)}>
                <ModalTitle>Editar peña</ModalTitle>
                <Field>
                    <Label>Nombre</Label>
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </Field>
                <Field>
                    <Label>Color</Label>
                    <ColorRow>
                        {COLORS.map((c) => (
                            <ColorSwatch
                                key={c}
                                type="button"
                                $color={c}
                                $active={editForm.color === c}
                                onClick={() => setEditForm({ ...editForm, color: c })}
                                aria-label={c}
                            />
                        ))}
                    </ColorRow>
                </Field>
                <Field>
                    <Label>Imagen</Label>
                    <ImagePicker $preview={preview} $hasImage={!!preview}>
                        {!preview && (
                            <>
                                <IoImageOutline size={24} />
                                <ImageHint>Toca para cambiar la foto</ImageHint>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                    </ImagePicker>
                </Field>
                {error && <ErrorText>{error}</ErrorText>}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <Button variant="secondary" fullWidth onClick={() => setEditingPena(null)}>
                        Cancelar
                    </Button>
                    <Button fullWidth onClick={handleSaveEdit} disabled={!editForm.name.trim() || saving}>
                        {saving ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </Modal>
        </Container>
    );
}
