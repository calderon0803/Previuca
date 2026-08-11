import React from 'react';
import styled from 'styled-components';

// Reemplaza a <input type="date"> a secas: en iOS Safari ese input calcula
// su ancho a partir del texto de la fecha ya formateada e ignora el
// width:100% del CSS, saliéndose de su caja (o quedando recortado a medias
// si se le fuerza overflow:hidden). Aquí el input nativo sigue existiendo
// —así se sigue abriendo el selector de fecha del sistema al tocar— pero
// va invisible y ocupa exactamente la caja del wrapper (inset:0), mientras
// lo que se ve es un div normal que sí respeta el ancho que le demos.
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 46px;
`;

const Display = styled.div`
  width: 100%;
  height: 100%;
  padding: 0 ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme, $hasValue }) => ($hasValue ? theme.colors.text.primary : theme.colors.text.disabled)};
  display: flex;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  box-sizing: border-box;
  pointer-events: none;
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
`;

const NativeInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  margin: 0;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
`;

const formatDisplay = (value) => {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    if (!y || !m || !d) return value;
    return `${d}/${m}/${y}`;
};

export default function DateInput({ value, onChange, placeholder = 'dd/mm/aaaa', disabled, min, max, ...props }) {
    return (
        <Wrapper>
            <Display $hasValue={!!value} $disabled={disabled}>
                {value ? formatDisplay(value) : placeholder}
            </Display>
            <NativeInput
                type="date"
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                min={min}
                max={max}
                {...props}
            />
        </Wrapper>
    );
}
