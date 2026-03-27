'use client';
import Link from 'next/link';
import { useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import { useLang } from '@/context/LangContext';
import { Badge } from '@/components/Badge';

const FilterTab = ({ active, onClick, children }: any) => (
  <button onClick={onClick}
    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
      active ? 'bg-green-600 text-white border-green-600' : 'border-green-200 text-green-700 hover:bg-green-50'
    }`}>{children}
  </button>
);

export default function ServicesPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState('all');
  const shown = filter === 'all' ? CATEGORIES : CATEGORIES.filter(c => c.id === filter);

  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">{t.home.categoriesTitle}</h1>
        <p className="text-green-500 text-sm mt-1">{t.home.categoriesSub}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        <FilterTab active={filter === 'all'} onClick={() => setFilter('all')}>{t.gigs.allCats}</FilterTab>
        {CATEGORIES.map(c => (
          <FilterTab key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>{c.icon} {c.label}</FilterTab>
        ))}
      </div>

      <div className="space-y-12">
        {shown.map(cat => (
          <div key={cat.id}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">{cat.icon}</div>
              <div>
                <h3 className="font-bold text-green-900 text-lg">{cat.label}</h3>
                <p className="text-xs text-green-400">{cat.count.toLocaleString()} workers available</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {cat.subs.map(sub => (
                <Link key={sub.name} href="/workers"
                  className="bg-white border border-green-100 rounded-2xl p-4 text-center cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 block">
                  <div className="text-2xl mb-2">{sub.icon}</div>
                  <div className="text-xs font-semibold text-green-800 leading-tight mb-1">{sub.name}</div>
                  <div className="text-xs text-green-400">From ₹{sub.from}/{sub.unit}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
