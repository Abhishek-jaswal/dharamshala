'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer style={{ background: '#0f172a', fontFamily: "'Outfit',sans-serif", marginTop: 'auto' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '52px 24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍃</div>
              <span style={{ fontWeight: 900, color: '#fff', fontSize: 20 }}>Urban<span style={{ color: '#22c55e' }}>Serve</span></span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>India's simplest platform to find work and hire verified workers.</p>
          </div>
          {/* Links */}
          <div>
            <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, letterSpacing: '0.08em', marginBottom: 16 }}>FOR WORKERS</div>
            {[['Find Jobs', '/gigs'], ['Register as Worker', '/onboarding'], ['Pick & Drop', '/pick-drop'], ['My Dashboard', '/dashboard']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#64748b', fontSize: 14, textDecoration: 'none', marginBottom: 10, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')} onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, letterSpacing: '0.08em', marginBottom: 16 }}>FOR EMPLOYERS</div>
            {[['Post a Job', '/gigs'], ['Browse Workers', '/workers'], ['Pick & Drop', '/pick-drop'], ['My Dashboard', '/dashboard']].map(([l, h]) => (
              <Link key={h} href={h} style={{ display: 'block', color: '#64748b', fontSize: 14, textDecoration: 'none', marginBottom: 10 }}>{l}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 12, letterSpacing: '0.08em', marginBottom: 16 }}>CONTACT</div>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>📧 support@urbanserve.in<br />📞 +91 8894727339<br />🕐 Mon–Sat, 9am–6pm</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <p style={{ color: '#475569', fontSize: 13 }}>© 2026 UrbanServe. Made in India 🇮🇳</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {['Privacy', 'Terms', 'Support'].map(l => (
              <span key={l} style={{ color: '#475569', fontSize: 13, cursor: 'pointer' }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
