'use client';

export default function PickDropPage() {
  return (
    <div style={{
      fontFamily: "'Outfit', sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f4c25 0%, #16a34a 50%, #22c55e 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🛵</div>
      <div style={{ background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 99, padding: '6px 18px', fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.1em', marginBottom: 20 }}>
        ⚡ COMING SOON
      </div>
      <h1 style={{ fontSize: 'clamp(28px, 7vw, 48px)', fontWeight: 900, color: '#fff', marginBottom: 14, lineHeight: 1.15 }}>
        Pick &amp; Drop<br />is on the way!
      </h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(14px, 3vw, 17px)', maxWidth: 380, lineHeight: 1.65, marginBottom: 36 }}>
        We&apos;re building a fast, reliable pick &amp; drop service for your everyday errands — groceries, parcels, medicines &amp; more.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40, maxWidth: 400 }}>
        {['🛒 Grocery Run', '💊 Medicine Pickup', '📦 Parcel Delivery', '🍱 Food Pickup', '📄 Document Courier', '🏪 Shop Errand'].map(item => (
          <span key={item} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#fff' }}>{item}</span>
        ))}
      </div>
      <a href="/" style={{ textDecoration: 'none' }}>
        <button style={{ background: '#fff', color: '#16a34a', border: 'none', borderRadius: 14, padding: '14px 32px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(0,0,0,0.2)' }}>
          ← Back to Home
        </button>
      </a>
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }`}</style>
    </div>
  );
}
