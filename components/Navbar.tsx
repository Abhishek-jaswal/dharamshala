'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

export function Navbar() {
  const { user, profile, logout } = useAuth();
  const { lang, toggle } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const name = profile?.name || user?.name || user?.email?.split('@')[0] || 'User';
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const links = [
    { href: '/',          icon: '🏠', label: lang === 'hi' ? 'होम'      : 'Home'      },
    { href: '/gigs',      icon: '💼', label: lang === 'hi' ? 'नौकरी'    : 'Jobs'      },
    { href: '/pick-drop', icon: '🛵', label: lang === 'hi' ? 'पिकअप'    : 'Pickup'    },
    { href: '/dashboard', icon: '👤', label: lang === 'hi' ? 'प्रोफाइल' : 'Profile'   },
  ];

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* Top Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        fontFamily: "'Outfit',sans-serif",
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto', padding: '0 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 54,
        }}>
          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34,
              background: 'linear-gradient(135deg,#16a34a,#22c55e)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, boxShadow: '0 2px 8px rgba(22,163,74,0.35)', flexShrink: 0,
            }}>🍃</div>
            <div>
              <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 16, lineHeight: 1 }}>
                Urban<span style={{ color: '#16a34a' }}>Serve</span>
              </div>
              <div className="nav-tagline">FIND WORK · HIRE PEOPLE</div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="desk-links" style={{ display: 'none', alignItems: 'center', gap: 2 }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s',
                color: active(l.href) ? '#16a34a' : '#475569',
                background: active(l.href) ? '#f0fdf4' : 'transparent',
              }}>
                <span style={{ fontSize: 16 }}>{l.icon}</span>{l.label}
                {active(l.href) && <div style={{ width: 4, height: 4, background: '#16a34a', borderRadius: '50%', marginLeft: 2 }} />}
              </Link>
            ))}
          </div>

          {/* Right: lang + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={toggle} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: lang === 'hi' ? '#fff7ed' : '#f0fdf4',
              border: `1.5px solid ${lang === 'hi' ? '#fed7aa' : '#d1fae5'}`,
              borderRadius: 8, padding: '5px 9px', cursor: 'pointer',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              color: lang === 'hi' ? '#c2410c' : '#15803d',
            }}>
              {lang === 'hi' ? '🇬🇧 EN' : '🇮🇳 हि'}
            </button>

            {user ? (
              <>
                <Link href="/gigs" className="desk-post-btn" style={{
                  background: '#16a34a', color: '#fff', fontWeight: 700,
                  padding: '7px 14px', borderRadius: 9, textDecoration: 'none', fontSize: 13,
                  display: 'none',
                }}>+ Post Job</Link>
                <Link href="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 8px 5px 5px', borderRadius: 10,
                  border: '1px solid #e2e8f0', textDecoration: 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>{initials}</div>
                  <span className="desk-name" style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'none' }}>
                    {name.split(' ')[0]}
                  </span>
                </Link>
                <button onClick={() => setOpen(o => !o)} className="mob-ham" style={{
                  background: 'none', border: '1px solid #e2e8f0', borderRadius: 8,
                  width: 34, height: 34, fontSize: 15, color: '#475569', cursor: 'pointer',
                  display: 'none', alignItems: 'center', justifyContent: 'center',
                }}>{open ? '✕' : '☰'}</button>
              </>
            ) : (
              <Link href="/login" style={{
                fontSize: 13, fontWeight: 700, padding: '7px 14px', borderRadius: 9,
                background: '#16a34a', color: '#fff', textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(22,163,74,0.3)',
              }}>Sign In</Link>
            )}
          </div>
        </div>

        {/* Mobile dropdown for logged-in user extra actions */}
        {open && (
          <div className="slide-down" style={{
            background: '#fff', borderTop: '1px solid #f1f5f9', padding: '10px 16px 14px',
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/gigs" onClick={() => setOpen(false)} style={{
                flex: 1, textAlign: 'center' as const, padding: '10px',
                background: '#16a34a', color: '#fff', borderRadius: 10,
                fontWeight: 700, textDecoration: 'none', fontSize: 14,
              }}>+ Post Job</Link>
              <button onClick={() => { logout(); router.push('/'); setOpen(false); }} style={{
                flex: 1, padding: '10px', border: '1px solid #fecaca', borderRadius: 10,
                color: '#dc2626', background: '#fff', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 14,
              }}>Logout</button>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mob-bottom-nav" aria-label="Main navigation">
        <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
          {links.map(l => {
            const isActive = active(l.href);
            return (
              <Link key={l.href} href={l.href} aria-label={l.label} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                textDecoration: 'none', position: 'relative',
                background: isActive ? '#f0fdf4' : '#fff',
                transition: 'background 0.15s',
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: 0, left: '18%', right: '18%',
                    height: 2, background: '#16a34a', borderRadius: '0 0 3px 3px',
                  }} />
                )}
                <span className="nav-icon">{l.icon}</span>
                <span className="nav-label" style={{
                  fontWeight: isActive ? 800 : 500,
                  color: isActive ? '#16a34a' : '#64748b',
                  fontFamily: "'Outfit',sans-serif",
                }}>{l.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        /* Tagline */
        .nav-tagline {
          font-size: 9px; color: #94a3b8; font-weight: 600; letter-spacing: 0.05em;
        }

        /* Desktop ≥900px */
        @media (min-width: 900px) {
          .desk-links    { display: flex !important; }
          .desk-post-btn { display: block !important; }
          .desk-name     { display: block !important; }
          .mob-ham       { display: none !important; }
          .mob-bottom-nav { display: none !important; }
        }

        /* Mobile <900px */
        @media (max-width: 899px) {
          .desk-links    { display: none !important; }
          .desk-post-btn { display: none !important; }
          .desk-name     { display: none !important; }
          .mob-ham       { display: flex !important; }
          .mob-bottom-nav {
            display: block !important;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            height: calc(54px + env(safe-area-inset-bottom, 0px));
            padding-bottom: env(safe-area-inset-bottom, 0px);
            background: #fff;
            border-top: 1.5px solid #e8edf2;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.07);
            z-index: 300;
            font-family: 'Outfit', sans-serif;
          }
        }

        /* Icon & label — default mobile sizes */
        .nav-icon  { font-size: 22px; line-height: 1.1; display: block; }
        .nav-label { font-size: 10px; display: block; letter-spacing: -0.01em; }

        /* Small phones 361px–480px */
        @media (max-width: 480px) and (min-width: 361px) {
          .nav-icon  { font-size: 20px; }
          .nav-label { font-size: 10px; }
        }

        /* Tiny phones ≤360px (Redmi, Galaxy A-series small) */
        @media (max-width: 360px) {
          .nav-icon  { font-size: 18px; }
          .nav-label { font-size: 9px; }
          .mob-bottom-nav {
            height: calc(50px + env(safe-area-inset-bottom, 0px)) !important;
          }
          .nav-tagline { display: none; }
        }

        /* Very tiny phones ≤320px */
        @media (max-width: 320px) {
          .nav-icon  { font-size: 16px; }
          .nav-label { font-size: 8px; }
        }
      `}</style>
    </>
  );
}
