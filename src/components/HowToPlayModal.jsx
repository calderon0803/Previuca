import React from 'react';
import styled from 'styled-components';
import Modal from './ui/Modal';

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing(4)} 0;
  text-align: center;
`;

const Body = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.55;

  p {
    margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul {
    margin: 0 0 ${({ theme }) => theme.spacing(3)} 0;
    padding-left: ${({ theme }) => theme.spacing(5)};
  }

  li {
    margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export default function HowToPlayModal({ visible, onClose, title, children }) {
    return (
        <Modal visible={visible} onClose={onClose}>
            <Title>{title}</Title>
            <Body>{children}</Body>
        </Modal>
    );
}
