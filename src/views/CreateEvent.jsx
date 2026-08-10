import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useEvent } from '../contexts/EventContext';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const COLORS = ['#000000', '#B23A63', '#D9A54B', '#3F8CD9', '#3FA772', '#8A5FD9', '#D95F5F', '#5F5F5F'];
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

const CharCount = styled.span`
  float: right;
  color: ${({ theme }) => theme.colors.text.disabled};
`;

const DateRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};

  > div {
    flex: 1;
  }
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

const ColorHint = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin: ${({ theme }) => theme.spacing(2)} 0 0 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

export default function CreateEvent() {
    const navigate = useNavigate();
    const { createEvent } = useEvent();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [colors, setColors] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const toggleColor = (color) => {
        setColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
    };

    const canSubmit = name.trim() && colors.length > 0 && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError('');

        const result = await createEvent({ name, description, startDate, endDate, colors });

        setSubmitting(false);
        if (result.success) {
            navigate(`/eventos/${result.evento.id}`, { replace: true });
        } else {
            setError(result.error || 'No se pudo crear el evento');
        }
    };

    return (
        <Container>
            <PageHeader title="Crear evento" onBack={() => navigate(-1)} />
            <Content>
                <Field>
                    <Label>Nombre</Label>
                    <Input
                        placeholder="Nombre del evento"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                    />
                </Field>

                <Field>
                    <Label>
                        Descripción
                        <CharCount>{description.length}/{DESCRIPTION_MAX_LENGTH}</CharCount>
                    </Label>
                    <Input
                        placeholder="Una frase corta sobre el evento"
                        value={description}
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={submitting}
                    />
                </Field>

                <Field>
                    <Label>Fechas</Label>
                    <DateRow>
                        <div>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                disabled={submitting}
                            />
                        </div>
                        <div>
                            <Input
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(e) => setEndDate(e.target.value)}
                                disabled={submitting}
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
                                $active={colors.includes(c)}
                                onClick={() => toggleColor(c)}
                                aria-label={c}
                            />
                        ))}
                    </ColorRow>
                    <ColorHint>
                        Elige uno o varios — con más de uno, el evento se distingue con un borde degradado.
                    </ColorHint>
                </Field>

                {error && <ErrorText>{error}</ErrorText>}

                <Button size="lg" fullWidth onClick={handleSubmit} disabled={!canSubmit}>
                    {submitting ? 'Creando...' : 'Crear evento'}
                </Button>
            </Content>
        </Container>
    );
}
