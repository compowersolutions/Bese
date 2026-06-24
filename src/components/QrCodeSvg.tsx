/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
}

export default function QrCodeSvg({ value, size = 120 }: QrCodeSvgProps) {
  // We'll generate a consistent abstract matrix of black and white squares using a hash of the value
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const seed = hashString(value);
  const matrixSize = 12; // 12x12 grid for visual QR representation
  const squareSize = size / matrixSize;

  const points: { x: number; y: number }[] = [];

  // Corner finder patterns (essential QR look)
  const isFinderPattern = (row: number, col: number) => {
    // Top-left
    if (row < 3 && col < 3) return true;
    // Top-right
    if (row < 3 && col >= matrixSize - 3) return true;
    // Bottom-left
    if (row >= matrixSize - 3 && col < 3) return true;
    return false;
  };

  // Build the pseudo-QR pattern
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (isFinderPattern(r, c)) {
        // Finder patterns have solid outer borders and inner dots
        const isBorder = r === 0 || r === 2 || c === 0 || c === 2 ||
                         r === matrixSize - 1 || r === matrixSize - 3 || c === 0 || c === 2 ||
                         r === 0 || r === 2 || c === matrixSize - 1 || c === matrixSize - 3;
        const isInner = (r === 1 && c === 1) ||
                        (r === matrixSize - 2 && c === 1) ||
                        (r === 1 && c === matrixSize - 2);

        if (isBorder || isInner) {
          points.push({ x: c, y: r });
        }
      } else {
        // Pseudo-random square placement based on hash
        const val = (seed + r * 17 + c * 31) % 2 === 0;
        if (val) {
          points.push({ x: c, y: r });
        }
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-slate-900">
        <rect width={size} height={size} fill="white" />
        {points.map((pt, idx) => (
          <rect
            key={idx}
            x={pt.x * squareSize}
            y={pt.y * squareSize}
            width={squareSize - 0.2}
            height={squareSize - 0.2}
            fill="currentColor"
            rx={1}
          />
        ))}
      </svg>
      <span className="font-mono text-[10px] text-slate-400 mt-2 tracking-widest">{value.slice(0, 12).toUpperCase()}</span>
    </div>
  );
}
