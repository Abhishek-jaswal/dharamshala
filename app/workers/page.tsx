'use client';
import { useState, useEffect } from 'react';
import { getPb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { SKILLS_EN } from '@/lib/data';

// ── Skill → emoji map ─────────────────────────────────────────
const SKILL_ICONS: Record<string, string> = {
  'Cooking': '👨‍🍳',
  'Farming': '🌾',
  'Carpentry': '🪵',
  'Tailoring': '🧵',
  'Driving': '🚗',
  'Teaching': '📚',
  'Nursing': '🏥',
  'Plumbing': '🚿',
  'Electrical': '⚡',
  'IT/Computer': '💻',
  'Painting': '🎨',
  'Masonry': '🧱',
  'Photography': '📷',
  'Music': '🎵',
  'Welding': '🔩',
};

// ── Worker detail modal ───────────────────────────────────────
function WorkerModal({ worker, onClose }: { worker: any; onClose: () => void }) {
  const name = worker.name || 'Worker';
  const phone = worker.contact;
  const skills = worker.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
  const location = worker.location;
  const role = worker.role;
  const rating = worker.rating || 0;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const dob = worker.dob
    ? new Date(worker.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0,
      }}
    >
      <div className="slide-up" style={{
        background: '#fff', borderRadius: '22px 22px 0 0',
        width: '100%', maxWidth: 480,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header banner */}
        <div style={{
          background: 'linear-gradient(135deg,#0f4c25,#16a34a)',
          padding: '28px 22px 24px', borderRadius: '22px 22px 0 0', position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
            width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 900, flexShrink: 0,
            }}>{initials}</div>
            <div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 20 }}>{name}</div>
              {location && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>📍 {location}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                {worker.available && (
                  <span style={{ background: '#22c55e', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
                    🟢 Available
                  </span>
                )}
                {worker.verified && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
                    ✅ Verified
                  </span>
                )}
                {rating > 0 && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
                    ⭐ {rating.toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Contact buttons */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', marginBottom: 10 }}>CONTACT</div>
            {phone ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`tel:${phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', background: '#16a34a', color: '#fff',
                    border: 'none', borderRadius: 12, padding: '14px 0',
                    fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  }}>
                    📞 Call Now
                  </button>
                </a>
                <a
                  href={`https://wa.me/91${phone}?text=Hi ${encodeURIComponent(name)}, I found your profile on UrbanServe. Are you available for work?`}
                  target="_blank" rel="noreferrer"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <button style={{
                    width: '100%', background: '#dcfce7', color: '#16a34a',
                    border: '1.5px solid #d1fae5', borderRadius: 12, padding: '14px 0',
                    fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}>
                    💬 WhatsApp
                  </button>
                </a>
              </div>
            ) : (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
                padding: '12px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600,
              }}>
                ⚠️ No phone number added yet.
              </div>
            )}
            {phone && (
              <div style={{ marginTop: 8, textAlign: 'center' as const, color: '#64748b', fontSize: 13 }}>
                📱 +91 {phone}
              </div>
            )}
          </div>

          {/* Profile details */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', marginBottom: 10 }}>PROFILE</div>
            <div style={{ background: '#f8fafc', borderRadius: 14, overflow: 'hidden' }}>
              {([
                ['📍', 'Location', location],
                ['👤', 'Role', role ? role.charAt(0).toUpperCase() + role.slice(1) : null],
                ['🎂', 'Date of Birth', dob],
              ] as [string, string, string | null][]).filter(([, , v]) => v).map(([icon, label, val]) => (
                <div key={label} style={{
                  display: 'flex', gap: 12, padding: '11px 16px',
                  borderBottom: '1px solid #f1f5f9', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>
                  <span style={{ color: '#94a3b8', fontSize: 13, minWidth: 80 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', marginBottom: 10 }}>🛠 SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {skills.map((s: string) => (
                  <span key={s} style={{
                    background: '#f0fdf4', border: '1px solid #d1fae5',
                    color: '#16a34a', borderRadius: 99, padding: '5px 14px',
                    fontSize: 13, fontWeight: 600,
                  }}>
                    {SKILL_ICONS[s] || '🔧'} {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {worker.interests && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.07em', marginBottom: 10 }}>❤️ INTERESTS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {worker.interests.split(',').map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
                  <span key={s} style={{
                    background: '#fef9ee', border: '1px solid #fde68a',
                    color: '#d97706', borderRadius: 99, padding: '5px 14px',
                    fontSize: 13, fontWeight: 600,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Worker card ───────────────────────────────────────────────
function WorkerCard({ worker, onClick }: { worker: any; onClick: () => void }) {
  const name = worker.name || 'Worker';
  const skills = worker.skills?.split(',').map((s: string) => s.trim()).filter(Boolean) || [];
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const phone = worker.contact;

  return (
    <div
      className="hover-lift"
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
        padding: '18px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 0.2s',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#16a34a,#22c55e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 18,
        }}>{initials}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>{name}</div>
            {worker.verified && (
              <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', border: '1px solid #d1fae5', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>
                ✅ Verified
              </span>
            )}
          </div>
          {worker.location && (
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>📍 {worker.location}</div>
          )}
          {/* Primary skill */}
          {skills[0] && (
            <div style={{ color: '#16a34a', fontSize: 12, fontWeight: 600, marginTop: 2 }}>
              {SKILL_ICONS[skills[0]] || '🔧'} {skills[0]}
              {skills.length > 1 && <span style={{ color: '#94a3b8' }}> +{skills.length - 1} more</span>}
            </div>
          )}
        </div>

        {/* Available badge */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {worker.available ? (
            <span style={{ fontSize: 10, background: '#f0fdf4', color: '#16a34a', border: '1px solid #d1fae5', borderRadius: 99, padding: '3px 8px', fontWeight: 700 }}>
              🟢 Available
            </span>
          ) : (
            <span style={{ fontSize: 10, background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: 99, padding: '3px 8px', fontWeight: 600 }}>
              Busy
            </span>
          )}
          {worker.rating > 0 && (
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>⭐ {Number(worker.rating).toFixed(1)}</span>
          )}
        </div>
      </div>

      {/* Skills row */}
      {skills.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {skills.slice(0, 3).map((s: string) => (
            <span key={s} style={{
              background: '#f0fdf4', border: '1px solid #d1fae5',
              color: '#15803d', borderRadius: 99, padding: '3px 10px',
              fontSize: 11, fontWeight: 600,
            }}>{SKILL_ICONS[s] || '🔧'} {s}</span>
          ))}
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          style={{
            flex: 1, background: '#16a34a', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          👤 View Profile
        </button>
        {phone && (
          <a
            href={`tel:${phone}`}
            onClick={e => e.stopPropagation()}
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            <button style={{
              background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #d1fae5',
              borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              📞 Call
            </button>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function WorkersPage() {
  const { lang } = useLang();
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewWorker, setViewWorker] = useState<any | null>(null);
  const [availOnly, setAvailOnly] = useState(false);

  // Fetch all worker/both profiles
  useEffect(() => {
    setLoading(true);
    getPb()
      .collection('profiles')
      .getList(1, 200, {
        filter: `role="worker" || role="both"`,
        sort: '-rating,-created',
      })
      .then(r => setWorkers(r.items))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  const filtered = workers.filter(w => {
    if (availOnly && !w.available) return false;
    if (skillFilter !== 'all') {
      const wSkills = (w.skills || '').toLowerCase();
      if (!wSkills.includes(skillFilter.toLowerCase())) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        w.name?.toLowerCase().includes(q) ||
        w.location?.toLowerCase().includes(q) ||
        w.skills?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const inp: React.CSSProperties = {
    flex: 1, border: 'none', background: 'transparent',
    padding: '13px 16px', fontSize: 15, fontFamily: 'inherit',
    outline: 'none', color: '#0f172a',
  };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: '#f8fafc', minHeight: '100vh' }}>

      {/* Hero */}
      <header style={{ background: 'linear-gradient(135deg,#0f4c25,#16a34a)', padding: 'clamp(20px,4vw,40px) clamp(14px,4vw,24px) clamp(36px,6vw,60px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(20px,5vw,36px)', fontWeight: 900, color: '#fff', marginBottom: 6 }}>
            👷 Find Skilled Workers
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(13px,2vw,15px)' }}>
            {workers.length} workers available · Filter by skill · Contact directly
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '-24px auto 0', padding: '0 clamp(10px,4vw,24px) 60px' }}>

        {/* Search bar */}
        <div style={{
          background: '#fff', borderRadius: 14, padding: 5,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: 18,
          display: 'flex', gap: 0,
        }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search by name, skill or city…"
            style={inp}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', padding: '0 12px', fontSize: 16,
              color: '#94a3b8', cursor: 'pointer',
            }}>✕</button>
          )}
          <button style={{
            background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10,
            padding: '0 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>Search</button>
        </div>

        {/* Available only toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <button
            onClick={() => setAvailOnly(a => !a)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: availOnly ? '#f0fdf4' : '#fff',
              border: `1.5px solid ${availOnly ? '#16a34a' : '#e2e8f0'}`,
              borderRadius: 99, padding: '7px 16px', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, color: availOnly ? '#16a34a' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            <span style={{
              width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
              background: availOnly ? '#22c55e' : '#cbd5e1',
              display: 'inline-block',
            }} />
            Available Now Only
          </button>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>
            {filtered.length} worker{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Skill filter pills */}
        <div className="pill-scroll" style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 24,
        }}>
          {/* All */}
          <button
            onClick={() => setSkillFilter('all')}
            className="w-pill"
            style={{
              fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 99,
              border: '1.5px solid', whiteSpace: 'nowrap' as const, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
              borderColor: skillFilter === 'all' ? '#16a34a' : '#e2e8f0',
              background: skillFilter === 'all' ? '#16a34a' : '#fff',
              color: skillFilter === 'all' ? '#fff' : '#475569',
            }}
          >
            🌐 All Skills
          </button>

          {SKILLS_EN.map(skill => {
            const active = skillFilter === skill;
            return (
              <button
                key={skill}
                onClick={() => setSkillFilter(active ? 'all' : skill)}
                className="w-pill"
                style={{
                  fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 99,
                  border: '1.5px solid', whiteSpace: 'nowrap' as const, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  borderColor: active ? '#16a34a' : '#e2e8f0',
                  background: active ? '#16a34a' : '#fff',
                  color: active ? '#fff' : '#475569',
                }}
              >
                {SKILL_ICONS[skill] || '🔧'} {skill}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
            <div className="spinner" />
            <p style={{ color: '#94a3b8', fontSize: 15 }}>Loading workers…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center' as const, padding: '80px 20px' }}>
            <div style={{ fontSize: 54, marginBottom: 14 }}>🔍</div>
            <p style={{ fontWeight: 800, color: '#0f172a', fontSize: 18 }}>No workers found</p>
            <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
              {workers.length === 0
                ? 'No workers have registered yet.'
                : 'Try a different skill or clear filters.'}
            </p>
            {(skillFilter !== 'all' || search || availOnly) && (
              <button
                onClick={() => { setSkillFilter('all'); setSearch(''); setAvailOnly(false); }}
                style={{
                  marginTop: 18, background: '#16a34a', color: '#fff', border: 'none',
                  borderRadius: 10, padding: '11px 24px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >Clear Filters</button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,300px),1fr))',
            gap: 14,
          }}>
            {filtered.map(w => (
              <WorkerCard key={w.id} worker={w} onClick={() => setViewWorker(w)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {viewWorker && (
        <WorkerModal worker={viewWorker} onClose={() => setViewWorker(null)} />
      )}

      <style>{`
        .pill-scroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .pill-scroll::-webkit-scrollbar { display: none; }
        @media (max-width: 480px) {
          .w-pill { font-size: 11px !important; padding: 6px 11px !important; }
        }
        @media (min-width: 540px) {
          .slide-up {
            border-radius: 20px !important;
            margin: auto;
            position: relative;
          }
        }
      `}</style>
    </div>
  );
}
