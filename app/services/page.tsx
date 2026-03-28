'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { useLang } from '@/context/LangContext';
import { Badge } from '@/components/Badge';

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

export default function ServicesPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.id === filter);

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#14532d' }}>{t.home.categoriesTitle}</h1>
        <p style={{ color: '#16a34a', fontSize: 13, marginTop: 4 }}>{t.home.categoriesSub}</p>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 32 }}>
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>{t.gigs.allCats}</FilterTab>
        {CATEGORIES.map(c => (
          <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        {shown.map(cat => (
          <div key={cat.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{cat.icon}</div>
              <div>
                <h3 style={{ fontWeight: 700, color: '#14532d', fontSize: 17 }}>{cat.label}</h3>
                <p style={{ fontSize: 12, color: '#86b899' }}>{cat.count.toLocaleString()} workers available</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {cat.subs.map(sub => (
                <Link key={sub.name} href="/workers" style={{
                  background: '#fff', border: '1px solid #d1fae5', borderRadius: 16,
                  padding: 16, textAlign: 'center' as const, cursor: 'pointer', textDecoration: 'none', display: 'block',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 8px 24px rgba(22,163,74,0.12)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{sub.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#14532d', lineHeight: 1.3, marginBottom: 4 }}>{sub.name}</div>
                  <div style={{ fontSize: 11, color: '#86b899' }}>From ₹{sub.from}/{sub.unit}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
