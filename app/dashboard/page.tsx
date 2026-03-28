'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';

export default function DashboardPage() {
  const { user, profile, loading, profileLoading, logout } = useAuth();
  const router = useRouter();
  const [apps,       setApps]       = useState<any[]>([]);
  const [appsLoad,   setAppsLoad]   = useState(false);
  const [available,  setAvailable]  = useState(true);
  const [toggling,   setToggling]   = useState(false);
  const [aadhaarUrl, setAadhaarUrl] = useState('');

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  useEffect(() => {
    if (profile) {
      setAvailable(profile.available ?? true);
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
      filter: `applicant_id="${user.id}"`, expand:'job_id', sort:'-created',
    }).then(r => setApps(r.items)).catch(()=>setApps([])).finally(()=>setAppsLoad(false));
  }, [user]);

  const toggleAvailability = async () => {
    if (!profile?.id) return;
    setToggling(true);
    const next = !available;
    setAvailable(next);
    try { await getPb().collection('profiles').update(profile.id, { available:next }); }
    catch { setAvailable(!next); }
    finally { setToggling(false); }
  };

  if (loading || profileLoading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return null;

  const name     = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2);
  const statusMap: Record<string,{label:string;bg:string;color:string}> = {
    pending:   { label:'⏳ Pending',    bg:'#fefce8', color:'#d97706' },
    accepted:  { label:'✅ Accepted',   bg:'#f0fdf4', color:'#16a34a' },
    rejected:  { label:'❌ Rejected',   bg:'#fef2f2', color:'#dc2626' },
  };

  const card: React.CSSProperties = { background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:'#f8fafc', minHeight:'100vh' }}>

      {/* Hero strip */}
      <div style={{ background:'linear-gradient(135deg,#0f4c25,#16a34a)', padding:'40px 24px 80px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:900, border:'3px solid rgba(255,255,255,0.4)' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>Hello, {name.split(' ')[0]}! 👋</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:14, marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <Link href="/onboarding" style={{ fontSize:13, fontWeight:700, padding:'9px 18px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.4)', color:'#fff', textDecoration:'none', backdropFilter:'blur(4px)' }}>
              ✏️ Edit Profile
            </Link>
            <button onClick={()=>{logout();router.push('/');}} style={{ fontSize:13, fontWeight:700, padding:'9px 18px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.8)', background:'transparent', cursor:'pointer', fontFamily:'inherit' }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'-40px auto 0', padding:'0 24px 60px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20, alignItems:'start' }}>

          {/* ── Availability toggle ── */}
          <div style={{ ...card, textAlign:'center' as const, padding:'36px 28px', gridColumn:'span 1' }}>
            <div style={{ fontWeight:900, color:'#0f172a', fontSize:18, marginBottom:6 }}>My Availability</div>
            <p style={{ color:'#64748b', fontSize:14, marginBottom:28, lineHeight:1.6 }}>
              {available ? '✅ Visible — employers can contact you' : '❌ Hidden — nobody can see you'}
            </p>
            <button onClick={toggleAvailability} disabled={toggling}
              style={{ width:'100%', padding:'22px 24px', borderRadius:18, border:'none', cursor:toggling?'not-allowed':'pointer', fontFamily:'inherit', fontSize:18, fontWeight:900, transition:'all 0.3s',
                background: available ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f1f5f9',
                color: available ? '#fff' : '#94a3b8',
                boxShadow: available ? '0 8px 32px rgba(22,163,74,0.3)' : 'none',
              }}>
              {toggling ? '...' : available ? '🟢  AVAILABLE' : '🔴  NOT AVAILABLE'}
            </button>
            <p style={{ marginTop:12, fontSize:12, color:'#94a3b8' }}>Tap to toggle your status</p>
          </div>

          {/* ── Profile info ── */}
          <div style={card}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:16, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>📋 My Info</span>
              {!profile && <Link href="/onboarding" style={{ fontSize:13, color:'#16a34a', fontWeight:700, textDecoration:'none' }}>Complete →</Link>}
            </div>
            {profile ? (
              <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
                {[['👤','Name', profile.name],['📱','Phone',profile.contact?`+91 ${profile.contact}`:null],['📍','Location',profile.location],['🎂','DOB',profile.dob?new Date(profile.dob).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):null]].filter(([,,v])=>v).map(([icon,label,val])=>(
                  <div key={label as string} style={{ display:'flex', gap:12, padding:'11px 0', borderBottom:'1px solid #f8fafc' }}>
                    <span style={{ fontSize:16 }}>{icon}</span>
                    <span style={{ color:'#94a3b8', fontSize:13, minWidth:72 }}>{label}</span>
                    <span style={{ fontWeight:700, color:'#0f172a', fontSize:13 }}>{val}</span>
                  </div>
                ))}
                {profile.skills && (
                  <div style={{ marginTop:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#94a3b8', marginBottom:8, letterSpacing:'0.05em' }}>SKILLS</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {profile.skills.split(', ').filter(Boolean).map((s:string)=>(
                        <span key={s} style={{ background:'#f0fdf4', border:'1px solid #d1fae5', color:'#16a34a', borderRadius:99, padding:'4px 12px', fontSize:12, fontWeight:600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign:'center' as const, padding:'20px 0' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>⚠️</div>
                <p style={{ color:'#64748b', fontSize:14 }}>Profile not complete yet.</p>
                <Link href="/onboarding" style={{ display:'inline-block', marginTop:12, background:'#16a34a', color:'#fff', fontWeight:700, padding:'10px 20px', borderRadius:10, textDecoration:'none', fontSize:13 }}>Complete Profile</Link>
              </div>
            )}
          </div>

          {/* ── My applied jobs ── */}
          <div style={card}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:16, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span>💼 My Applications</span>
              <Link href="/gigs" style={{ fontSize:13, color:'#16a34a', fontWeight:700, textDecoration:'none' }}>Browse →</Link>
            </div>
            {appsLoad ? <p style={{ color:'#94a3b8', fontSize:14, textAlign:'center' as const, padding:20 }}>Loading…</p>
            : apps.length===0 ? (
              <div style={{ textAlign:'center' as const, padding:'24px 0' }}>
                <div style={{ fontSize:40, marginBottom:10 }}>📋</div>
                <p style={{ color:'#64748b', fontSize:14 }}>You haven't applied to any jobs yet.</p>
                <Link href="/gigs" style={{ display:'inline-block', marginTop:12, color:'#16a34a', fontWeight:700, fontSize:14, textDecoration:'none' }}>Find Jobs →</Link>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {apps.map((app:any) => {
                  const s = statusMap[app.status] || statusMap.pending;
                  return (
                    <div key={app.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#f8fafc', borderRadius:12, padding:'13px 14px', gap:12 }}>
                      <div>
                        <div style={{ fontWeight:700, color:'#0f172a', fontSize:14 }}>{app.expand?.job_id?.title || 'Job'}</div>
                        <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{new Date(app.created).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      </div>
                      <span style={{ fontWeight:700, fontSize:12, padding:'5px 12px', borderRadius:99, background:s.bg, color:s.color, whiteSpace:'nowrap' as const }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Quick links ── */}
          <div style={card}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:16, marginBottom:16 }}>🚀 Quick Actions</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { href:'/gigs',      icon:'💼', label:'Find Jobs',    color:'#f0fdf4', border:'#d1fae5', tc:'#16a34a' },
                { href:'/gigs',      icon:'📋', label:'Post a Job',   color:'#eff6ff', border:'#bfdbfe', tc:'#3b82f6' },
                { href:'/pick-drop', icon:'🛵', label:'Pick & Drop',  color:'#fef9ee', border:'#fde68a', tc:'#d97706' },
                { href:'/onboarding',icon:'✏️', label:'Edit Profile', color:'#fdf4ff', border:'#e9d5ff', tc:'#9333ea' },
              ].map(l => (
                <Link key={l.href+l.label} href={l.href}
                  style={{ background:l.color, border:`1px solid ${l.border}`, borderRadius:14, padding:'16px', textAlign:'center' as const, textDecoration:'none', display:'block', transition:'transform 0.15s' }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{l.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:l.tc }}>{l.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
