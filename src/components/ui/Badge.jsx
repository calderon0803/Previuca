import styled from 'styled-components';

const tones = {
  neutral: (theme) => `
    background: ${theme.colors.surfaceRaised};
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border};
  `,
  primary: (theme) => `
    background: ${theme.colors.primaryMuted};
    color: ${theme.colors.primaryHover};
    border: 1px solid transparent;
  `,
  accent: (theme) => `
    background: ${theme.colors.accentMuted};
    color: ${theme.colors.accent};
    border: 1px solid transparent;
  `,
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2.5)};
  border-radius: ${({ theme }) => theme.radii.pill};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1;
  ${({ theme, $tone = 'neutral' }) => tones[$tone](theme)}
`;

export default Badge;
