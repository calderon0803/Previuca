import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { usePenas } from '../contexts/PenasContext';
import { penaColors } from '../styles/theme';
import PenaStamp from '../components/PenaStamp';
import PageHeader from '../components/ui/PageHeader';
import Screen, { Content, Footer } from '../components/ui/Screen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Preview = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
`;

const Label = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(2)};
  font-size: 12.5px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const Field = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(5.5)};
`;

const Swatches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const Swatch = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  border: 2px solid
    ${({ theme, $active }) => ($active ? theme.colors.text.primary : 'transparent')};
`;

const ErrorText = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing(4)};
  font-size: 13.5px;
  color: ${({ theme }) => theme.colors.error};
`;

export default function CreatePena() {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const { createPena } = usePenas();
    const [name, setName] = useState('');
    const [color, setColor] = useState(penaColors[0]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setSubmitting(true);
        setError('');

        const result = await createPena({ eventId, name, color });

        setSubmitting(false);
        if (result.success) {
            navigate(`/eventos/${eventId}/penas/${result.pena.id}`, { replace: true });
        } else {
            setError(result.error || 'No se pudo crear la peña');
        }
    };

    return (
        <Screen>
            <PageHeader title="Crear peña" onBack={() => navigate(-1)} />
            <Content>
                {/* El sello se genera del nombre y el color: se ve al escribirlo. */}
                <Preview>
                    <PenaStamp
                        pena={{ id: `preview-${color}`, name: name || '?', color }}
                        size={84}
                    />
                </Preview>

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
                    <Label>Color — define el sello de tu peña</Label>
                    <Swatches>
                        {penaColors.map((value) => (
                            <Swatch
                                key={value}
                                type="button"
                                $color={value}
                                $active={color === value}
                                onClick={() => setColor(value)}
                                aria-label={`Color ${value}`}
                            />
                        ))}
                    </Swatches>
                </Field>

                {error && <ErrorText>{error}</ErrorText>}
            </Content>
            <Footer>
                <Button
                    size="lg"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!name.trim() || submitting}
                >
                    {submitting ? 'Creando...' : 'Crear peña'}
                </Button>
            </Footer>
        </Screen>
    );
}
