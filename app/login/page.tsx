'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="auth-root">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="auth-root">
      {/* Background */}
      <div className="auth-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="leaf-pattern" />
      </div>

      {/* Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>

        <h1 className="auth-title">Dharamshala</h1>
        <p className="auth-sub">Welcome back — sign in to continue</p>

        <div className="auth-divider">
          <span>choose a method</span>
        </div>

        <div className="auth-buttons">
          <button className="auth-btn google-btn" onClick={loginWithGoogle}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>


        </div>

        <p className="auth-footer">Secure OAuth · Powered by PocketBase</p>
      </div>

      <style>{`
        .auth-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
          position: relative;
          overflow: hidden;
        }

        .auth-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.45;
          animation: floatBlob 10s ease-in-out infinite;
        }
        .blob-1 {
          width: 420px; height: 420px;
          background: #22c55e;
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .blob-2 {
          width: 320px; height: 320px;
          background: #4ade80;
          bottom: -100px; right: -80px;
          animation-delay: 4s;
        }
        .blob-3 {
          width: 200px; height: 200px;
          background: #86efac;
          top: 55%; left: 55%;
          animation-delay: 8s;
        }

        @keyframes floatBlob {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-24px) scale(1.06); }
        }

        .leaf-pattern {
          position: absolute; inset: 0;
          background-image:
            radial-gradient(circle, rgba(22,163,74,0.06) 1px, transparent 1px);
          background-size: 32px 32px;
        }

        .auth-card {
          position: relative;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 28px;
          padding: 48px 44px;
          width: 100%;
          max-width: 420px;
          margin: 20px;
          text-align: center;
          box-shadow:
            0 20px 60px rgba(22, 163, 74, 0.12),
            0 4px 16px rgba(0,0,0,0.06);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-logo {
          width: 68px; height: 68px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 32px rgba(22,163,74,0.35);
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 800;
          color: #14532d;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }

        .auth-sub {
          color: #4b7a5a;
          font-size: 0.95rem;
          font-weight: 400;
          margin-bottom: 32px;
        }

        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }
        .auth-divider::before,
        .auth-divider::after {
          content: ''; flex: 1; height: 1px;
          background: #bbf7d0;
        }
        .auth-divider span {
          color: #86b899;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .auth-btn {
          display: flex; align-items: center; justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 14px;
          border: none;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .google-btn {
          background: white;
          color: #1a1a1a;
          border: 1.5px solid #d1fae5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .google-btn:hover {
          border-color: #4ade80;
          box-shadow: 0 4px 16px rgba(22,163,74,0.15);
          transform: translateY(-1px);
        }

        .github-btn {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
          box-shadow: 0 4px 16px rgba(22,163,74,0.35);
        }
        .github-btn:hover {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(22,163,74,0.5);
        }

        .auth-footer {
          color: #86b899;
          font-size: 0.78rem;
        }

        .spinner {
          width: 36px; height: 36px;
          border: 3px solid #bbf7d0;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
