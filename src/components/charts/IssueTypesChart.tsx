import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface IssueTypesChartProps {
  data: { name: string; value: number; color: string }[];
}

const RADIAN = Math.PI / 180;
function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.04) return null;
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function IssueTypesChart({ data }: IssueTypesChartProps) {
  const hasData = data.some(d => d.value > 0);
  if (!hasData) return (
    <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No issues detected</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data.filter(d => d.value > 0)}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.filter(d => d.value > 0).map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: '#1e2130',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 12,
          }}
          formatter={(value: number, name: string) => [value.toLocaleString(), name]}
        />
        <Legend
          formatter={(value: string) => (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
          )}
          wrapperStyle={{ paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
