'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';

export default function DashboardPage() {
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const { lang, t } = useLang();
  const d = t.dashboard;
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoad, setAppsLoad] = useState(false);
  const [available, setAvailable] = useState<boolean>(false);
  const [availLoaded, setAvailLoaded] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [aadhaarUrl, setAadhaarUrl] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  useEffect(() => {
    if (profile) {
      setAvailable(profile.available === true);
      setAvailLoaded(true);
      if (profile.aadhaar) {
        const base = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
        setAadhaarUrl(`${base}/api/files/profiles/${profile.id}/${profile.aadhaar}`);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setAppsLoad(true);
    getPb().collection('applications').getList(1, 20, {
      filter: `applicant="${user.id}"`, expand: 'job', sort: '-created',
    }).then(r => setApps(r.items)).catch(() => setApps([])).finally(() => setAppsLoad(false));
  }, [user]);

  const toggleAvailability = async () => {
    if (!profile?.id) { alert(lang === 'hi' ? 'पहले अपनी प्रोफाइल पूरी करें।' : 'Please complete your profile first.'); return; }
    setToggling(true);
    const next = !available;
    setAvailable(next);
    try {
      await getPb().collection('profiles').update(profile.id, { available: next });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    } catch (e) {
      console.error(e);
      setAvailable(!next);
      alert('Could not save. Make sure the "profiles" collection has an "available" (bool) field in PocketBase.');
    } finally { setToggling(false); }
  };

  if (loading || profileLoading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return null;

  const name = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const statusMap: Record<string, { label: string; bg: string; color: string }> = {
    pending: { label: lang === 'hi' ? '⏳ लंबित' : '⏳ Pending', bg: '#fefce8', color: '#d97706' },
    accepted: { label: lang === 'hi' ? '✅ स्वीकृत' : '✅ Accepted', bg: '#f0fdf4', color: '#16a34a' },
    rejected: { label: lang === 'hi' ? '❌ अस्वीकृत' : '❌ Rejected', bg: '#fef2f2', color: '#dc2626' },
  };

  const card: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero strip */}
      <header style={{ background: 'linear-gradient(135deg,#0f4c25,#16a34a)', padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 900, border: '3px solid rgba(255,255,255,0.4)' }}>
              {initials}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
                {lang === 'hi' ? `नमस्ते, ${name.split(' ')[0]}! 👋` : `Hello, ${name.split(' ')[0]}! 👋`}
              </h1>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/onboarding" style={{ fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', textDecoration: 'none', backdropFilter: 'blur(4px)' }}>
              {lang === 'hi' ? '✏️ प्रोफाइल संपादित करें' : '✏️ Edit Profile'}
            </Link>
            <button onClick={() => { logout(); router.push('/'); }} style={{ fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.8)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'hi' ? 'लॉग आउट' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '-40px auto 0', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20, alignItems: 'start' }}>

          {/* ── Availability toggle ── */}
          <div style={{ ...card, textAlign: 'center' as const, padding: '36px 28px', position: 'relative' as const }}>
            {savedToast && (
              <div className="slide-down" style={{ position: 'absolute' as const, top: 16, left: '50%', transform: 'translateX(-50%)', background: '#16a34a', color: '#fff', borderRadius: 99, padding: '8px 20px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' as const, boxShadow: '0 4px 16px rgba(22,163,74,0.4)', zIndex: 10 }}>
                ✅ Saved!
              </div>
            )}

            <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 18, marginBottom: 6 }}>
              {lang === 'hi' ? 'मेरी उपलब्धता' : 'My Availability'}
            </div>

            {/* Status indicator */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: !availLoaded ? '#f1f5f9' : available ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${!availLoaded ? '#e2e8f0' : available ? '#d1fae5' : '#fecaca'}`,
              borderRadius: 99, padding: '6px 16px', marginBottom: 20, fontSize: 13, fontWeight: 700,
              color: !availLoaded ? '#94a3b8' : available ? '#16a34a' : '#dc2626',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }} />
              {!availLoaded ? 'Loading…' : available
                ? (lang === 'hi' ? 'नियोक्ताओं को दिखाई दे रहे हैं' : 'Visible to employers')
                : (lang === 'hi' ? 'नियोक्ताओं से छुपे हैं' : 'Hidden from employers')}
            </div>

            {/* Toggle switch */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <button
                onClick={toggleAvailability}
                disabled={toggling || !availLoaded}
                aria-label={available ? 'Go offline' : 'Go available'}
                aria-pressed={available}
                style={{
                  position: 'relative', width: 80, height: 40, borderRadius: 99, border: 'none',
                  cursor: (toggling || !availLoaded) ? 'not-allowed' : 'pointer',
                  background: !availLoaded ? '#e2e8f0' : available ? '#16a34a' : '#cbd5e1',
                  transition: 'background 0.3s',
                  boxShadow: available ? '0 4px 16px rgba(22,163,74,0.35)' : 'none',
                }}>
                <span style={{
                  position: 'absolute', top: 4, width: 32, height: 32, borderRadius: '50%',
                  background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  transition: 'left 0.3s',
                  left: available ? 'calc(100% - 36px)' : '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                }}>
                  {toggling ? '⏳' : available ? '🟢' : '🔴'}
                </span>
              </button>
            </div>

            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 8 }}>
              {!availLoaded
                ? (lang === 'hi' ? 'स्थिति लोड हो रही है…' : 'Loading your status…')
                : available
                  ? (lang === 'hi' ? '✅ आप दिख रहे हैं — नियोक्ता आपको खोज और संपर्क कर सकते हैं' : '✅ You are VISIBLE — employers can find and contact you')
                  : (lang === 'hi' ? '❌ आप छुपे हैं — कोई आपको नहीं देख सकता' : '❌ You are HIDDEN — nobody can see or contact you')}
            </p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>
              {lang === 'hi' ? 'टॉगल दबाएं · ऑटो-सेव' : 'Tap toggle to switch · Auto-saved'}
            </p>
          </div>

          {/* ── Aadhaar card preview ── */}
          {aadhaarUrl && (
            <div style={card}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 14 }}>
                {lang === 'hi' ? '🪪 ID सत्यापित' : '🪪 ID Verified'}
              </div>
              <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={aadhaarUrl} alt="Aadhaar card" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#16a34a', fontWeight: 600, textAlign: 'center' as const }}>
                {lang === 'hi' ? '✅ आधार कार्ड अपलोड और सत्यापित' : '✅ Aadhaar card uploaded & verified'}
              </div>
            </div>
          )}

          {/* ── Profile info ── */}
          <div style={card}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{lang === 'hi' ? '📋 मेरी जानकारी' : '📋 My Info'}</span>
              {!profile && <Link href="/onboarding" style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
                {lang === 'hi' ? 'पूरा करें →' : 'Complete →'}
              </Link>}
            </div>
            {profile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {([
                  ['👤', lang === 'hi' ? 'नाम' : 'Name', profile.name],
                  ['📱', lang === 'hi' ? 'फोन' : 'Phone', profile.contact ? `+91 ${profile.contact}` : null],
                  ['📍', lang === 'hi' ? 'स्थान' : 'Location', profile.location],
                  ['🎂', lang === 'hi' ? 'जन्म तिथि' : 'DOB', profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null],
                ] as [string, string, string | null][]).filter(([, , v]) => v).map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, padding: '11px 0', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontSize: 16 }}>{icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13, minWidth: 72 }}>{label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{val}</span>
                  </div>
                ))}
                {profile.skills && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.05em' }}>
                      {lang === 'hi' ? 'कौशल' : 'SKILLS'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {profile.skills.split(', ').filter(Boolean).map((s: string) => (
                        <span key={s} style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#16a34a', borderRadius: 99, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center' as const, padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  {lang === 'hi' ? 'प्रोफाइल अभी तक पूरी नहीं है।' : 'Profile not complete yet.'}
                </p>
                <Link href="/onboarding" style={{ display: 'inline-block', marginTop: 12, background: '#16a34a', color: '#fff', fontWeight: 700, padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontSize: 13 }}>
                  {lang === 'hi' ? 'प्रोफाइल पूरी करें' : 'Complete Profile'}
                </Link>
              </div>
            )}
          </div>

          {/* ── My applied jobs ── */}
          <div style={card}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{lang === 'hi' ? '💼 मेरे आवेदन' : '💼 My Applications'}</span>
              <Link href="/gigs" style={{ fontSize: 13, color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
                {lang === 'hi' ? 'खोजें →' : 'Browse →'}
              </Link>
            </div>
            {appsLoad ? (
              <p style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center' as const, padding: 20 }}>
                {lang === 'hi' ? 'लोड हो रहा है…' : 'Loading…'}
              </p>
            ) : apps.length === 0 ? (
              <div style={{ textAlign: 'center' as const, padding: '24px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <p style={{ color: '#64748b', fontSize: 14 }}>
                  {lang === 'hi' ? 'आपने अभी तक किसी नौकरी के लिए आवेदन नहीं किया।' : "You haven't applied to any jobs yet."}
                </p>
                <Link href="/gigs" style={{ display: 'inline-block', marginTop: 12, color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  {lang === 'hi' ? 'नौकरी खोजें →' : 'Find Jobs →'}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {apps.map((app: any) => {
                  const s = statusMap[app.status] || statusMap.pending;
                  return (
                    <div key={app.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 12, padding: '13px 14px', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>{app.expand?.job?.title || 'Job'}</div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {lang === 'hi' ? 'आवेदन किया ' : 'Applied '}
                          {new Date(app.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                        <div style={{ fontSize: 12, color: '#4b7a5a', marginTop: 3 }}>
                          {lang === 'hi' ? 'नियोक्ता जल्द संपर्क करेगा।' : 'The hiring person will contact you.'}
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 99, background: s.bg, color: s.color, whiteSpace: 'nowrap' as const }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={card}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 16 }}>
              {lang === 'hi' ? '🚀 त्वरित कार्य' : '🚀 Quick Actions'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { href: '/gigs', icon: '💼', label: lang === 'hi' ? 'नौकरी खोजें' : 'Find Jobs', color: '#f0fdf4', border: '#d1fae5', tc: '#16a34a' },
                { href: '/gigs', icon: '📋', label: lang === 'hi' ? 'नौकरी पोस्ट' : 'Post a Job', color: '#eff6ff', border: '#bfdbfe', tc: '#3b82f6' },
                { href: '/pick-drop', icon: '🛵', label: lang === 'hi' ? 'पिक & ड्रॉप' : 'Pick & Drop', color: '#fef9ee', border: '#fde68a', tc: '#d97706' },
                { href: '/onboarding', icon: '✏️', label: lang === 'hi' ? 'प्रोफाइल संपादित' : 'Edit Profile', color: '#fdf4ff', border: '#e9d5ff', tc: '#9333ea' },
              ].map(l => (
                <Link key={l.href + l.label} href={l.href}
                  style={{ background: l.color, border: `1px solid ${l.border}`, borderRadius: 14, padding: '16px', textAlign: 'center' as const, textDecoration: 'none', display: 'block', transition: 'transform 0.15s' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{l.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: l.tc }}>{l.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}