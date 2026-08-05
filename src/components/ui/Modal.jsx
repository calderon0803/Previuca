import React from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(10, 11, 14, 0.72);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 100;

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    align-items: center;
  }
`;

const Sheet = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: none;
  border-radius: ${({ theme }) => theme.radii.lg} ${({ theme }) => theme.radii.lg} 0 0;
  padding: ${({ theme }) => theme.spacing(5)};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.lg};
  }
`;

export default function Modal({ visible, onClose, children }) {
  return (
    <AnimatePresence>
      {visible && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <Sheet
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </Sheet>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
