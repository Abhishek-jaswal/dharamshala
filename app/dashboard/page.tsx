'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import { Badge } from '@/components/Badge';

export default function DashboardPage() {
  const { user, profile, loading, profileLoading, logout, isNewUser } = useAuth();
  const { t, toggle } = useLang();
  const d = t.dashboard;
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [aadhaarUrl, setAadhaarUrl] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  useEffect(() => {
    if (profile?.aadhaar) {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      setAadhaarUrl(`${pbUrl}/api/files/profiles/${profile.id}/${profile.aadhaar}`);
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    setAppsLoading(true);
    getPb().collection('applications').getList(1, 20, { filter:`applicant_id="${user.id}"`, expand:'job_id', sort:'-created' })
      .then(res => setApps(res.items))
      .catch(() => setApps([]))
      .finally(() => setAppsLoading(false));
  }, [user]);

  if (loading || profileLoading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
      <div className="spinner" />
      <p style={{ color:'#16a34a', fontSize:14 }}>Loading…</p>
    </div>
  );

  if (!user) return null;

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);

  const card: React.CSSProperties = { background:'#fff', border:'1px solid #d1fae5', borderRadius:16, padding:20 };
  const label: React.CSSProperties = { fontSize:11, fontWeight:700, color:'#86b899', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5, display:'block' };
  const value: React.CSSProperties = { fontSize:14, fontWeight:600, color:'#14532d' };
  const inputStyle: React.CSSProperties = { width:'100%', border:'1.5px solid #d1fae5', borderRadius:10, padding:'9px 12px', fontSize:14, color:'#14532d', fontFamily:'inherit', outline:'none', background:'#f0fdf4', boxSizing:'border-box' };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#f0fdf4,#dcfce7 60%,#bbf7d0)', fontFamily:"'Outfit',sans-serif" }}>
      {/* Top bar */}
      <div style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(12px)', borderBottom:'1px solid #d1fae5', padding:'12px 16px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8, position:'sticky', top:0, zIndex:10 }}>
        <h1 style={{ fontSize:17, fontWeight:800, color:'#14532d' }}>{d.title}</h1>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button onClick={toggle} style={{ fontSize:12, fontWeight:700, padding:'6px 12px', borderRadius:20, border:'1px solid #d1fae5', color:'#16a34a', background:'#fff', cursor:'pointer' }}>🌐 {t.toggle}</button>
          <Link href="/onboarding" style={{ fontSize:13, fontWeight:600, padding:'7px 14px', borderRadius:10, border:'1px solid #d1fae5', color:'#15803d', background:'#fff', textDecoration:'none', display:'inline-block' }}>✏️ {d.editProfile}</Link>
          <button onClick={() => { logout(); router.push('/login'); }} style={{ fontSize:13, fontWeight:600, padding:'7px 14px', borderRadius:10, border:'1px solid #fecaca', color:'#dc2626', background:'#fff', cursor:'pointer', fontFamily:'inherit' }}>🚪 {d.logout}</button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'24px 16px', display:'flex', flexDirection:'column', gap:16 }}>

        {/* Banner */}
        {isNewUser && (
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, background:'#fefce8', border:'1px solid #fde68a', borderRadius:14, padding:'14px 18px' }}>
            <p style={{ fontWeight:600, color:'#92400e', fontSize:14 }}>⚠️ Complete your profile to get started</p>
            <Link href="/onboarding" style={{ background:'#f59e0b', color:'#fff', fontWeight:700, padding:'8px 18px', borderRadius:10, textDecoration:'none', fontSize:13, display:'inline-block' }}>Fill Profile →</Link>
          </div>
        )}

        {/* Welcome card */}
        <div style={{ ...card, display:'flex', flexWrap:'wrap', alignItems:'center', gap:20, background:'#fff' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#4ade80)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:900, flexShrink:0, boxShadow:'0 4px 16px rgba(22,163,74,0.3)' }}>
            {initials}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:20, fontWeight:900, color:'#14532d', marginBottom:4 }}>{d.welcome(displayName)}</h2>
            <p style={{ fontSize:13, color:'#4b7a5a', marginBottom:10 }}>{d.subtitle}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              <Badge>✓ {d.labels.verified}</Badge>
              {profile?.location && <Badge variant="muted">📍 {profile.location}</Badge>}
              {profile?.role && <Badge variant="outline">{profile.role === 'worker' ? '👷' : profile.role === 'employer' ? '🏢' : '🔄'} {profile.role}</Badge>}
            </div>
          </div>
          <div style={{ background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:12, padding:'12px 18px', textAlign:'center' }}>
            <span style={label}>{d.labels.member}</span>
            <span style={{ ...value, fontSize:13 }}>{user?.created ? new Date(user.created).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) : '—'}</span>
          </div>
        </div>

        {/* Info grid */}
        {profile && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
            {[
              {icon:'👤', lbl:d.labels.name,    val:profile.name || '—'},
              {icon:'📧', lbl:d.labels.email,   val:user?.email || '—'},
              {icon:'🎂', lbl:d.labels.dob,     val:profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'},
              {icon:'📱', lbl:d.labels.contact, val:profile.contact ? `+91 ${profile.contact}` : '—'},
              {icon:'📍', lbl:d.labels.location,val:profile.location || '—'},
              {icon:'🔑', lbl:'User ID',        val:user?.id || '—', mono:true},
            ].map(({ icon, lbl, val, mono }) => (
              <div key={lbl} style={card}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:18 }}>{icon}</span>
                  <span style={label}>{lbl}</span>
                </div>
                <p style={{ ...value, fontFamily: mono ? 'monospace' : 'inherit', fontSize: mono ? 11 : 14, wordBreak:'break-all' }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {profile?.skills && (
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><span style={{ fontSize:18 }}>💡</span><span style={label}>{d.labels.skills}</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {profile.skills.split(', ').filter(Boolean).map((s: string) => (
                <span key={s} style={{ background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:99, padding:'5px 14px', fontSize:13, fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {profile?.interests && (
          <div style={card}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}><span style={{ fontSize:18 }}>❤️</span><span style={label}>{d.labels.interests}</span></div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {profile.interests.split(', ').filter(Boolean).map((s: string) => (
                <span key={s} style={{ background:'#fefce8', border:'1px solid #fde68a', color:'#a16207', borderRadius:99, padding:'5px 14px', fontSize:13, fontWeight:600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Aadhaar */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:18 }}>🪪</span><span style={label}>{d.labels.aadhaar}</span></div>
            <Link href="/onboarding" style={{ fontSize:12, color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Edit →</Link>
          </div>
          {aadhaarUrl ? (
            <div>
              <img src={aadhaarUrl} alt="Aadhaar" style={{ maxWidth:280, borderRadius:10, border:'2px solid #d1fae5', display:'block', marginBottom:8 }} />
              <a href={aadhaarUrl} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'#16a34a', fontWeight:600 }}>🔍 {d.viewAadhaar}</a>
            </div>
          ) : (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <p style={{ fontSize:13, color:'#86b899' }}>{d.noAadhaar}</p>
              <Link href="/onboarding" style={{ fontSize:13, color:'#16a34a', fontWeight:600, textDecoration:'none' }}>Upload →</Link>
            </div>
          )}
        </div>

        {/* Applications */}
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}><span style={{ fontSize:18 }}>💼</span><h3 style={{ fontSize:15, fontWeight:700, color:'#14532d' }}>{d.myJobs}</h3></div>
          {appsLoading ? <p style={{ textAlign:'center', color:'#86b899', fontSize:13, padding:'20px 0' }}>Loading…</p>
          : apps.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 0' }}>
              <p style={{ fontSize:28, marginBottom:8 }}>📋</p>
              <p style={{ color:'#86b899', fontSize:14 }}>{d.noApps}</p>
              <Link href="/gigs" style={{ fontSize:13, color:'#16a34a', fontWeight:600, textDecoration:'none', display:'inline-block', marginTop:8 }}>Browse Jobs →</Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {apps.map((app: any) => (
                <div key={app.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f0fdf4', borderRadius:10, padding:'12px 14px' }}>
                  <div>
                    <p style={{ fontWeight:600, color:'#14532d', fontSize:14 }}>{app.expand?.job_id?.title || 'Job #'+app.job_id}</p>
                    <p style={{ fontSize:12, color:'#86b899', marginTop:2 }}>{app.expand?.job_id?.company || ''} · {new Date(app.created).toLocaleDateString('en-IN')}</p>
                  </div>
                  <Badge variant={app.status === 'accepted' ? 'solid' : app.status === 'rejected' ? 'urgent' : 'yellow'}>
                    {d.status[app.status as keyof typeof d.status] || app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, paddingBottom:16 }}>
          {[{href:'/gigs',icon:'💼',lbl:t.nav.gigs},{href:'/services',icon:'🛠️',lbl:t.nav.services},{href:'/workers',icon:'👷',lbl:t.nav.workers},{href:'/manpower',icon:'🏗️',lbl:t.nav.manpower}].map(l => (
            <Link key={l.href} href={l.href} style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:14, padding:'16px 12px', textAlign:'center', textDecoration:'none', display:'block', transition:'transform 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              <div style={{ fontSize:24, marginBottom:6 }}>{l.icon}</div>
              <p style={{ fontSize:12, fontWeight:600, color:'#15803d' }}>{l.lbl}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
