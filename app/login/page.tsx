'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)', fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: 28, padding: '48px 44px', width: '100%', maxWidth: 420, margin: 20, textAlign: 'center', boxShadow: '0 20px 60px rgba(22,163,74,0.12)' }}>
        <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#16a34a,#22c55e)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(22,163,74,0.35)' }}>
          <span style={{ color: 'white', fontWeight: 900, fontSize: '1.5rem' }}>U</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#14532d', marginBottom: 8 }}>UrbanServe</h1>
        <p style={{ color: '#4b7a5a', fontSize: '0.95rem', marginBottom: 32 }}>India's #1 Multi-Service Platform</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button onClick={loginWithGoogle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 20px', background: 'white', border: '1.5px solid #d1fae5', borderRadius: 14, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', color: '#1a1a1a', fontFamily: 'inherit' }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

        </div>
        <p style={{ color: '#86b899', fontSize: '0.78rem' }}>Secure OAuth · Powered by PocketBase</p>
      </div>
    </div>
  );
}
