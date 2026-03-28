'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();
  const [open, setOpen] = useState(false);

  const name     = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2);

  const links = [
    { href:'/',          icon:'🏠', label:'Home' },
    { href:'/gigs',      icon:'💼', label:'Jobs' },
    { href:'/pick-drop', icon:'🛵', label:'Pick & Drop' },
    { href:'/dashboard', icon:'👤', label:'My Profile' },
  ];

  const active = (href:string) => pathname === href;

  return (
    <>
      <nav style={{ position:'sticky', top:0, zIndex:200, background:'#fff', borderBottom:'1px solid #e2e8f0', fontFamily:"'Outfit',sans-serif" }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:64 }}>

          {/* Brand */}
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, boxShadow:'0 2px 8px rgba(22,163,74,0.35)' }}>🍃</div>
            <div>
              <div style={{ fontWeight:900, color:'#0f172a', fontSize:18, lineHeight:1 }}>Urban<span style={{color:'#16a34a'}}>Serve</span></div>
              <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, letterSpacing:'0.05em' }}>FIND WORK · HIRE PEOPLE</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="desk-links" style={{ display:'none', alignItems:'center', gap:2 }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, fontSize:14, fontWeight:600, textDecoration:'none', transition:'all 0.15s',
                color: active(l.href) ? '#16a34a' : '#475569',
                background: active(l.href) ? '#f0fdf4' : 'transparent',
              }}>
                <span style={{ fontSize:16 }}>{l.icon}</span>{l.label}
                {active(l.href) && <div style={{ width:4, height:4, background:'#16a34a', borderRadius:'50%', marginLeft:2 }} />}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {user ? (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Link href="/gigs" style={{ background:'#16a34a', color:'#fff', fontWeight:700, padding:'8px 18px', borderRadius:10, textDecoration:'none', fontSize:13, display:'none' }} className="desk-links">
                  + Post Job
                </Link>
                <Link href="/dashboard" style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px 6px 6px', borderRadius:12, border:'1px solid #e2e8f0', textDecoration:'none', background:'#fff', transition:'border-color 0.15s' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:13, fontWeight:800 }}>{initials}</div>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }} className="desk-links">{name.split(' ')[0]}</span>
                </Link>
              </div>
            ) : (
              <div style={{ display:'flex', gap:8 }}>
                <Link href="/login" style={{ fontSize:14, fontWeight:700, padding:'9px 20px', borderRadius:10, background:'#16a34a', color:'#fff', textDecoration:'none', boxShadow:'0 2px 8px rgba(22,163,74,0.3)' }}>
                  Sign In
                </Link>
              </div>
            )}
            <button onClick={()=>setOpen(o=>!o)} className="mob-btn" style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:10, width:40, height:40, fontSize:18, color:'#475569', cursor:'pointer', display:'none', alignItems:'center', justifyContent:'center' }}>
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="slide-down" style={{ background:'#fff', borderTop:'1px solid #f1f5f9', padding:'12px 20px 20px' }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} onClick={()=>setOpen(false)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'13px 14px', borderRadius:12, fontSize:15, fontWeight:600, textDecoration:'none', marginBottom:4,
                color: active(l.href) ? '#16a34a' : '#334155',
                background: active(l.href) ? '#f0fdf4' : 'transparent',
              }}>
                <span style={{ fontSize:20 }}>{l.icon}</span>{l.label}
              </Link>
            ))}
            <div style={{ borderTop:'1px solid #f1f5f9', marginTop:12, paddingTop:12, display:'flex', gap:10 }}>
              {user ? (
                <>
                  <Link href="/gigs" onClick={()=>setOpen(false)} style={{ flex:1, textAlign:'center' as const, padding:'11px', background:'#16a34a', color:'#fff', borderRadius:12, fontWeight:700, textDecoration:'none', fontSize:14 }}>+ Post Job</Link>
                  <button onClick={()=>{logout();router.push('/');setOpen(false);}} style={{ flex:1, padding:'11px', border:'1px solid #fecaca', borderRadius:12, color:'#dc2626', background:'#fff', fontWeight:600, cursor:'pointer', fontFamily:'inherit', fontSize:14 }}>Logout</button>
                </>
              ) : (
                <Link href="/login" onClick={()=>setOpen(false)} style={{ flex:1, textAlign:'center' as const, padding:'12px', background:'#16a34a', color:'#fff', borderRadius:12, fontWeight:800, textDecoration:'none', fontSize:15 }}>Sign In →</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @media(min-width:900px){
          .desk-links{display:flex!important;}
          .mob-btn{display:none!important;}
        }
        @media(max-width:899px){
          .desk-links{display:none!important;}
          .mob-btn{display:flex!important;}
        }
      `}</style>
    </>
  );
}
