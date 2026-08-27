import styled from 'styled-components';

const tones = {
    neutral: (theme) => `
    color: ${theme.colors.text.muted};
    box-shadow: inset 0 0 0 1px ${theme.colors.border};
  `,
    primary: (theme) => `
    color: ${theme.colors.accentText};
    box-shadow: inset 0 0 0 1px ${theme.colors.accent};
  `,
    accent: (theme) => `
    color: ${theme.colors.accentText};
    background: ${theme.colors.accentTint};
  `,
    success: (theme) => `
    color: ${theme.colors.success};
    box-shadow: inset 0 0 0 1px ${theme.colors.success};
  `,
    danger: (theme) => `
    color: ${theme.colors.danger};
    box-shadow: inset 0 0 0 1px ${theme.colors.dangerBorder};
  `,
};

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: 4px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.sm};
  background: transparent;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  line-height: 1;
  ${({ theme, $tone = 'neutral' }) => tones[$tone](theme)}
`;

export default Badge;
