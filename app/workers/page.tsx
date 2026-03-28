'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, DEMO_WORKERS } from '@/lib/data';
import { WorkerCard } from '@/components/WorkerCard';
import { useLang } from '@/context/LangContext';

const FilterTab = ({ active, onClick, children }: any) => (
  <button onClick={onClick} style={{
    fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 99,
    border: '1px solid', whiteSpace: 'nowrap' as const, cursor: 'pointer', fontFamily: 'inherit',
    borderColor: active ? '#16a34a' : '#d1fae5',
    background: active ? '#16a34a' : '#fff',
    color: active ? '#fff' : '#15803d',
    transition: 'all 0.15s', flexShrink: 0,
  }}>{children}</button>
);

export default function WorkersPage() {
  const { t } = useLang();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? DEMO_WORKERS : DEMO_WORKERS.filter(w => w.cat === filter);

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#14532d' }}>{t.home.workersTitle}</h1>
        <p style={{ color: '#16a34a', fontSize: 13, marginTop: 4 }}>All workers are ID-verified, skill-tested, and insured</p>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>All Workers</FilterTab>
        {CATEGORIES.map(c => (
          <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {shown.map(w => (
          <WorkerCard key={w.id} worker={w} onBook={() => router.push('/booking')} />
        ))}
        {shown.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 0', color: '#86b899' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👷</div>
            <p style={{ fontWeight: 600, color: '#4b7a5a' }}>No workers in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
