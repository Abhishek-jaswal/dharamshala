'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const T = {
  en: {
    toggle: 'हिंदी में बदलें',
    title: 'Dashboard',
    welcome: (name:string) => `Welcome, ${name} 👋`,
    subtitle: 'Your profile is all set.',
    logout: 'Logout',
    labels: {
      name:'Full Name', email:'Email', dob:'Date of Birth',
      contact:'Contact', skills:'Skills', interests:'Interests',
      location:'Location', aadhaar:'Aadhaar Card', verified:'Verified',
      member:'Member Since',
    },
    noAadhaar: 'Not uploaded',
    viewAadhaar: 'View Aadhaar',
    loading: 'Loading…',
    incomplete: 'Complete your profile',
    goOnboard: 'Fill profile →',
  },
  hi: {
    toggle: 'Switch to English',
    title: 'डैशबोर्ड',
    welcome: (name:string) => `नमस्ते, ${name} 👋`,
    subtitle: 'आपकी प्रोफ़ाइल तैयार है।',
    logout: 'लॉग आउट',
    labels: {
      name:'पूरा नाम', email:'ईमेल', dob:'जन्म तिथि',
      contact:'संपर्क', skills:'कौशल', interests:'रुचियाँ',
      location:'स्थान', aadhaar:'आधार कार्ड', verified:'सत्यापित',
      member:'सदस्य बने',
    },
    noAadhaar: 'अपलोड नहीं हुआ',
    viewAadhaar: 'आधार देखें',
    loading: 'लोड हो रहा है…',
    incomplete: 'प्रोफ़ाइल पूरी करें',
    goOnboard: 'प्रोफ़ाइल भरें →',
  },
};

export default function DashboardPage() {
  const { user, profile, loading, profileLoading, logout, isNewUser } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<'en'|'hi'>('en');
  const [aadhaarUrl, setAadhaarUrl] = useState('');
  const t = T[lang];

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading]);

  useEffect(() => {
    if (profile?.aadhaar) {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      setAadhaarUrl(`${pbUrl}/api/files/profiles/${profile.id}/${profile.aadhaar}`);
    }
  }, [profile]);

  const handleLogout = () => { logout(); router.push('/login'); };

  if (loading || profileLoading) {
    return (
      <div style={s.loadRoot}>
        <div style={s.spinner}/>
        <p style={{color:'#16a34a',fontWeight:600,marginTop:12}}>{t.loading}</p>
      </div>
    );
  }

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2);
  const avatarUrl = user?.avatar
    ? `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
    : null;

  return (
    <div style={s.root}>
      {/* ── header ── */}
      <header style={s.header}>
        <div style={s.logo}><span>🏠</span><span style={s.logoText}>Dharamshala</span></div>
        <div style={s.headerRight}>
          <button style={s.langBtn} onClick={()=>setLang(l=>l==='en'?'hi':'en')}>
            🌐 {t.toggle}
          </button>
          <button style={s.logoutBtn} onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t.logout}
          </button>
        </div>
      </header>

      <main style={s.main}>

        {/* ── no profile banner ── */}
        {isNewUser && (
          <div style={s.banner}>
            <span>⚠️ {t.incomplete}</span>
            <button style={s.bannerBtn} onClick={()=>router.push('/onboarding')}>
              {t.goOnboard}
            </button>
          </div>
        )}

        {/* ── welcome card ── */}
        <div style={s.welcomeCard}>
          <div style={s.avatar}>
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <span style={s.initials}>{initials}</span>
            }
          </div>
          <div>
            <h1 style={s.welcomeName}>{t.welcome(displayName)}</h1>
            <p style={s.welcomeSub}>{t.subtitle}</p>
            <span style={s.badge}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {t.labels.verified}
            </span>
          </div>
        </div>

        {/* ── info grid ── */}
        {profile && (
          <div style={s.grid}>
            <InfoCard icon="👤" label={t.labels.name}     value={profile.name || '—'} />
            <InfoCard icon="📧" label={t.labels.email}    value={user?.email || '—'} />
            <InfoCard icon="🎂" label={t.labels.dob}      value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'} />
            <InfoCard icon="📱" label={t.labels.contact}  value={profile.contact ? `+91 ${profile.contact}` : '—'} />
            <InfoCard icon="📍" label={t.labels.location} value={profile.location || '—'} />
            <InfoCard icon="🗓️" label={t.labels.member}  value={user?.created ? new Date(user.created).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—'} />

            {/* skills */}
            {profile.skills && (
              <div style={{...s.card, gridColumn:'1 / -1'}}>
                <div style={s.cardHeader}>
                  <span style={s.cardIcon}>💡</span>
                  <span style={s.cardLabel}>{t.labels.skills}</span>
                </div>
                <div style={s.tagRow}>
                  {profile.skills.split(', ').filter(Boolean).map((sk:string,i:number)=>(
                    <span key={i} style={s.tagChip}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* interests */}
            {profile.interests && (
              <div style={{...s.card, gridColumn:'1 / -1'}}>
                <div style={s.cardHeader}>
                  <span style={s.cardIcon}>❤️</span>
                  <span style={s.cardLabel}>{t.labels.interests}</span>
                </div>
                <div style={s.tagRow}>
                  {profile.interests.split(', ').filter(Boolean).map((it:string,i:number)=>(
                    <span key={i} style={{...s.tagChip, background:'#fef9c3', color:'#a16207'}}>{it}</span>
                  ))}
                </div>
              </div>
            )}

            {/* aadhaar */}
            <div style={{...s.card, gridColumn:'1 / -1'}}>
              <div style={s.cardHeader}>
                <span style={s.cardIcon}>🪪</span>
                <span style={s.cardLabel}>{t.labels.aadhaar}</span>
              </div>
              {aadhaarUrl ? (
                <div style={s.aadhaarWrap}>
                  <img src={aadhaarUrl} alt="Aadhaar" style={s.aadhaarImg}/>
                  <a href={aadhaarUrl} target="_blank" rel="noreferrer" style={s.aadhaarLink}>
                    🔍 {t.viewAadhaar}
                  </a>
                </div>
              ) : (
                <p style={{color:'#86b899',fontSize:'0.9rem'}}>{t.noAadhaar}</p>
              )}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon:string; label:string; value:string }) {
  return (
    <div style={s.card}>
      <div style={s.cardHeader}>
        <span style={s.cardIcon}>{icon}</span>
        <span style={s.cardLabel}>{label}</span>
      </div>
      <p style={s.cardValue}>{value}</p>
    </div>
  );
}

const s:Record<string,React.CSSProperties> = {
  root:{minHeight:'100vh',background:'linear-gradient(160deg,#f0fdf4 0%,#dcfce7 60%,#bbf7d0 100%)',
    fontFamily:"'Plus Jakarta Sans',sans-serif"},
  loadRoot:{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',
    justifyContent:'center',background:'#f0fdf4',fontFamily:"'Plus Jakarta Sans',sans-serif"},
  spinner:{width:36,height:36,border:'3px solid #bbf7d0',borderTopColor:'#16a34a',
    borderRadius:'50%',animation:'spin 0.7s linear infinite'},
  header:{display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'14px 32px',background:'rgba(255,255,255,0.78)',backdropFilter:'blur(14px)',
    borderBottom:'1px solid #d1fae5',position:'sticky',top:0,zIndex:10},
  logo:{display:'flex',alignItems:'center',gap:8,fontSize:'1.1rem'},
  logoText:{fontWeight:800,color:'#14532d'},
  headerRight:{display:'flex',alignItems:'center',gap:10},
  langBtn:{padding:'7px 14px',background:'white',color:'#16a34a',
    border:'1.5px solid #d1fae5',borderRadius:20,cursor:'pointer',
    fontFamily:'inherit',fontSize:'0.82rem',fontWeight:600},
  logoutBtn:{display:'flex',alignItems:'center',gap:7,padding:'9px 18px',
    background:'white',color:'#16a34a',border:'1.5px solid #d1fae5',
    borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontSize:'0.88rem',fontWeight:600},
  main:{maxWidth:860,margin:'36px auto',padding:'0 24px'},
  banner:{display:'flex',alignItems:'center',justifyContent:'space-between',
    background:'#fef9c3',border:'1.5px solid #fde68a',borderRadius:14,
    padding:'14px 20px',marginBottom:20,color:'#92400e',fontWeight:600,fontSize:'0.9rem'},
  bannerBtn:{padding:'8px 18px',background:'#f59e0b',color:'white',border:'none',
    borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontWeight:700,fontSize:'0.88rem'},
  welcomeCard:{display:'flex',alignItems:'center',gap:24,
    background:'rgba(255,255,255,0.92)',border:'1px solid rgba(255,255,255,0.95)',
    borderRadius:24,padding:'28px 32px',marginBottom:24,
    boxShadow:'0 8px 32px rgba(22,163,74,0.10)'},
  avatar:{width:80,height:80,flexShrink:0,borderRadius:'50%',
    background:'linear-gradient(135deg,#16a34a,#4ade80)',
    display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',
    boxShadow:'0 4px 16px rgba(22,163,74,0.3)'},
  initials:{fontSize:'1.5rem',fontWeight:800,color:'white'},
  welcomeName:{fontSize:'1.4rem',fontWeight:800,color:'#14532d',marginBottom:4},
  welcomeSub:{fontSize:'0.9rem',color:'#4b7a5a',marginBottom:10},
  badge:{display:'inline-flex',alignItems:'center',gap:5,background:'#dcfce7',
    color:'#16a34a',fontSize:'0.75rem',fontWeight:700,padding:'4px 12px',
    borderRadius:20,border:'1px solid #bbf7d0'},
  grid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16},
  card:{background:'rgba(255,255,255,0.9)',border:'1px solid rgba(255,255,255,0.95)',
    borderRadius:18,padding:'20px 22px',boxShadow:'0 4px 16px rgba(22,163,74,0.06)'},
  cardHeader:{display:'flex',alignItems:'center',gap:10,marginBottom:10},
  cardIcon:{fontSize:'1.2rem'},
  cardLabel:{fontSize:'0.75rem',fontWeight:700,color:'#86b899',
    textTransform:'uppercase',letterSpacing:'0.06em'},
  cardValue:{fontSize:'0.97rem',fontWeight:600,color:'#14532d'},
  tagRow:{display:'flex',flexWrap:'wrap',gap:8,marginTop:4},
  tagChip:{padding:'6px 14px',background:'#dcfce7',color:'#15803d',
    borderRadius:99,fontSize:'0.83rem',fontWeight:600,border:'1px solid #bbf7d0'},
  aadhaarWrap:{display:'flex',flexDirection:'column',gap:12,alignItems:'flex-start'},
  aadhaarImg:{maxWidth:320,borderRadius:12,border:'2px solid #d1fae5',boxShadow:'0 4px 16px rgba(0,0,0,0.08)'},
  aadhaarLink:{color:'#16a34a',fontSize:'0.88rem',fontWeight:600,textDecoration:'none'},
};
