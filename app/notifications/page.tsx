'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  new_application: { icon: '👤', color: '#3b82f6', bg: '#eff6ff' },
  accepted: { icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
  rejected: { icon: '❌', color: '#dc2626', bg: '#fef2f2' },
  review: { icon: '⭐', color: '#d97706', bg: '#fef9ee' },
  default: { icon: '🔔', color: '#64748b', bg: '#f8fafc' },
};

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const fetchNotifs = async () => {
    if (!user) return;
    setFetching(true);
    try {
      const res = await getPb().collection('notifications').getList(1, 50, {
        filter: `user="${user.id}"`, sort: '-created',
      });
      setNotifs(res.items);
    } catch { setNotifs([]); }
    finally { setFetching(false); }
  };

  useEffect(() => { if (user) fetchNotifs(); }, [user]);

  const markRead = async (id: string) => {
    try {
      await getPb().collection('notifications').update(id, { read: true });
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch { }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    const unread = notifs.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => getPb().collection('notifications').update(n.id, { read: true })));
      setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    } catch { }
    finally { setMarkingAll(false); }
  };

  const deleteNotif = async (id: string) => {
    try {
      await getPb().collection('notifications').delete(id);
      setNotifs(prev => prev.filter(n => n.id !== id));
    } catch { }
  };

  const timeAgo = (dateStr: string) => {
    const d = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (d < 60) return 'just now';
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  if (loading || fetching) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div className="spinner" />
      <p style={{ color: '#94a3b8', fontFamily: "'Outfit',sans-serif", fontSize: 15 }}>Loading…</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg,#0f4c25,#16a34a)', padding: 'clamp(20px,4vw,40px) clamp(14px,4vw,24px) clamp(28px,5vw,56px)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(20px,5vw,32px)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                🔔 Notifications
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} disabled={markingAll} style={{
                background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 700,
                cursor: markingAll ? 'not-allowed' : 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(6px)',
              }}>
                {markingAll ? '…' : '✓ Mark all read'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '-20px auto 0', padding: '0 clamp(10px,4vw,24px) 80px' }}>
        {notifs.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 20, padding: '60px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', marginTop: 0 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔕</div>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: 18, marginBottom: 8 }}>No notifications yet</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              When someone applies to your job or your application status changes, you'll see it here.
            </p>
            <Link href="/gigs" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(22,163,74,0.3)' }}>
                💼 Browse Jobs
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
            {notifs.map(n => {
              const cfg = TYPE_CONFIG[n.type as string] || TYPE_CONFIG.default;
              return (
                <div key={n.id} onClick={() => { if (!n.read) markRead(n.id); if (n.link) router.push(n.link); }}
                  style={{
                    background: n.read ? '#fff' : '#f0fdf4',
                    border: `1.5px solid ${n.read ? '#e2e8f0' : '#d1fae5'}`,
                    borderRadius: 16, padding: '16px 18px',
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    cursor: n.link ? 'pointer' : 'default',
                    boxShadow: n.read ? '0 1px 4px rgba(0,0,0,0.04)' : '0 2px 12px rgba(22,163,74,0.1)',
                    transition: 'all 0.15s',
                  }}>
                  {/* Icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ fontWeight: n.read ? 600 : 800, color: '#0f172a', fontSize: 14, lineHeight: 1.4 }}>
                        {n.title}
                      </div>
                      {!n.read && (
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0, marginTop: 4 }} />
                      )}
                    </div>
                    {n.body && <div style={{ color: '#64748b', fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{n.body}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{timeAgo(n.created)}</span>
                      <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }} style={{
                        background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1',
                        fontSize: 14, padding: '2px 4px', borderRadius: 4, fontFamily: 'inherit',
                      }} title="Delete">✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
