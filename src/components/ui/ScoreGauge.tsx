import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0 - 100
  size?: number;
}

export function ScoreGauge({ score, size = 120 }: ScoreGaugeProps) {
  const radius    = (size - 16) / 2;
  const circ      = 2 * Math.PI * radius;
  const pct       = Math.min(100, Math.max(0, score));
  const offset    = circ - (pct / 100) * circ;

  const color =
    pct >= 80 ? '#10b981' :
    pct >= 60 ? '#f59e0b' :
    pct >= 40 ? '#f97316' :
    '#ef4444';

  const label =
    pct >= 80 ? 'Excellent' :
    pct >= 60 ? 'Good' :
    pct >= 40 ? 'Fair' :
    'Poor';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      {/* Center text (overlay) */}
      <div className="flex flex-col items-center -mt-[calc(var(--size)/2+1.5rem)]" style={{ marginTop: `calc(-${size / 2}px - 1.75rem)` }}>
        <span className="text-2xl font-bold text-white">{pct.toFixed(1)}%</span>
        <span className="text-xs" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
