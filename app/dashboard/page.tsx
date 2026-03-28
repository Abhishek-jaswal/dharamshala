'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';

export default function DashboardPage() {
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const router = useRouter();
  const [apps, setApps]         = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [available, setAvailable] = useState<boolean>(profile?.available ?? true);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  useEffect(() => {
    if (profile?.available !== undefined) setAvailable(profile.available);
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setAppsLoading(true);
    getPb().collection('applications').getList(1, 20, {
      filter: `applicant_id="${user.id}"`,
      expand: 'job_id',
      sort: '-created',
    }).then(res => setApps(res.items)).catch(() => setApps([])).finally(() => setAppsLoading(false));
  }, [user]);

  const toggleAvailability = async () => {
    if (!profile?.id) return;
    setSavingStatus(true);
    const next = !available;
    setAvailable(next);
    try {
      await getPb().collection('profiles').update(profile.id, { available: next });
    } catch { setAvailable(!next); }
    finally { setSavingStatus(false); }
  };

  if (loading || profileLoading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#16a34a', fontSize:16, fontFamily:"'Outfit',sans-serif" }}>Loading…</p>
    </div>
  );
  if (!user) return null;

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);

  const card: React.CSSProperties = { background:'#fff', border:'1.5px solid #e6f4ea', borderRadius:18, padding:20 };
  const statusColors = { pending:'#f59e0b', accepted:'#16a34a', rejected:'#dc2626' };

  return (
    <div style={{ minHeight:'100vh', background:'#f9fffe', fontFamily:"'Outfit',sans-serif" }}>

      {/* Top bar */}
      <div style={{ background:'#fff', borderBottom:'2px solid #e6f4ea', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, position:'sticky', top:0, zIndex:10 }}>
        <h1 style={{ fontSize:18, fontWeight:900, color:'#14532d' }}>My Profile</h1>
        <div style={{ display:'flex', gap:8 }}>
          <Link href="/onboarding" style={{ fontSize:13, fontWeight:700, padding:'8px 14px', borderRadius:10, border:'1.5px solid #e6f4ea', color:'#14532d', background:'#fff', textDecoration:'none' }}>✏️ Edit Profile</Link>
          <button onClick={() => { logout(); router.push('/'); }} style={{ fontSize:13, fontWeight:700, padding:'8px 14px', borderRadius:10, border:'1.5px solid #fecaca', color:'#dc2626', background:'#fff', cursor:'pointer', fontFamily:'inherit' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'24px 16px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* Welcome */}
        <div style={{ ...card, display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#4ade80)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, fontWeight:900, flexShrink:0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:900, color:'#14532d' }}>Hello, {displayName.split(' ')[0]}! 👋</div>
            <div style={{ fontSize:14, color:'#6b7280', marginTop:2 }}>{user?.email}</div>
            {profile?.location && <div style={{ fontSize:13, color:'#16a34a', marginTop:4 }}>📍 {profile.location}</div>}
          </div>
        </div>

        {/* Complete profile banner */}
        {!profile && (
          <div style={{ background:'#fefce8', border:'2px solid #fde68a', borderRadius:16, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
            <p style={{ fontWeight:700, color:'#92400e', fontSize:14 }}>⚠️ Complete your profile to get hired!</p>
            <Link href="/onboarding" style={{ background:'#f59e0b', color:'#fff', fontWeight:800, padding:'9px 18px', borderRadius:10, textDecoration:'none', fontSize:13, whiteSpace:'nowrap' as const }}>Fill Now →</Link>
          </div>
        )}

        {/* ✅ BIG AVAILABILITY TOGGLE - for workers/runners */}
        <div style={{ ...card, textAlign:'center', padding:'32px 24px' }}>
          <div style={{ fontSize:17, fontWeight:800, color:'#14532d', marginBottom:6 }}>
            Am I Available for Work?
          </div>
          <p style={{ color:'#6b7280', fontSize:14, marginBottom:24, lineHeight:1.6 }}>
            {available
              ? '✅ You are VISIBLE. People can find and contact you.'
              : '❌ You are HIDDEN. Nobody can see or contact you right now.'}
          </p>
          <button onClick={toggleAvailability} disabled={savingStatus}
            style={{ width:'100%', padding:'22px 24px', borderRadius:20, border:'none', cursor: savingStatus ? 'not-allowed' : 'pointer', fontFamily:'inherit', fontSize:20, fontWeight:900, transition:'all 0.3s',
              background: available ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f3f4f6',
              color: available ? '#fff' : '#9ca3af',
              boxShadow: available ? '0 8px 32px rgba(22,163,74,0.3)' : 'none',
            }}>
            {savingStatus ? '...' : available ? '🟢  I AM AVAILABLE' : '🔴  I AM NOT AVAILABLE'}
          </button>
          <p style={{ marginTop:12, fontSize:13, color:'#9ca3af' }}>Tap to switch your status</p>
        </div>

        {/* Profile info */}
        {profile && (
          <div style={card}>
            <div style={{ fontWeight:800, color:'#14532d', fontSize:16, marginBottom:14 }}>📋 My Info</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['👤 Name',    profile.name],
                ['📱 Phone',   profile.contact ? `+91 ${profile.contact}` : null],
                ['📍 Location',profile.location],
                ['🎂 Birthday',profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : null],
              ].filter(([,v]) => v).map(([label, val]) => (
                <div key={label as string} style={{ display:'flex', gap:12, padding:'10px 0', borderBottom:'1px solid #f0fdf4' }}>
                  <span style={{ color:'#6b7280', fontSize:14, minWidth:120 }}>{label}</span>
                  <span style={{ fontWeight:700, color:'#14532d', fontSize:14 }}>{val}</span>
                </div>
              ))}
            </div>
            {profile.skills && (
              <div style={{ marginTop:14 }}>
                <div style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', marginBottom:8 }}>🛠️ My Skills</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {profile.skills.split(', ').filter(Boolean).map((s: string) => (
                    <span key={s} style={{ background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:99, padding:'4px 12px', fontSize:13, fontWeight:600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My applied jobs */}
        <div style={card}>
          <div style={{ fontWeight:800, color:'#14532d', fontSize:16, marginBottom:14 }}>💼 Jobs I Applied To</div>
          {appsLoading ? (
            <p style={{ color:'#9ca3af', fontSize:14, textAlign:'center', padding:20 }}>Loading…</p>
          ) : apps.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0' }}>
              <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
              <p style={{ color:'#9ca3af', fontSize:14, marginBottom:12 }}>You haven't applied to any jobs yet.</p>
              <Link href="/gigs" style={{ color:'#16a34a', fontWeight:700, textDecoration:'none', fontSize:14 }}>Browse Jobs →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {apps.map((app: any) => (
                <div key={app.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f0fdf4', borderRadius:12, padding:'12px 14px', gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, color:'#14532d', fontSize:14 }}>{app.expand?.job_id?.title || 'Job'}</div>
                    <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{new Date(app.created).toLocaleDateString('en-IN')}</div>
                  </div>
                  <span style={{ fontWeight:700, fontSize:12, padding:'4px 10px', borderRadius:99, background: app.status==='accepted' ? '#dcfce7' : app.status==='rejected' ? '#fef2f2' : '#fefce8', color: (statusColors as any)[app.status] || '#f59e0b' }}>
                    {app.status === 'accepted' ? '✅ Accepted' : app.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:10, paddingBottom:16 }}>
          {[
            { href:'/gigs', icon:'💼', label:'Find Jobs' },
            { href:'/onboarding', icon:'✏️', label:'Edit Profile' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ background:'#fff', border:'1.5px solid #e6f4ea', borderRadius:16, padding:'18px', textAlign:'center', textDecoration:'none', display:'block' }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{l.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:'#14532d' }}>{l.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
