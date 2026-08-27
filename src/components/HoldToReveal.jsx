import React, { useState } from 'react';
import styled from 'styled-components';
import { SignatureLine } from './ui/Signature';

// Reparto secreto: el rol o la palabra se ven mientras se mantiene pulsado, y
// al soltar se vuelve a tapar. Gesto de una mano, reversible y sin recorrido.

const Panel = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: ${({ $height }) => $height}px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 0 0 1px ${({ theme, $ring }) => $ring || theme.colors.borderStrong};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: none;
  cursor: pointer;
`;

const HiddenGlyph = styled.span`
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(3.5)};
  color: ${({ $color }) => $color};
`;

const HiddenTitle = styled.span`
  font-size: 17px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const HiddenNote = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-top: 5px;
`;

export default function HoldToReveal({
    color,
    ring,
    height = 230,
    glyph,
    title = 'Mantén pulsado',
    note = 'y que nadie más mire',
    children,
    onSeen,
}) {
    const [shown, setShown] = useState(false);

    const hold = () => {
        setShown(true);
        if (onSeen) onSeen();
    };

    return (
        <Panel
            $height={height}
            $ring={ring}
            onPointerDown={hold}
            onPointerUp={() => setShown(false)}
            onPointerLeave={() => setShown(false)}
            onPointerCancel={() => setShown(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            <SignatureLine $color={color} aria-hidden="true" />
            {shown ? (
                children
            ) : (
                <>
                    {glyph && <HiddenGlyph $color={color} aria-hidden="true">{glyph}</HiddenGlyph>}
                    <HiddenTitle>{title}</HiddenTitle>
                    <HiddenNote>{note}</HiddenNote>
                </>
            )}
        </Panel>
    );
}
