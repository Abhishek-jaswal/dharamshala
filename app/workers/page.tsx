'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CATEGORIES, DEMO_WORKERS } from '@/lib/data';
import { WorkerCard } from '@/components/WorkerCard';
import { useLang } from '@/context/LangContext';

const FilterTab = ({ active, onClick, children }: any) => (
  <button onClick={onClick}
    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
      active ? 'bg-green-600 text-white border-green-600' : 'border-green-200 text-green-700 hover:bg-green-50'
    }`}>{children}
  </button>
);

export default function WorkersPage() {
  const { t } = useLang();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? DEMO_WORKERS : DEMO_WORKERS.filter(w => w.cat === filter);

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">{t.home.workersTitle}</h1>
        <p className="text-green-500 text-sm mt-1">All workers are ID-verified, skill-tested, and insured</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>All Workers</FilterTab>
        {CATEGORIES.map(c => (
          <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(w => (
          <WorkerCard key={w.id} worker={w} onBook={() => router.push('/booking')} />
        ))}
        {shown.length === 0 && (
          <div className="col-span-3 text-center py-16 text-green-300">
            <div className="text-4xl mb-3">👷</div>
            <p className="font-semibold text-green-500">No workers in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
