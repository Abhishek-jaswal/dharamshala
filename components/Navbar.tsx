'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2);

  const links = [
    { href:'/',          label:'🏠 Home' },
    { href:'/gigs',      label:'💼 Jobs' },
    { href:'/dashboard', label:'👤 Profile' },
  ];

  return (
    <nav style={{ position:'sticky', top:0, zIndex:100, background:'#fff', borderBottom:'2px solid #e6f4ea', fontFamily:"'Outfit',sans-serif" }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 16px', display:'flex', alignItems:'center', justifyContent:'space-between', height:58 }}>

        {/* Brand */}
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🍃</div>
          <span style={{ fontWeight:900, color:'#14532d', fontSize:20 }}>Urban<span style={{ color:'#16a34a' }}>Serve</span></span>
        </Link>

        {/* Desktop links */}
        <div className="desk-nav" style={{ display:'none' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href}
              style={{ padding:'7px 14px', borderRadius:10, fontSize:14, fontWeight:600, color:'#14532d', background: pathname===l.href ? '#f0fdf4' : 'transparent', textDecoration:'none', border: pathname===l.href ? '1.5px solid #d1fae5' : '1.5px solid transparent' }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {user ? (
            <>
              <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:12, border:'1.5px solid #e6f4ea', textDecoration:'none', background:'#fff' }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:'#16a34a', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:700 }}>{initials}</div>
                <span style={{ fontSize:14, fontWeight:700, color:'#14532d' }} className="desk-nav">{displayName.split(' ')[0]}</span>
              </Link>
              <button onClick={() => { logout(); router.push('/'); }} className="desk-nav"
                style={{ fontSize:13, padding:'7px 14px', borderRadius:10, border:'1.5px solid #fecaca', color:'#dc2626', background:'#fff', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="desk-nav"
                style={{ fontSize:14, fontWeight:700, padding:'8px 18px', borderRadius:12, background:'#16a34a', color:'#fff', textDecoration:'none' }}>
                Login / Sign Up
              </Link>
            </>
          )}
          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="mob-btn"
            style={{ background:'none', border:'none', fontSize:24, color:'#14532d', cursor:'pointer', padding:4, display:'none' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background:'#fff', borderTop:'1.5px solid #e6f4ea', padding:'12px 16px 20px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ display:'block', padding:'12px 14px', borderRadius:12, fontSize:15, fontWeight:600, color:'#14532d', background: pathname===l.href ? '#f0fdf4' : 'transparent', textDecoration:'none', marginBottom:4 }}>
              {l.label}
            </Link>
          ))}
          <div style={{ borderTop:'1.5px solid #e6f4ea', marginTop:10, paddingTop:10, display:'flex', gap:10 }}>
            {user ? (
              <button onClick={() => { logout(); router.push('/'); setMenuOpen(false); }}
                style={{ flex:1, padding:'11px', border:'1.5px solid #fecaca', borderRadius:12, color:'#dc2626', background:'#fff', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>
                Logout
              </button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                style={{ flex:1, textAlign:'center', padding:'11px', background:'#16a34a', color:'#fff', borderRadius:12, fontWeight:800, textDecoration:'none', fontSize:14 }}>
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desk-nav { display: flex !important; gap: 4px; align-items: center; }
          .mob-btn  { display: none !important; }
        }
        @media (max-width: 767px) {
          .desk-nav { display: none !important; }
          .mob-btn  { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
