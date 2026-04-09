'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';
// import { shareJob, vibrate, vibrateCelebrate } from '@/lib/pwa';

const JOB_TYPES = ['Daily Wage', 'Hourly', 'Part-Time', 'Contract', 'Full-Time', 'Team Hire'];

const Pill = ({ active, onClick, children }: any) => (
  <button onClick={onClick} className="filter-pill" style={{
    fontWeight: 600, borderRadius: 99, border: '1.5px solid',
    whiteSpace: 'nowrap' as const, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
    borderColor: active ? '#16a34a' : '#e2e8f0',
    background: active ? '#16a34a' : '#fff',
    color: active ? '#fff' : '#475569',
  }}>{children}</button>
);

// ── Full profile modal shown when poster clicks applicant name ───────────────
function ProfileModal({ person, onClose }: { person: any; onClose: () => void }) {
  const p = person.profile;
  const name = p?.name || person.expand?.applicant?.name || 'Unknown';
  const phone = p?.contact;
  const skills = p?.skills;
  const location = p?.location;
  const role = p?.role;
  const dob = p?.dob ? new Date(p.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const interests = p?.interests;
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const applied = new Date(person.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div className="slide-down" style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

        <div style={{ background: 'linear-gradient(135deg,#0f4c25,#16a34a)', padding: '32px 28px 28px', borderRadius: '24px 24px 0 0', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 900, flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 22 }}>{name}</div>
              {role && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 3, textTransform: 'capitalize' as const }}>👤 {role}</div>}
              {location && <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, marginTop: 2 }}>📍 {location}</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
            ✅ Applied on {applied}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10 }}>CONTACT</div>
            {phone ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <a href={`tel:${phone}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
                    📞 Call Now
                  </button>
                </a>
                <a href={`https://wa.me/91${phone}?text=Hi ${encodeURIComponent(name)}, I saw your job application on UrbanServe. Are you still available?`} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{ width: '100%', background: '#dcfce7', color: '#16a34a', border: '1.5px solid #d1fae5', borderRadius: 12, padding: '14px', fontWeight: 800, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    💬 WhatsApp
                  </button>
                </a>
              </div>
            ) : (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
                ⚠️ This person has not added a phone number yet.
              </div>
            )}
            {phone && (
              <div style={{ marginTop: 8, background: '#f8fafc', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#64748b', textAlign: 'center' as const }}>
                📱 {phone}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10 }}>PROFILE DETAILS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, background: '#f8fafc', borderRadius: 14, overflow: 'hidden' }}>
              {([['📍', 'Location', location], ['🎂', 'Date of Birth', dob], ['👤', 'Role', role]] as [string, string, string | null][])
                .filter(([, , v]) => v).map(([icon, label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13, minWidth: 90 }}>{label}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{val}</span>
                  </div>
                ))}
            </div>
          </div>

          {skills && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10 }}>🛠 SKILLS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {skills.split(', ').filter(Boolean).map((s: string) => (
                  <span key={s} style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#16a34a', borderRadius: 99, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {interests && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 10 }}>❤️ INTERESTS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {interests.split(', ').filter(Boolean).map((s: string) => (
                  <span key={s} style={{ background: '#fef9ee', border: '1px solid #fde68a', color: '#d97706', borderRadius: 99, padding: '5px 14px', fontSize: 13, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Applicants drawer for the job poster ────────────────────────────────────
function ApplicantsDrawer({ job }: { job: any }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [viewProfile, setViewProfile] = useState<any | null>(null);

  useEffect(() => {
    getPb().collection('applications').getList(1, 1, { filter: `job="${job.id}"` })
      .then(r => setCount(r.totalItems)).catch(() => setCount(0));
  }, [job.id]);

  const load = async () => {
    setLoading(true);
    try {
      const apps = await getPb().collection('applications').getList(1, 100, {
        filter: `job="${job.id}"`, sort: '-created',
      });
      const rich = await Promise.all(apps.items.map(async (app: any) => {
        try {
          const profile = await getPb().collection('profiles').getFirstListItem(`user="${app.applicant}"`);
          return { ...app, profile };
        } catch { return { ...app, profile: null }; }
      }));
      setApplicants(rich);
    } catch { setApplicants([]); }
    finally { setLoading(false); }
  };

  const toggle = () => { if (!open) load(); setOpen(o => !o); };

  return (
    <div>
      <button onClick={toggle} style={{
        width: '100%',
        background: open ? '#0f172a' : '#f0fdf4',
        border: `1.5px solid ${open ? '#0f172a' : '#d1fae5'}`,
        borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700,
        color: open ? '#fff' : '#16a34a', cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: 18 }}>👥</span>
        {open ? '▲ Hide Applicants' : `See Who Applied${count !== null ? ` (${count})` : ''}`}
        {(count ?? 0) > 0 && !open && (
          <span style={{ background: '#16a34a', color: '#fff', borderRadius: 99, padding: '1px 8px', fontSize: 12, fontWeight: 800 }}>{count}</span>
        )}
      </button>

      {open && (
        <div className="slide-down" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '28px' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading applicants…</p>
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 20px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>⏳</div>
              <div style={{ color: '#64748b', fontSize: 14, fontWeight: 600 }}>No applications yet</div>
              <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Share your job to get applicants!</div>
            </div>
          ) : applicants.map((app: any, i: number) => {
            const name = app.profile?.name || 'Unknown';
            const phone = app.profile?.contact;
            const skills = app.profile?.skills;
            const location = app.profile?.location;
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

            return (
              <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <button onClick={() => setViewProfile(app)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' as const, padding: 0, fontFamily: 'inherit' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {name}
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 99, padding: '1px 7px' }}>View Profile →</span>
                      </div>
                      {location && <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>📍 {location}</div>}
                      {skills && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>🛠 {skills}</div>}
                    </div>
                  </button>

                  {phone ? (
                    <a href={`tel:${phone}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <button style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                        📞 Call
                      </button>
                    </a>
                  ) : (
                    <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>No phone</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewProfile && <ProfileModal person={viewProfile} onClose={() => setViewProfile(null)} />}
    </div>
  );
}

// ── Single job card ───────────────────────────────────────────────────────────
function JobCard({ job, user, authLoading, lang, onDelete, onEdit }: { job: any; user: any; authLoading: boolean; lang: string; onDelete?: (jobId: string) => void; onEdit?: (job: any) => void }) {
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checking, setChecking] = useState(true);
  const [applicantCount, setApplicantCount] = useState<number | null>(null);
  const [shareLabel, setShareLabel] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isMyJob = user && job.posted_by === user.id;
  const cat = CATEGORIES.find(c => c.id === job.category);

  // Determine job status based on applicant count
  const getJobStatus = () => {
    if (job.status === 'filled') return { label: 'Hired', icon: '✅', color: '#16a34a', bg: '#f0fdf4' };
    if (job.status === 'closed') return { label: 'Closed', icon: '❌', color: '#dc2626', bg: '#fef2f2' };
    if (applicantCount && applicantCount > 0) return { label: 'Under Review', icon: '👀', color: '#f59e0b', bg: '#fef9e7' };
    return { label: 'Pending', icon: '⏳', color: '#64748b', bg: '#f8fafc' };
  };

  const jobStatus = getJobStatus();

  const timeAgo = (() => {
    const d = (Date.now() - new Date(job.created).getTime()) / 1000;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  })();

  // Check if already applied — read localStorage first (instant), then confirm via API
  useEffect(() => {
    if (authLoading) return; // auth not ready yet
    if (!user || isMyJob) { setChecking(false); return; }

    // ── 1. Instant cache check ────────────────────────────────
    const cacheKey = `applied_${user.id}_${job.id}`;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(cacheKey) === '1') {
      setApplied(true);
      setChecking(false);
      return; // already confirmed from cache, skip API call
    }

    // ── 2. API check (confirms server-side) ──────────────────
    getPb().collection('applications')
      .getList(1, 1, { filter: `job="${job.id}" && applicant="${user.id}"` })
      .then(res => {
        if (res.totalItems > 0) {
          setApplied(true);
          // Persist to localStorage so next refresh is instant
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(cacheKey, '1');
          }
        }
      })
      .catch(() => { })
      .finally(() => setChecking(false));
  }, [user, job.id, isMyJob, authLoading]);

  // Fetch applicant count for non-posters
  useEffect(() => {
    if (isMyJob) return;
    getPb().collection('applications').getList(1, 1, { filter: `job="${job.id}"` })
      .then(r => setApplicantCount(r.totalItems)).catch(() => setApplicantCount(0));
  }, [job.id, isMyJob]);

  const handleApply = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setApplying(true);
    try {
      await getPb().collection('applications').create({ job: job.id, applicant: user.id, status: 'pending' });
      setApplied(true);
      // Persist so page refresh still shows "Applied"
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`applied_${user.id}_${job.id}`, '1');
      }
      // Haptic feedback — tiny 80ms buzz on success
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80);
    } catch {
      setApplied(true); // duplicate = already applied
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`applied_${user.id}_${job.id}`, '1');
      }
    } finally { setApplying(false); }
  };

  const handleShare = async () => {
    const text = `💼 ${job.title} — ${job.pay} | ${job.location}\n\nApply on UrbanServe 👇`;
    const url = window.location.origin + '/gigs';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `${job.title} — UrbanServe`, text, url }).catch(() => { });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareLabel(lang === 'hi' ? '✅ कॉपी हो गया!' : '✅ Copied!');
      setTimeout(() => setShareLabel(null), 2000);
    }
  };

  return (
    <article className="hover-lift" aria-label={job.title} style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
      padding: 'clamp(14px,4vw,22px)' as any, boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: 16,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{ width: 52, height: 52, background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
            {cat?.icon || '💼'}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: 16, marginBottom: 2 }}>{job.title}</h2>
            {job.company && <div style={{ color: '#94a3b8', fontSize: 13 }}>{job.company}</div>}
          </div>
        </div>
        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
          <div style={{ fontWeight: 900, color: '#16a34a', fontSize: 18 }}>{job.pay}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{timeAgo}</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
        {job.urgent && <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>🔥 Urgent</span>}
        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #d1fae5', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>📍 {job.location}</span>
        <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{job.type}</span>
        {cat && <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{cat.icon} {cat.label}</span>}
      </div>

      {/* Skills */}
      {job.skills && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
          {job.skills.split(',').filter(Boolean).map((s: string) => (
            <span key={s} style={{ fontSize: 11, background: '#eff6ff', color: '#3b82f6', borderRadius: 6, padding: '3px 8px', fontWeight: 600 }}>{s.trim()}</span>
          ))}
        </div>
      )}

      {/* Applicant count badge (non-poster) */}
      {!isMyJob && applicantCount !== null && applicantCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b' }}>
          <span style={{ background: '#f1f5f9', borderRadius: 99, padding: '3px 10px', fontWeight: 600 }}>
            👥 {applicantCount} {applicantCount === 1 ? 'person' : 'people'} applied
          </span>
        </div>
      )}

      {/* My job badge */}
      {isMyJob && (
        <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#16a34a', fontWeight: 700 }}>✅ {lang === 'hi' ? 'आपकी जॉब पोस्टिंग' : 'Your Job Posting'}</div>
      )}

      {/* Job status display */}
      {isMyJob && applicantCount !== null && (
        <div style={{ background: jobStatus.bg, borderRadius: 10, padding: '8px 12px', fontSize: 12, color: jobStatus.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{jobStatus.icon}</span>
          <span>
            {jobStatus.label}
            {applicantCount > 0 && ` · ${applicantCount} applicant${applicantCount !== 1 ? 's' : ''}`}
          </span>
        </div>
      )}

      {/* Action area */}
      {isMyJob ? (
        <>
          <ApplicantsDrawer job={job} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            <button onClick={handleShare} style={{ flex: 1, minWidth: '100px', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: shareLabel ? '#f0fdf4' : '#fff', color: shareLabel ? '#16a34a' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }}>
              {shareLabel ?? (lang === 'hi' ? '🔗 शेयर करें' : '🔗 Share')}
            </button>
            <button onClick={() => onEdit?.(job)} style={{ flex: 1, minWidth: '100px', padding: '10px', border: '1.5px solid #3b82f6', borderRadius: 10, background: '#eff6ff', color: '#3b82f6', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              ✏️ {lang === 'hi' ? 'संपादन' : 'Edit'}
            </button>
            <button onClick={async () => {
              if (!confirm(lang === 'hi' ? 'क्या आप यह नौकरी हटाना चाहते हैं?' : 'Are you sure you want to delete this job?')) return;
              setDeleting(true);
              try {
                await getPb().collection('jobs').delete(job.id);
                onDelete?.(job.id);
              } catch (e) {
                alert(lang === 'hi' ? 'नौकरी हटाने में विफल' : 'Failed to delete job');
              } finally {
                setDeleting(false);
              }
            }} disabled={deleting} style={{ flex: 1, minWidth: '100px', padding: '10px', border: '1.5px solid #dc2626', borderRadius: 10, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: deleting ? 0.6 : 1 }}>
              🗑️ {deleting ? (lang === 'hi' ? 'हटा रहे हैं…' : 'Deleting…') : (lang === 'hi' ? 'हटाएं' : 'Delete')}
            </button>
          </div>
        </>
      ) : (
        <>
          {applied ? (
            <div style={{
              background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
              border: '1px solid #bbf7d0',
              borderRadius: 16, padding: '18px 20px',
              display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <span style={{ fontSize: 32, flexShrink: 0 }}>📬</span>
              <div>
                <div style={{ fontWeight: 800, color: '#15803d', fontSize: 14, marginBottom: 3 }}>
                  {lang === 'hi' ? '✅ आवेदन भेज दिया गया!' : '✅ Application Sent!'}
                </div>
                <div style={{ color: '#4b7a5a', fontSize: 13, lineHeight: 1.55 }}>
                  {lang === 'hi'
                    ? 'नौकरी देने वाला आपकी प्रोफाइल देखेगा और जल्द संपर्क करेगा। अपना फोन नंबर अपडेट रखें।'
                    : 'The hiring person will review your profile and contact you soon. Make sure your phone number is up to date.'}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying || checking}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                fontWeight: 800, fontSize: 15, fontFamily: 'inherit', transition: 'all 0.2s',
                cursor: (applying || checking) ? 'not-allowed' : 'pointer',
                background: checking ? '#f8fafc' : '#16a34a',
                color: checking ? '#94a3b8' : '#fff',
                boxShadow: checking ? 'none' : '0 4px 16px rgba(22,163,74,0.3)',
              }}>
              {checking
                ? (lang === 'hi' ? 'लोड हो रहा है…' : 'Loading…')
                : applying
                  ? (lang === 'hi' ? 'आवेदन हो रहा है…' : 'Applying…')
                  : (lang === 'hi' ? 'अभी आवेदन करें →' : 'Apply Now →')}
            </button>
          )}

          {/* Share button — always visible for non-poster */}
          <button onClick={handleShare} style={{ width: '100%', padding: '10px', border: '1.5px solid #e2e8f0', borderRadius: 10, background: shareLabel ? '#f0fdf4' : '#fff', color: shareLabel ? '#16a34a' : '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, transition: 'all 0.2s' }}>
            {shareLabel ?? (lang === 'hi' ? '🔗 शेयर करें' : '🔗 Share Job')}
          </button>

        </>
      )}
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GigsPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang, t } = useLang();
  const g = t.gigs;
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [form, setForm] = useState({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getPb().collection('jobs').getList(1, 100, { sort: '-created' });
      setJobs(res.items);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);
  useEffect(() => {
    const pb = getPb();
    try { pb.collection('jobs').subscribe('*', () => fetchJobs()); } catch { }
    return () => { try { pb.collection('jobs').unsubscribe('*'); } catch { } };
  }, []);

  const filtered = jobs
    .filter(j => catFilter === 'all' || j.category === catFilter)
    .filter(j => typeFilter === 'all' || j.type === typeFilter)
    .filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()));

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!form.title || !form.pay || !form.location) {
      alert(lang === 'hi' ? 'कृपया भरें: नौकरी का शीर्षक, वेतन और स्थान' : 'Please fill: Job title, Pay, and Location');
      return;
    }
    setPosting(true);
    try {
      if (editingJob) {
        // Update existing job
        await getPb().collection('jobs').update(editingJob.id, { ...form });
        setEditingJob(null);
      } else {
        // Create new job
        await getPb().collection('jobs').create({ ...form, posted_by: user.id });
      }
      setShowPost(false);
      setForm({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false });
    } catch (e) { console.error(e); alert(lang === 'hi' ? 'विफल' : 'Failed'); }
    finally { setPosting(false); }
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  const handleEditJob = (job: any) => {
    setForm({
      title: job.title,
      company: job.company || '',
      type: job.type,
      pay: job.pay,
      location: job.location,
      skills: job.skills || '',
      category: job.category || '',
      urgent: job.urgent || false,
    });
    setEditingJob(job);
    setShowPost(true);
  };

  const inp: React.CSSProperties = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: '#0f172a', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' as const, background: '#f8fafc' };

  return (
    <>
      <div style={{ fontFamily: "'Outfit',sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
        {/* Hero */}
        <header style={{ background: 'linear-gradient(135deg,#0f4c25,#16a34a)', padding: 'clamp(20px,4vw,40px) clamp(14px,4vw,24px) clamp(28px,5vw,56px)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 'clamp(18px,5vw,36px)', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                {lang === 'hi' ? '💼 नौकरी खोजें' : '💼 Find Jobs'}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
                {lang === 'hi'
                  ? `${jobs.length} नौकरियां अभी उपलब्ध · किसी भी कार्ड पर टैप करें`
                  : `${jobs.length} jobs live right now · Tap any card to apply`}
              </p>
            </div>
            <button onClick={() => user ? setShowPost(true) : router.push('/login')}
              className="post-job-hero-btn" style={{ background: '#fff', color: '#16a34a', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              {lang === 'hi' ? '+ नौकरी पोस्ट करें' : '+ Post a Job'}
            </button>
          </div>
        </header>

        <div style={{ maxWidth: 1400, margin: '-20px auto 0', padding: '0 clamp(10px,4vw,24px) 48px' }}>
          {/* Search */}
          <div style={{ background: '#fff', borderRadius: 16, padding: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', marginBottom: 24, display: 'flex', gap: 0 }}>
            <label htmlFor="job-search" style={{ display: 'none' }}>Search jobs</label>
            <input id="job-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'hi' ? '🔍  नौकरी, कौशल या शहर खोजें...' : '🔍  Search jobs, skills, or city...'}
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '14px 18px', fontSize: 16, fontFamily: 'inherit', outline: 'none', color: '#0f172a' }} />
            <button aria-label="Search jobs" style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 12, padding: '0 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'hi' ? 'खोजें' : 'Search'}
            </button>
          </div>

          <div className="pill-scroll" role="tablist" aria-label="Category filter" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 8 }}>
            <Pill active={catFilter === 'all'} onClick={() => setCatFilter('all')}>
              {lang === 'hi' ? '🌐 सभी श्रेणियां' : '🌐 All Categories'}
            </Pill>
            {CATEGORIES.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.icon} {c.label}</Pill>)}
          </div>
          <div className="pill-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 28 }}>
            <Pill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
              {lang === 'hi' ? 'सभी प्रकार' : 'All Types'}
            </Pill>
            {JOB_TYPES.map(tt => <Pill key={tt} active={typeFilter === tt} onClick={() => setTypeFilter(tt)}>{tt}</Pill>)}
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16 }}>
              <div className="spinner" />
              <p style={{ color: '#94a3b8', fontSize: 15 }}>{lang === 'hi' ? 'नौकरियां लोड हो रही हैं…' : 'Loading jobs…'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
              <p style={{ color: '#334155', fontWeight: 700, fontSize: 18 }}>
                {lang === 'hi' ? 'कोई नौकरी नहीं मिली' : 'No jobs found'}
              </p>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 6 }}>
                {jobs.length === 0
                  ? (lang === 'hi' ? 'पहली नौकरी पोस्ट करें!' : 'Be the first to post a job!')
                  : (lang === 'hi' ? 'अलग फिल्टर आज़माएं' : 'Try different filters')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,320px),1fr))', gap: 14 }}>
              {filtered.map(job => <JobCard key={job.id} job={job} user={user} authLoading={authLoading} lang={lang} onDelete={handleDeleteJob} onEdit={handleEditJob} />)}
            </div>
          )}
        </div>

        {/* Post Job Modal */}
        {showPost && (
          <div role="dialog" aria-modal="true" aria-label="Post a Job"
            className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0, zIndex: 500, backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowPost(false); }}>
            <div className="slide-up post-modal" style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: 'clamp(20px,5vw,32px)', width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a' }}>
                    {editingJob
                      ? (lang === 'hi' ? '✏️ नौकरी संपादित करें' : '✏️ Edit Job')
                      : (lang === 'hi' ? '📋 नौकरी पोस्ट करें' : '📋 Post a Job')}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 2 }}>
                    {editingJob
                      ? (lang === 'hi' ? 'परिवर्तन करें और सहेजें' : 'Make changes and save')
                      : (lang === 'hi' ? 'जल्दी से वर्कर खोजने के लिए भरें' : 'Fill details to find workers fast')}
                  </p>
                </div>
                <button onClick={() => { setShowPost(false); setEditingJob(null); setForm({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false }); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: '#64748b' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {([
                  ['title', lang === 'hi' ? 'नौकरी का शीर्षक *' : 'Job Title *', lang === 'hi' ? 'जैसे: घर में प्लंबर चाहिए' : 'e.g. Need Plumber at Home'],
                  ['pay', lang === 'hi' ? 'वेतन *' : 'Pay *', lang === 'hi' ? 'जैसे: ₹500/दिन' : 'e.g. ₹500/day'],
                  ['location', lang === 'hi' ? 'स्थान *' : 'Location *', lang === 'hi' ? 'शहर या क्षेत्र' : 'City or Area'],
                  ['company', lang === 'hi' ? 'कंपनी / दुकान (वैकल्पिक)' : 'Company / Shop (optional)', lang === 'hi' ? 'आपका बिज़नेस नाम' : 'Your business name'],
                ] as [string, string, string][]).map(([field, label, ph]) => (
                  <div key={field}>
                    <label htmlFor={`post-${field}`} style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>{label}</label>
                    <input id={`post-${field}`} placeholder={ph} style={inp} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                      {lang === 'hi' ? 'नौकरी का प्रकार' : 'Job Type'}
                    </label>
                    <select style={inp} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {JOB_TYPES.map(tt => <option key={tt}>{tt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                      {lang === 'hi' ? 'श्रेणी' : 'Category'}
                    </label>
                    <select style={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">{lang === 'hi' ? '— चुनें —' : '— Select —'}</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6 }}>
                    {lang === 'hi' ? 'आवश्यक कौशल (वैकल्पिक)' : 'Required Skills (optional)'}
                  </label>
                  <input placeholder={lang === 'hi' ? 'जैसे: प्लंबिंग, वायरिंग' : 'e.g. Plumbing, Wiring'} style={inp} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '12px 14px', background: '#fef2f2', borderRadius: 12, border: '1px solid #fecaca' }}>
                  <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} style={{ accentColor: '#dc2626', width: 18, height: 18 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>
                    {lang === 'hi' ? '🔥 अत्यावश्यक चिह्नित करें' : '🔥 Mark as Urgent'}
                  </span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => { setShowPost(false); setEditingJob(null); setForm({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false }); }} style={{ flex: 1, padding: '14px', border: '1.5px solid #e2e8f0', borderRadius: 12, color: '#475569', fontWeight: 600, fontSize: 14, cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button onClick={handlePost} disabled={posting} style={{
                  flex: 2, padding: '14px', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: posting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  background: posting ? '#d1fae5' : '#16a34a', color: posting ? '#4b7a5a' : '#fff',
                  boxShadow: posting ? 'none' : '0 4px 16px rgba(22,163,74,0.3)'
                }}>
                  {posting
                    ? (lang === 'hi' ? 'हो रहा है…' : 'Saving…')
                    : editingJob
                      ? (lang === 'hi' ? '✅ अपडेट करें' : '✅ Update Job')
                      : (lang === 'hi' ? '✅ नौकरी पोस्ट करें' : '✅ Post Job Now')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Gigs page responsive styles */

        /* Filter pills */
        .filter-pill { font-size: 12px; padding: 7px 14px; }
        @media (max-width: 480px) {
          .filter-pill { font-size: 11px; padding: 6px 11px; }
        }
        @media (max-width: 360px) {
          .filter-pill { font-size: 10px; padding: 5px 9px; }
        }

        /* Post job hero button */
        .post-job-hero-btn { padding: 11px 20px; font-size: 14px; }
        @media (max-width: 480px) {
          .post-job-hero-btn { padding: 10px 16px; font-size: 13px; width: 100%; }
        }

        /* Modal backdrop — centered on desktop, bottom sheet on mobile */
        @media (min-width: 540px) {
          .modal-backdrop { align-items: center !important; padding: 16px !important; }
          .post-modal { border-radius: 20px !important; }
        }

        /* Search bar */
        @media (max-width: 480px) {
          #job-search { font-size: 14px !important; padding: 12px 12px !important; }
        }
      `}</style>
    </>
  );
}