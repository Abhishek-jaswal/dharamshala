'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="dash-loading">
        <div className="spinner" />
      </div>
    );
  }

  const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
  const avatar = user.avatar
    ? `${pbUrl}/api/files/_pb_users_auth_/${user.id}/${user.avatar}`
    : null;

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="dash-root">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Dharamshala</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </header>

      {/* Main */}
      <main className="dash-main">
        {/* Welcome card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {avatar ? (
              <img src={avatar} alt="Avatar" />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="profile-info">
            <h1 className="profile-name">Welcome back, {user.name?.split(' ')[0] || 'User'} 👋</h1>
            <p className="profile-email">{user.email}</p>
            <span className="profile-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified
            </span>
          </div>
        </div>

        {/* Info grid */}
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="info-label">Full Name</p>
              <p className="info-value">{user.name || '—'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{user.email || '—'}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <p className="info-label">Member Since</p>
              <p className="info-value">
                {new Date(user.created).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="info-label">User ID</p>
              <p className="info-value id-value">{user.id}</p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dash-root {
          min-height: 100vh;
          background: linear-gradient(160deg, #f0fdf4 0%, #dcfce7 60%, #bbf7d0 100%);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .dash-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0fdf4;
        }

        .spinner {
          width: 36px; height: 36px;
          border: 3px solid #bbf7d0;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Header */
        .dash-header {
          position: sticky; top: 0; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 32px;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(187,247,208,0.6);
          box-shadow: 0 2px 16px rgba(22,163,74,0.06);
        }

        .dash-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.1rem; font-weight: 800; color: #14532d;
        }
        .dash-logo svg {
          background: linear-gradient(135deg, #16a34a, #22c55e);
          padding: 6px; border-radius: 10px;
          box-shadow: 0 4px 12px rgba(22,163,74,0.3);
        }

        .logout-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 9px 18px;
          background: white;
          color: #16a34a;
          border: 1.5px solid #d1fae5;
          border-radius: 10px;
          font-family: inherit;
          font-size: 0.88rem; font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #f0fdf4;
          border-color: #4ade80;
          box-shadow: 0 2px 12px rgba(22,163,74,0.15);
        }

        /* Main */
        .dash-main {
          max-width: 860px;
          margin: 40px auto;
          padding: 0 24px;
        }

        /* Profile card */
        .profile-card {
          display: flex; align-items: center; gap: 24px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.95);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          box-shadow: 0 8px 32px rgba(22,163,74,0.10);
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .profile-avatar {
          width: 84px; height: 84px; flex-shrink: 0;
          border-radius: 50%;
          background: linear-gradient(135deg, #16a34a, #4ade80);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 800; color: white;
          box-shadow: 0 4px 20px rgba(22,163,74,0.35);
          overflow: hidden;
        }
        .profile-avatar img {
          width: 100%; height: 100%; object-fit: cover;
        }

        .profile-name {
          font-size: 1.5rem; font-weight: 800; color: #14532d;
          margin-bottom: 4px;
        }

        .profile-email {
          font-size: 0.9rem; color: #4b7a5a;
          margin-bottom: 10px;
        }

        .profile-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #dcfce7; color: #16a34a;
          font-size: 0.75rem; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid #bbf7d0;
          text-transform: uppercase; letter-spacing: 0.05em;
        }

        /* Info grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .info-card {
          display: flex; align-items: center; gap: 16px;
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(255,255,255,0.95);
          border-radius: 18px;
          padding: 20px 24px;
          box-shadow: 0 4px 16px rgba(22,163,74,0.07);
          animation: fadeIn 0.5s ease both;
        }
        .info-card:nth-child(2) { animation-delay: 0.05s; }
        .info-card:nth-child(3) { animation-delay: 0.10s; }
        .info-card:nth-child(4) { animation-delay: 0.15s; }

        .info-icon {
          width: 42px; height: 42px; flex-shrink: 0;
          background: #f0fdf4;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          color: #16a34a;
        }

        .info-label {
          font-size: 0.75rem; font-weight: 600;
          color: #86b899; text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 4px;
        }

        .info-value {
          font-size: 0.95rem; font-weight: 600; color: #14532d;
        }

        .id-value {
          font-size: 0.8rem; font-family: monospace;
          color: #4b7a5a; word-break: break-all;
        }

        @media (max-width: 500px) {
          .profile-card { flex-direction: column; text-align: center; }
          .dash-header { padding: 14px 16px; }
        }
      `}</style>
    </div>
  );
}
