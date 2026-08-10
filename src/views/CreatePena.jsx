import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { IoImageOutline } from 'react-icons/io5';
import { usePenas } from '../contexts/PenasContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
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
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(6)};
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid ${({ theme, $active }) => ($active ? theme.colors.text.primary : theme.colors.borderStrong)};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.08);
  }
`;

const ImagePicker = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 160px;
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

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

export default function CreatePena() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { createPena } = usePenas();
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        setError('');

        const result = await createPena({ eventId, name, color, imageFile });

        setSubmitting(false);
        if (result.success) {
            navigate(`/eventos/${eventId}/penas/${result.pena.id}`, { replace: true });
        } else {
            setError(result.error || 'No se pudo crear la peña');
        }
    };

    return (
        <Container>
            <PageHeader title="Crear peña" onBack={() => navigate(-1)} />
            <Content>
                <Field>
                    <Label>Nombre</Label>
                    <Input
                        placeholder="Nombre de la peña"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                    />
                </Field>

                <Field>
                    <Label>Color</Label>
                    <ColorRow>
                        {COLORS.map((c) => (
                            <ColorSwatch
                                key={c}
                                type="button"
                                $color={c}
                                $active={color === c}
                                onClick={() => setColor(c)}
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
                                <IoImageOutline size={28} />
                                <ImageHint>Toca para elegir una foto</ImageHint>
                            </>
                        )}
                        <input type="file" accept="image/*" onChange={handleImageChange} disabled={submitting} />
                    </ImagePicker>
                </Field>

                {error && <ErrorText>{error}</ErrorText>}

                <Button size="lg" fullWidth onClick={handleSubmit} disabled={!name.trim() || submitting}>
                    {submitting ? 'Creando...' : 'Crear peña'}
                </Button>
            </Content>
        </Container>
    );
}
