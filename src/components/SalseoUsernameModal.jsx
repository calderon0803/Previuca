import React, { useState } from 'react';
import styled from 'styled-components';
import { useFlechazo } from '../contexts/FlechazoContext';
import BottomSheet, { SheetTitle } from './ui/BottomSheet';
import Button from './ui/Button';
import Input from './ui/Input';

const Title = styled(SheetTitle)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Hint = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 13.5px;
  line-height: 1.5;
  margin: 0 0 ${({ theme }) => theme.spacing(4.5)};
`;

const Divider = styled.p`
  color: ${({ theme }) => theme.colors.text.faint};
  font-size: 11px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: ${({ theme }) => theme.spacing(4)} 0;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13.5px;
  margin: ${({ theme }) => theme.spacing(3)} 0 0;
`;

export default function SalseoUsernameModal({ visible, onClose, onSuccess }) {
    const { isVerified, instagramUsername, updateSalseoUsername } = useFlechazo();
    const [customUsername, setCustomUsername] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleClose = () => {
        setError('');
        setCustomUsername('');
        onClose();
    };

    const handleChoose = async (username) => {
        setSaving(true);
        setError('');
        const result = await updateSalseoUsername(username);
        setSaving(false);

        if (result.success) {
            setCustomUsername('');
            onSuccess(result.username);
        } else {
            setError(result.error || 'No se pudo guardar el usuario');
        }
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose}>
            <Title>Elige tu usuario de Salseo</Title>
            <Hint>
                Así te verán los demás en los mensajes de Salseo, en vez de tu nombre. No podrás
                cambiarlo más adelante.
            </Hint>

            {isVerified && instagramUsername && (
                <>
                    <Button size="lg" fullWidth onClick={() => handleChoose(instagramUsername)} disabled={saving}>
                        Usar mi Instagram (@{instagramUsername})
                    </Button>
                    <Divider>o elige uno propio</Divider>
                </>
            )}

            <Input
                placeholder="usuario"
                value={customUsername}
                onChange={(e) => setCustomUsername(e.target.value)}
                disabled={saving}
            />
            {error && <ErrorText>{error}</ErrorText>}
            <div style={{ marginTop: '16px' }}>
                <Button
                    size="lg"
                    fullWidth
                    onClick={() => handleChoose(customUsername)}
                    disabled={!customUsername.trim() || saving}
                >
                    {saving ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </BottomSheet>
    );
}
