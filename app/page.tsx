'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CATEGORIES } from '@/lib/data';

const STATS = [
  { icon: '👷', val: '20+', label: 'Workers Available' },
  { icon: '💼', val: '2+', label: 'Jobs Posted' },
  { icon: '⭐', val: '4.8', label: 'Average Rating' },
  { icon: '🏙️', val: '1+', label: 'Cities Covered' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: '#f8fafc' }}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#0f4c25 0%,#16a34a 55%,#22c55e 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -120, left: -60, width: 300, height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '80px 24px 90px', position: 'relative' }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
              <span className="live-dot" style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>LIVE </span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
              Hire Workers.<br />Find Jobs.<br />
              <span style={{ color: '#4ade80' }}>Instantly.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 520 }}>
              Plumbers, Cleaners, Cooks, Drivers & more — verified workers, real jobs, direct contact. No middleman.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              <Link href={user ? '/gigs' : '/login'}
                style={{ background: '#fff', color: '#16a34a', fontWeight: 800, fontSize: 17, padding: '16px 36px', borderRadius: 14, textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Get Worker Now ⚡
              </Link>
              <Link href={user ? '/gigs' : '/login'}
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 700, fontSize: 17, padding: '16px 36px', borderRadius: 14, textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                Post Job in 30 Sec 🚀
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ padding: '18px 16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 900, color: '#fff', fontSize: 22 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ fontWeight: 700, color: '#16a34a', fontSize: 13, letterSpacing: '0.1em', marginBottom: 10 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 900, color: '#0f172a' }}>Simple as 1 · 2 · 3</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '📱', title: 'Sign In Free', desc: 'One click with Google or GitHub. Zero fees to join.', color: '#f0fdf4', accent: '#16a34a' },
              { step: '02', icon: '🔍', title: 'Browse or Post', desc: 'Find jobs near you or post your own job in 30 seconds.', color: '#eff6ff', accent: '#3b82f6' },
              { step: '03', icon: '📞', title: 'Connect & Work', desc: 'Call directly. No commission. No middleman. Simple.', color: '#fef9ee', accent: '#f59e0b' },
            ].map(s => (
              <div key={s.step} style={{ background: s.color, borderRadius: 20, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -10, right: -10, fontSize: 80, fontWeight: 900, color: s.accent, opacity: 0.07, lineHeight: 1 }}>{s.step}</div>
                <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>{s.icon}</div>
                <div style={{ fontWeight: 900, color: '#0f172a', fontSize: 18, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES GRID ────────────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#16a34a', fontSize: 13, letterSpacing: '0.1em', marginBottom: 8 }}>SERVICES</div>
              <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, color: '#0f172a' }}>What kind of work?</h2>
            </div>
            <Link href={user ? '/gigs' : '/login'} style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              See all jobs →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
            {CATEGORIES.slice(0, 8).map(cat => (
              <Link key={cat.id} href={user ? '/gigs' : '/login'}
                className="hover-lift"
                style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '24px 20px', textDecoration: 'none', display: 'block', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ width: 52, height: 52, background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 14 }}>{cat.icon}</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{cat.tagline}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{cat.count.toLocaleString()} workers</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PICK & DROP BANNER ───────────────────────────────── */}
      <section style={{ padding: '0 24px 72px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', borderRadius: 28, padding: '56px 48px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: 200, width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -80, right: -40, width: 300, height: 300, background: 'rgba(22,163,74,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ background: 'rgba(22,163,74,0.2)', color: '#4ade80', borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 14 }}>🛵 NEW</div>
              <h3 style={{ fontSize: 30, fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.2 }}>Pick & Drop Runner</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, maxWidth: 480, lineHeight: 1.7 }}>
                Need groceries, medicine, or a parcel delivered? Send a verified runner. Track them live on map. Starting ₹39.
              </p>
            </div>
            <Link href={user ? '/pick-drop' : '/login'}
              style={{ background: '#16a34a', color: '#fff', fontWeight: 800, padding: '16px 36px', borderRadius: 16, textDecoration: 'none', fontSize: 16, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(22,163,74,0.4)', position: 'relative', flexShrink: 0 }}>
              Book a Runner →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Why UrbanServe?</h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Built for India's workers and employers</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {[
              { icon: '🔒', title: 'Verified Workers', desc: 'Every worker is ID-verified with Aadhaar and skill-tested.', color: '#f0fdf4' },
              { icon: '📞', title: 'Direct Contact', desc: 'Call or message directly. Zero commission on connections.', color: '#eff6ff' },
              { icon: '⚡', title: 'Instant Booking', desc: 'Post a job or apply in under 60 seconds. Always.', color: '#fef9ee' },
              { icon: '🌍', title: '+1 Cities', desc: 'Available across major cities and towns in India.', color: '#fdf4ff' },
            ].map(f => (
              <div key={f.title} style={{ background: f.color, borderRadius: 20, padding: '28px 24px' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                <div style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg,#16a34a,#14532d)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.2 }}>
            Start Today. It's Free.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 17, marginBottom: 36 }}>
            Join 12,000+ workers and employers already using UrbanServe.
          </p>
          <Link href={user ? '/gigs' : '/login'}
            style={{ background: '#fff', color: '#16a34a', fontWeight: 900, fontSize: 18, padding: '18px 48px', borderRadius: 16, textDecoration: 'none', display: 'inline-block', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            Get Started Free →
          </Link>
        </div>
      </section>
    </div>
  );
}









