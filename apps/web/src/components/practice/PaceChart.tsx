'use client';

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/**
 * Pace bar chart for the practice results screen. Isolated in its own module so
 * recharts (+ its D3 tree, ~100 KB gzip) is code-split out of the /practice bundle
 * and only loaded lazily when a session actually finishes.
 */
export function PaceChart({ blocks }: { blocks: Array<{ block: string; correct: number }> }) {
  return (
    <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)' }}>
      <div className="text-label mb-3 text-left" style={{ color: 'var(--text-secondary)' }}>Pace — correct per 10s</div>
      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={blocks}>
            <XAxis dataKey="block" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" width={24} />
            <Tooltip cursor={{ fill: 'var(--pink-50)' }} />
            <Bar dataKey="correct" fill="var(--pink-300)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
