import React from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

// Hoja inferior: sustituye a los modales centrados en todo el rediseño.
// Velo `rgba(10,11,18,.72)` + blur(3px); clic en el velo cierra, clic dentro
// hace stopPropagation.

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: ${({ theme }) => theme.colors.overlay};
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;
`;

const Panel = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  max-height: 86vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg} ${({ theme }) => theme.radii.lg} 0 0;
  box-shadow: ${({ theme }) => theme.shadows.sheet};
  padding: ${({ theme }) => theme.spacing(5)} ${({ theme }) => theme.spacing(5)}
    calc(${({ theme }) => theme.spacing(6.5)} + env(safe-area-inset-bottom, 0px));

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const SheetTitle = styled.h2`
  font-size: 22px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

export const SheetSubtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

export const SheetHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const SheetBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme, $gap = 3 }) => theme.spacing($gap)};
`;

export default function BottomSheet({
    visible,
    onClose,
    closeOnOverlayClick = true,
    title,
    subtitle,
    children,
}) {
    return (
        <AnimatePresence>
            {visible && (
                <Overlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={closeOnOverlayClick ? onClose : undefined}
                >
                    <Panel
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(title || subtitle) && (
                            <SheetHeader>
                                {title && <SheetTitle>{title}</SheetTitle>}
                                {subtitle && <SheetSubtitle>{subtitle}</SheetSubtitle>}
                            </SheetHeader>
                        )}
                        {children}
                    </Panel>
                </Overlay>
            )}
        </AnimatePresence>
    );
}
