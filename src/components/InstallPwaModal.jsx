import React, { useState } from 'react';
import styled from 'styled-components';
import { Smartphone, Share, MoreVertical, CheckCircle2 } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { usePwaInstall, isStandalone, getPlatform } from '../hooks/usePwaInstall';

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

const Tabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

const Tab = styled.button`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) => ($active ? theme.colors.primaryMuted : theme.colors.surface)};
  color: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.text.secondary)};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
`;

const Steps = styled.ol`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.55;
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  padding-left: ${({ theme }) => theme.spacing(5)};

  li {
    margin-bottom: ${({ theme }) => theme.spacing(2.5)};
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const InlineIcon = styled.span`
  display: inline-flex;
  vertical-align: -3px;
  margin: 0 2px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Note = styled.p`
  color: ${({ theme }) => theme.colors.text.disabled};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

const AlreadyInstalled = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(4)} 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export default function InstallPwaModal({ visible, onClose }) {
    const [tab, setTab] = useState(getPlatform() === 'ios' ? 'ios' : 'android');
    const { canInstall, promptInstall } = usePwaInstall();

    return (
        <Modal visible={visible} onClose={onClose}>
            <Title>Instalar Previuca</Title>

            {isStandalone() ? (
                <AlreadyInstalled>
                    <CheckCircle2 size={32} />
                    <p>Ya tienes Previuca instalada en este dispositivo.</p>
                </AlreadyInstalled>
            ) : (
                <>
                    <Tabs>
                        <Tab type="button" $active={tab === 'android'} onClick={() => setTab('android')}>
                            Android
                        </Tab>
                        <Tab type="button" $active={tab === 'ios'} onClick={() => setTab('ios')}>
                            iPhone
                        </Tab>
                    </Tabs>

                    {tab === 'android' ? (
                        canInstall ? (
                            <>
                                <Note>Chrome puede instalarla directamente, sin pasos manuales.</Note>
                                <Button fullWidth onClick={() => promptInstall().then(() => onClose())}>
                                    Instalar app
                                </Button>
                            </>
                        ) : (
                            <Steps>
                                <li>Abre Previuca en Chrome.</li>
                                <li>
                                    Toca el menú <InlineIcon><MoreVertical size={16} /></InlineIcon> de arriba a la
                                    derecha.
                                </li>
                                <li>Elige <strong>Instalar app</strong> (o <strong>Añadir a pantalla de inicio</strong>).</li>
                                <li>Confirma en el aviso que aparece.</li>
                            </Steps>
                        )
                    ) : (
                        <>
                            <Steps>
                                <li>Abre Previuca en Safari (en iPhone solo funciona desde Safari).</li>
                                <li>
                                    Toca el icono de compartir <InlineIcon><Share size={16} /></InlineIcon> de la
                                    barra inferior.
                                </li>
                                <li>Desplázate y elige <strong>Añadir a pantalla de inicio</strong>.</li>
                                <li>Toca <strong>Añadir</strong> arriba a la derecha.</li>
                            </Steps>
                            <Note>
                                <Smartphone size={12} style={{ verticalAlign: '-1px', marginRight: '4px' }} />
                                Desde otros navegadores de iPhone (Chrome, etc.) esta opción no aparece.
                            </Note>
                        </>
                    )}
                </>
            )}
        </Modal>
    );
}
