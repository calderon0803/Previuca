import React from 'react';
import styled from 'styled-components';
import { IoLockClosed } from 'react-icons/io5';

// Parámetros deterministas a partir del UUID de la peña: no hace falta
// hashear nada, un UUID v4 ya es hex aleatorio uniforme, así que basta con
// trocearlo. Mismo id -> siempre el mismo sello; sellos distintos entre sí.
function deriveParams(id) {
    const raw = (id || '').replace(/-/g, '').padEnd(32, '0');
    const a = parseInt(raw.slice(0, 8), 16) || 0;
    const b = parseInt(raw.slice(8, 16), 16) || 0;
    const c = parseInt(raw.slice(16, 24), 16) || 0;
    const d = parseInt(raw.slice(24, 32), 16) || 0;

    return {
        lobes: 3 + (a % 7), // 3-9: cuántos "picos" tiene el contorno
        amplitude: 0.06 + ((b % 35) / 100), // 0.06-0.40: de casi-círculo a flor/estrella
        rotation: c % 360,
        rayCount: 5 + (d % 6), // 5-10 rayos internos tipo medalla
        rayRotation: Math.floor(a / 256) % 360,
        // Salto de matiz grande respecto al color base: evita que dos peñas
        // con el mismo color de fondo generen sellos gemelos.
        accentHueShift: 60 + (Math.floor(b / 256) % 121),
    };
}

function parseHexRgb(hex) {
    const clean = (hex || '#B23A63').replace('#', '');
    const full = clean.length === 3
        ? clean.split('').map((ch) => ch + ch).join('')
        : clean.padEnd(6, '0');
    return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16),
    };
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const l = (max + min) / 2;
    const delta = max - min;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    if (delta !== 0) {
        switch (max) {
            case r: h = ((g - b) / delta) % 6; break;
            case g: h = (b - r) / delta + 2; break;
            default: h = (r - g) / delta + 4; break;
        }
        h *= 60;
        if (h < 0) h += 360;
    }

    return { h, s, l };
}

function hslToHex(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = Math.min(1, Math.max(0, s));
    l = Math.min(1, Math.max(0, l));

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Contorno como curva polar r(θ) = R·(1 + amplitude·cos(lobes·θ + rotación)).
// Un único algoritmo que, variando lobes/amplitude, va de círculo casi
// perfecto a flor, estrella o engranaje — sin necesitar formas hardcodeadas.
function buildOutlinePath(cx, cy, radius, lobes, amplitude, rotationDeg, steps = 96) {
    const rot = (rotationDeg * Math.PI) / 180;
    let d = '';
    for (let i = 0; i <= steps; i += 1) {
        const theta = (i / steps) * Math.PI * 2;
        const r = radius * (1 + amplitude * Math.cos(lobes * theta + rot));
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
    }
    return `${d}Z`;
}

// Rayos internos tipo medalla/sol, como triángulos finos desde el centro.
function buildRayPaths(cx, cy, innerR, outerR, count, rotationDeg, widthFraction = 0.16) {
    const rot = (rotationDeg * Math.PI) / 180;
    const rays = [];
    for (let i = 0; i < count; i += 1) {
        const theta = rot + (i / count) * Math.PI * 2;
        const halfAngle = ((Math.PI / count) * widthFraction);
        const tipX = cx + outerR * Math.cos(theta);
        const tipY = cy + outerR * Math.sin(theta);
        const leftX = cx + innerR * Math.cos(theta - halfAngle);
        const leftY = cy + innerR * Math.sin(theta - halfAngle);
        const rightX = cx + innerR * Math.cos(theta + halfAngle);
        const rightY = cy + innerR * Math.sin(theta + halfAngle);
        rays.push(
            `M${leftX.toFixed(2)},${leftY.toFixed(2)} L${tipX.toFixed(2)},${tipY.toFixed(2)} L${rightX.toFixed(2)},${rightY.toFixed(2)} Z`
        );
    }
    return rays;
}

const StampWrapper = styled.div`
  position: relative;
  display: inline-flex;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  flex-shrink: 0;
`;

// El filtro/opacidad de "bloqueado" va aquí, no en StampWrapper, porque un
// hijo no puede "escapar" del filter/opacity de un ancestro: si el candado
// fuera hijo de un elemento con grayscale, también saldría gris.
const StampVisual = styled.div`
  width: 100%;
  height: 100%;
  filter: ${({ $locked }) => ($locked ? 'grayscale(1)' : 'none')};
  opacity: ${({ $locked }) => ($locked ? 0.4 : 1)};
  transition: filter 0.2s ease, opacity 0.2s ease;

  svg {
    display: block;
  }
`;

const LockBadge = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.6));
`;

export default function PenaStamp({ pena, size = 96, locked = false }) {
    const { id = '', name = '', color = '#B23A63' } = pena || {};
    const params = deriveParams(id);

    const { r, g, b } = parseHexRgb(color);
    const baseHsl = rgbToHsl(r, g, b);
    const accentHex = hslToHex(
        baseHsl.h + params.accentHueShift,
        Math.min(1, baseHsl.s + 0.15),
        Math.min(0.62, Math.max(0.38, baseHsl.l))
    );
    const textColor = (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#0A0B0E' : '#FFFFFF';
    const initial = (name.trim()[0] || '?').toUpperCase();

    const cx = 50;
    const cy = 50;
    const outlinePath = buildOutlinePath(cx, cy, 42, params.lobes, params.amplitude, params.rotation);
    const rayPaths = buildRayPaths(cx, cy, 17, 34, params.rayCount, params.rayRotation);

    return (
        <StampWrapper $size={size}>
            <StampVisual $locked={locked}>
                <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`Sello de ${name || 'la peña'}`}>
                    <path d={outlinePath} fill={color} />
                    {rayPaths.map((d, i) => (
                        <path key={i} d={d} fill={accentHex} opacity={0.85} />
                    ))}
                    <circle cx={cx} cy={cy} r={16} fill={color} stroke={accentHex} strokeWidth={2} />
                    <text
                        x={cx}
                        y={cy + 1}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={18}
                        fontWeight="700"
                        fill={textColor}
                    >
                        {initial}
                    </text>
                </svg>
            </StampVisual>
            {locked && (
                <LockBadge>
                    <IoLockClosed size={Math.max(14, size * 0.22)} />
                </LockBadge>
            )}
        </StampWrapper>
    );
}

export { deriveParams };
