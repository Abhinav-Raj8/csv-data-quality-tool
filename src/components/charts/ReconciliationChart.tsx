import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from 'recharts';

interface ReconciliationChartProps {
  matched: number;
  mismatched: number;
  missingPayment: number;
}

export function ReconciliationChart({ matched, mismatched, missingPayment }: ReconciliationChartProps) {
  const data = [
    { name: 'Matched',         count: matched,        color: '#10b981' },
    { name: 'Mismatch',        count: mismatched,     color: '#f97316' },
    { name: 'Missing Payment', count: missingPayment, color: '#ef4444' },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <Tooltip
          contentStyle={{
            background: '#1e2130',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 12,
          }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          formatter={(value: number) => [value.toLocaleString(), 'Orders']}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={80}>
          <LabelList
            dataKey="count"
            position="top"
            style={{ fill: '#94a3b8', fontSize: 11 }}
            formatter={(v: number) => v.toLocaleString()}
          />
          {data.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
