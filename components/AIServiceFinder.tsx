'use client';

import { useState } from 'react';
import { useLang } from '@/context/LangContext';

type MatchResult = {
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  subName: string;
  subIcon: string;
  confidence: number;
  source?: 'ai' | 'keyword';
};

const EXAMPLES = [
  { en: 'My bathroom tap is leaking', hi: 'मेरे बाथरूम का नल लीक हो रहा है' },
  { en: 'AC cooling nahi kar raha, unusual sound aa rahi hai', hi: 'AC ठंडा नहीं कर रहा, अजीब आवाज़ आ रही है' },
  { en: 'Need someone to shift my house', hi: 'घर शिफ्ट करने के लिए आदमी चाहिए' },
  { en: 'Wifi is very slow at home', hi: 'घर पर वाईफाई बहुत धीमा है' },
];

interface AIServiceFinderProps {
  onMatch?: (categoryId: string) => void;
}

export default function AIServiceFinder({ onMatch }: AIServiceFinderProps) {
  const { lang } = useLang();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null | undefined>(undefined); // undefined = not searched yet
  const t = (en: string, hi: string) => (lang === 'hi' ? hi : en);

  const runSearch = async (text: string) => {
    if (!text.trim()) return;
    setQuery(text);
    setLoading(true);
    setResult(undefined);
    try {
      const res = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setResult(data.result ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ padding: '0 24px 56px', background: '#f8fafc' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 24,
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>
              {t("Don't know what service you need?", 'नहीं पता कौन सी सर्विस चाहिए?')}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
            {t('Just describe your problem — we\u2019ll find the right professional for you.', 'बस अपनी समस्या बताएं — हम आपके लिए सही प्रोफेशनल खोज देंगे।')}
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
            style={{ display: 'flex', gap: 8, marginBottom: 14 }}
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('e.g. My bathroom tap is leaking…', 'जैसे: मेरे नल से पानी टपक रहा है…')}
              style={{
                flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 14, padding: '13px 16px',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{
                background: '#16a34a', color: '#fff', border: 'none', borderRadius: 14,
                padding: '13px 22px', fontWeight: 800, fontSize: 14, fontFamily: 'inherit',
                cursor: loading ? 'wait' : 'pointer', flexShrink: 0,
              }}
            >
              {loading ? '⏳' : `🔍 ${t('Find', 'खोजें')}`}
            </button>
          </form>

          {/* Example chips */}
          {result === undefined && !loading && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXAMPLES.map(ex => (
                <button
                  key={ex.en}
                  onClick={() => runSearch(lang === 'hi' ? ex.hi : ex.en)}
                  style={{
                    background: '#f0fdf4', border: '1px solid #d1fae5', color: '#16a34a',
                    borderRadius: 99, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {lang === 'hi' ? ex.hi : ex.en}
                </button>
              ))}
            </div>
          )}

          {/* Result */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 4px', color: '#64748b', fontSize: 14 }}>
              <div className="spinner" style={{ width: 18, height: 18 }} />
              {t('Understanding your problem…', 'आपकी समस्या समझी जा रही है…')}
            </div>
          )}

          {result === null && !loading && (
            <div style={{ background: '#fef9ee', border: '1px solid #fde68a', borderRadius: 14, padding: '14px 16px', fontSize: 13, color: '#92400e' }}>
              {t(
                'Couldn\u2019t match that to a specific service — try describing it differently, or browse categories below.',
                'इसके लिए कोई सर्विस नहीं मिली — अलग तरीके से बताएं, या नीचे कैटेगरी देखें।'
              )}
            </div>
          )}

          {result && !loading && (
            <div
              style={{
                background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
                border: '1px solid #bbf7d0',
                borderRadius: 16,
                padding: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 30 }}>{result.subIcon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', letterSpacing: '0.05em', marginBottom: 2 }}>
                    {result.categoryIcon} {result.categoryLabel.toUpperCase()}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 17, color: '#0f172a' }}>{result.subName}</div>
                </div>
              </div>
              <button
                onClick={() => onMatch?.(result.categoryId)}
                style={{
                  background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12,
                  padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'inherit', cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('View Professionals →', 'प्रोफेशनल देखें →')}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
