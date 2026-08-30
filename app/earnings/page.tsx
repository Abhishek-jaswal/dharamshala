'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import type { Earning, Application } from '@/lib/types';

const colors = {
  green: '#16a34a',
  greenDark: '#0f4c25',
  slate900: '#0f172a',
  slate600: '#475569',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  bg: '#f8fafc',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: `1px solid ${colors.slate200}`,
  borderRadius: 20,
  padding: 24,
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

// Best-effort extraction of a ₹ number out of a free-text pay field like
// "₹500/day" or "800 - 1200". Used only for the "Pipeline value" estimate —
// real credited earnings should always come from the `earnings` collection.
function parsePay(pay?: string): number {
  if (!pay) return 0;
  const match = pay.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

export default function EarningsPage() {
  const { user, profile, loading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();

  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [fetching, setFetching] = useState(true);
  const [collectionMissing, setCollectionMissing] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    const pb = getPb();
    setFetching(true);

    Promise.all([
      pb.collection('earnings')
        .getList(1, 100, { filter: `user="${user.id}"`, expand: 'job', sort: '-created' })
        .then(r => r.items as unknown as Earning[])
        .catch(() => { setCollectionMissing(true); return []; }),
      pb.collection('applications')
        .getList(1, 100, { filter: `applicant="${user.id}" && status="accepted"`, expand: 'job', sort: '-created' })
        .then(r => r.items as unknown as Application[])
        .catch(() => []),
    ]).then(([e, a]) => {
      setEarnings(e);
      setApplications(a);
    }).finally(() => setFetching(false));
  }, [user]);

  const stats = useMemo(() => {
    const credited = earnings.filter(e => e.status === 'credited').reduce((s, e) => s + (e.amount || 0), 0);
    const pending = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + (e.amount || 0), 0);
    const withdrawn = earnings.filter(e => e.status === 'withdrawn').reduce((s, e) => s + (e.amount || 0), 0);

    const now = new Date();
    const thisMonth = earnings
      .filter(e => {
        const d = new Date(e.created);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + (e.amount || 0), 0);

    const pipeline = applications.reduce((s, a) => s + parsePay(a.expand?.job?.pay), 0);

    return { credited, pending, withdrawn, thisMonth, pipeline, jobsCompleted: applications.length };
  }, [earnings, applications]);

  if (loading || (fetching && !user)) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }
  if (!user) return null;

  const t = (en: string, hi: string) => (lang === 'hi' ? hi : en);

  const statCards = [
    { label: t('Total Credited', 'कुल जमा'), value: stats.credited, icon: '💰', color: colors.green, bg: '#f0fdf4' },
    { label: t('This Month', 'इस महीने'), value: stats.thisMonth, icon: '📈', color: '#3b82f6', bg: '#eff6ff' },
    { label: t('Pending Payout', 'लंबित भुगतान'), value: stats.pending, icon: '⏳', color: '#d97706', bg: '#fef9ee' },
    { label: t('Already Withdrawn', 'निकाला गया'), value: stats.withdrawn, icon: '🏦', color: '#64748b', bg: '#f1f5f9' },
  ];

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: colors.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <header style={{ background: `linear-gradient(135deg,${colors.greenDark},${colors.green})`, padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            💰 {t('My Earnings', 'मेरी कमाई')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
            {t(`${stats.jobsCompleted} jobs completed so far`, `अब तक ${stats.jobsCompleted} नौकरियां पूरी हुईं`)}
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '-48px auto 0', padding: '0 24px 60px' }}>
        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 20 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ ...card, background: s.bg, border: 'none' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>₹{s.value.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 13, color: colors.slate500, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* Earnings history */}
          <div style={card}>
            <div style={{ fontWeight: 800, color: colors.slate900, fontSize: 16, marginBottom: 16 }}>
              {t('📜 Earnings History', '📜 कमाई का इतिहास')}
            </div>

            {collectionMissing && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 12, color: '#92400e' }}>
                {t(
                  'Set up an "earnings" collection in PocketBase (user, job, application, amount, status, note) to start crediting real payouts here. Showing your accepted-job pipeline below in the meantime.',
                  'यहां असली भुगतान दिखाने के लिए PocketBase में "earnings" कलेक्शन बनाएं (user, job, application, amount, status, note)। तब तक नीचे आपके स्वीकृत जॉब्स दिखाए जा रहे हैं।'
                )}
              </div>
            )}

            {earnings.length === 0 ? (
              applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                  <p style={{ color: colors.slate500, fontSize: 14 }}>
                    {t("You haven't completed any jobs yet.", 'आपने अभी तक कोई नौकरी पूरी नहीं की।')}
                  </p>
                  <Link href="/gigs" style={{ color: colors.green, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    {t('Find Jobs →', 'नौकरी खोजें →')}
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {applications.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 12, padding: '13px 14px' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: colors.slate900, fontSize: 14 }}>{a.expand?.job?.title || 'Job'}</div>
                        <div style={{ fontSize: 12, color: colors.slate500, marginTop: 2 }}>
                          {t('Accepted ', 'स्वीकृत ')}{new Date(a.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <span style={{ fontWeight: 800, color: colors.green, fontSize: 14 }}>{a.expand?.job?.pay || '—'}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {earnings.map(e => {
                  const statusStyle = {
                    credited: { bg: '#f0fdf4', color: colors.green, label: t('Credited', 'जमा') },
                    pending: { bg: '#fef9ee', color: '#d97706', label: t('Pending', 'लंबित') },
                    withdrawn: { bg: '#f1f5f9', color: '#64748b', label: t('Withdrawn', 'निकाला गया') },
                  }[e.status];
                  return (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 12, padding: '13px 14px', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: colors.slate900, fontSize: 14 }}>{e.expand?.job?.title || e.note || 'Job'}</div>
                        <div style={{ fontSize: 12, color: colors.slate500, marginTop: 2 }}>
                          {new Date(e.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: colors.slate900, fontSize: 14 }}>₹{e.amount.toLocaleString('en-IN')}</div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 99, background: statusStyle.bg, color: statusStyle.color }}>{statusStyle.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: colors.slate500, fontWeight: 700, marginBottom: 6 }}>
                {t('PIPELINE VALUE (ESTIMATE)', 'पाइपलाइन मूल्य (अनुमानित)')}
              </div>
              <div style={{ fontSize: 26, fontWeight: 900, color: colors.slate900 }}>₹{stats.pipeline.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 12, color: colors.slate500, marginTop: 4 }}>
                {t('Based on accepted job listings', 'स्वीकृत नौकरी लिस्टिंग के आधार पर')}
              </div>
            </div>

            {profile?.plan !== 'pro' && profile?.plan !== 'business' && (
              <div style={{ ...card, background: `linear-gradient(135deg,${colors.greenDark},${colors.green})`, border: 'none' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                  🚀 {t('Earn faster with Pro', 'प्रो के साथ तेज़ी से कमाएं')}
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 14, lineHeight: 1.6 }}>
                  {t('Featured professionals get up to 3× more bookings.', 'फीचर्ड प्रोफेशनल्स को 3 गुना तक ज़्यादा बुकिंग मिलती है।')}
                </p>
                <Link href="/premium" style={{ display: 'block', textAlign: 'center', background: '#fff', color: colors.green, fontWeight: 800, fontSize: 13, padding: '10px', borderRadius: 10, textDecoration: 'none' }}>
                  {t('Upgrade Now →', 'अभी अपग्रेड करें →')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
