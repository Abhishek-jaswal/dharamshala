'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const { t, toggle } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const links = [
    { href: '/',          label: t.nav.home },
    { href: '/services',  label: t.nav.services },
    { href: '/pick-drop', label: t.nav.pickDrop },
    { href: '/manpower',  label: t.nav.manpower },
    { href: '/gigs',      label: t.nav.gigs },
    { href: '/workers',   label: t.nav.workers },
  ];

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const s = {
    nav: { position:'sticky' as const, top:0, zIndex:100, background:'#fff', borderBottom:'1px solid #d1fae5', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' },
    inner: { maxWidth:1200, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:56 },
    brand: { display:'flex', alignItems:'center', gap:8, textDecoration:'none' },
    brandIcon: { width:32, height:32, background:'#16a34a', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:14 },
    brandText: { fontWeight:900, color:'#14532d', fontSize:18, letterSpacing:'-0.02em' },
    desktopLinks: { display:'flex', alignItems:'center', gap:2 },
    link: (active: boolean): React.CSSProperties => ({ padding:'6px 12px', borderRadius:8, fontSize:14, fontWeight:500, color:'#15803d', background: active ? '#f0fdf4' : 'transparent', textDecoration:'none', transition:'background 0.15s' }),
    right: { display:'flex', alignItems:'center', gap:8 },
    langBtn: { fontSize:12, fontWeight:700, padding:'6px 12px', borderRadius:20, border:'1px solid #d1fae5', color:'#16a34a', background:'#fff', cursor:'pointer' },
    loginBtn: { fontSize:13, fontWeight:700, padding:'7px 16px', borderRadius:10, background:'#16a34a', color:'#fff', border:'none', cursor:'pointer' },
    joinBtn: { fontSize:13, fontWeight:600, padding:'7px 16px', borderRadius:10, background:'#fff', color:'#16a34a', border:'1px solid #d1fae5', cursor:'pointer', textDecoration:'none', display:'inline-block' },
    avatarBtn: { display:'flex', alignItems:'center', gap:8, padding:'5px 10px', borderRadius:10, border:'1px solid #d1fae5', background:'#fff', cursor:'pointer' },
    avatar: { width:28, height:28, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:12, fontWeight:700 },
    dropdown: { position:'absolute' as const, right:0, top:'calc(100% + 8px)', width:220, background:'#fff', border:'1px solid #d1fae5', borderRadius:16, boxShadow:'0 8px 24px rgba(0,0,0,0.10)', overflow:'hidden', zIndex:200 },
    dropHeader: { padding:'12px 16px', background:'#f0fdf4', borderBottom:'1px solid #d1fae5' },
    dropLink: { display:'flex', alignItems:'center', gap:8, padding:'10px 16px', fontSize:14, color:'#15803d', textDecoration:'none', background:'transparent', border:'none', width:'100%', cursor:'pointer', textAlign:'left' as const },
    hamburger: { background:'none', border:'none', fontSize:22, color:'#15803d', cursor:'pointer', padding:4 },
    mobileMenu: { background:'#fff', borderTop:'1px solid #f0fdf4', padding:'8px 16px 16px' },
    mobileLink: (active: boolean): React.CSSProperties => ({ display:'block', padding:'10px 12px', borderRadius:10, fontSize:14, fontWeight:500, color:'#15803d', background: active ? '#f0fdf4' : 'transparent', textDecoration:'none', marginBottom:2 }),
  };

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Brand */}
        <Link href="/" style={s.brand}>
          <div style={s.brandIcon}>U</div>
          <span style={s.brandText}>Urban<span style={{color:'#16a34a'}}>Serve</span></span>
        </Link>

        {/* Desktop links */}
        <div style={{ ...s.desktopLinks, display: 'none' }} className="desktop-nav">
          {links.map(l => (
            <Link key={l.href} href={l.href} style={s.link(pathname === l.href)}>{l.label}</Link>
          ))}
        </div>

        {/* Right */}
        <div style={s.right}>
          <button onClick={toggle} style={s.langBtn}>🌐 {t.toggle}</button>

          {user ? (
            <div style={{ position:'relative' }}>
              <button style={s.avatarBtn} onClick={() => setProfileOpen(o => !o)}>
                <div style={s.avatar}>{initials}</div>
                <span style={{ fontSize:13, fontWeight:600, color:'#15803d', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {displayName.split(' ')[0]}
                </span>
                <span style={{ fontSize:10, color:'#86efac' }}>▼</span>
              </button>
              {profileOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropHeader}>
                    <div style={{ fontWeight:700, color:'#14532d', fontSize:14 }}>{displayName}</div>
                    <div style={{ fontSize:12, color:'#6b9a7a', marginTop:2 }}>{user.email}</div>
                  </div>
                  <Link href="/dashboard" style={s.dropLink} onClick={() => setProfileOpen(false)}>📊 {t.nav.dashboard}</Link>
                  <Link href="/onboarding" style={s.dropLink} onClick={() => setProfileOpen(false)}>✏️ {t.nav.profile}</Link>
                  <Link href="/gigs" style={s.dropLink} onClick={() => setProfileOpen(false)}>💼 {t.nav.gigs}</Link>
                  <div style={{ borderTop:'1px solid #f0fdf4' }}>
                    <button style={{ ...s.dropLink, color:'#dc2626' }} onClick={() => { logout(); setProfileOpen(false); router.push('/login'); }}>
                      🚪 {t.nav.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/onboarding" style={s.joinBtn}>{t.nav.joinWorker}</Link>
              <Link href="/login" style={{ ...s.joinBtn, background:'#16a34a', color:'#fff', border:'none' }}>{t.nav.login}</Link>
            </>
          )}

          <button style={s.hamburger} onClick={() => setMenuOpen(o => !o)} className="hamburger-btn">
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={s.mobileLink(pathname === l.href)} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div style={{ display:'flex', gap:8, marginTop:10, paddingTop:10, borderTop:'1px solid #f0fdf4' }}>
            {user
              ? <Link href="/dashboard" style={{ flex:1, textAlign:'center', padding:'9px', background:'#16a34a', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }} onClick={() => setMenuOpen(false)}>{t.nav.dashboard}</Link>
              : <Link href="/login" style={{ flex:1, textAlign:'center', padding:'9px', background:'#16a34a', color:'#fff', borderRadius:10, fontSize:13, fontWeight:700, textDecoration:'none' }} onClick={() => setMenuOpen(false)}>{t.nav.login}</Link>
            }
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .hamburger-btn { display: none !important; }
        }
        @media (max-width: 899px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
