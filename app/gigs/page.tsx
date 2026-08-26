'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';

const JOB_TYPES = ['Daily Wage', 'Hourly', 'Part-Time', 'Contract', 'Full-Time', 'Team Hire'];

const Pill = ({ active, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`filter-pill whitespace-nowrap rounded-full border font-semibold font-inherit transition-colors cursor-pointer ${active
      ? 'border-green-600 bg-green-600 text-white'
      : 'border-slate-200 bg-white text-slate-600'
      }`}
  >
    {children}
  </button>
);

// ── Profile Incomplete Warning Modal ─────────────────────────────────────────
function ProfileWarningModal({ onClose, onContinue }: { onClose: () => void; onContinue: () => void }) {
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[700] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="slide-down w-full max-w-sm rounded-2xl bg-white p-7 shadow-2xl">
        <div className="mb-4 text-center text-5xl">⚠️</div>
        <h3 className="mb-2 text-center text-lg font-extrabold text-slate-900">Profile Incomplete</h3>
        <p className="mb-5 text-center text-sm leading-relaxed text-slate-500">
          You haven't added a <strong>phone number</strong> to your profile. The employer won't be able to contact you!
        </p>
        <div className="flex gap-2.5">
          <a href="/dashboard" className="flex-1 no-underline">
            <button className="w-full rounded-full bg-green-600 py-3 text-sm font-bold text-white font-inherit cursor-pointer">
              📱 Add Phone
            </button>
          </a>
          <button
            onClick={onContinue}
            className="flex-1 rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-500 font-inherit cursor-pointer"
          >
            Apply Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div className="slide-down flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="relative rounded-t-3xl bg-gradient-to-br from-green-800 to-green-600 px-7 pb-7 pt-8">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border-none bg-white/20 text-base text-white cursor-pointer"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-white/15 text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <div className="text-xl font-bold text-white">{name}</div>
              {role && <div className="mt-1 text-sm capitalize text-white/75">{role}</div>}
              {location && <div className="mt-0.5 text-sm text-white/65">📍 {location}</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 px-7 py-6">
          <div className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            ✅ Applied on {applied}
          </div>

          <div>
            <div className="mb-2.5 text-xs font-bold tracking-wide text-slate-400">CONTACT</div>
            {phone ? (
              <div className="flex gap-2.5">
                <a href={`tel:${phone}`} className="flex-1 no-underline">
                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-green-600 py-3.5 text-[15px] font-bold text-white font-inherit cursor-pointer">
                    📞 Call Now
                  </button>
                </a>
                <a
                  href={`https://wa.me/91${phone}?text=Hi ${encodeURIComponent(name)}, I saw your application on UrbanServe. Are you still available?`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 no-underline"
                >
                  <button className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white py-3.5 text-[15px] font-bold text-green-700 font-inherit cursor-pointer">
                    💬 WhatsApp
                  </button>
                </a>
              </div>
            ) : (
              <div className="rounded-xl bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-600">
                ⚠️ This person has not added a phone number yet.
              </div>
            )}
            {phone && (
              <div className="mt-2 rounded-lg bg-slate-50 px-3.5 py-2.5 text-center text-sm text-slate-500">
                📱 {phone}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2.5 text-xs font-bold tracking-wide text-slate-400">PROFILE DETAILS</div>
            <div className="flex flex-col overflow-hidden rounded-2xl bg-slate-50">
              {([['📍', 'Location', location], ['🎂', 'Date of Birth', dob], ['👤', 'Role', role]] as [string, string, string | null][])
                .filter(([, , v]) => v)
                .map(([icon, label, val]) => (
                  <div key={label} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0">
                    <span className="shrink-0 text-lg">{icon}</span>
                    <span className="min-w-[90px] text-sm text-slate-400">{label}</span>
                    <span className="text-sm font-bold text-slate-900">{val}</span>
                  </div>
                ))}
            </div>
          </div>

          {skills && (
            <div>
              <div className="mb-2.5 text-xs font-bold tracking-wide text-slate-400">SKILLS</div>
              <div className="flex flex-wrap gap-2">
                {skills.split(', ').filter(Boolean).map((s: string) => (
                  <span key={s} className="rounded-full bg-green-50 px-3.5 py-1.5 text-sm font-semibold text-green-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interests && (
            <div>
              <div className="mb-2.5 text-xs font-bold tracking-wide text-slate-400">INTERESTS</div>
              <div className="flex flex-wrap gap-2">
                {interests.split(', ').filter(Boolean).map((s: string) => (
                  <span key={s} className="rounded-full bg-amber-50 px-3.5 py-1.5 text-sm font-semibold text-amber-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Applicants drawer ────────────────────────────────────────────────────────
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
      const apps = await getPb().collection('applications').getList(1, 100, { filter: `job="${job.id}"`, sort: '-created' });
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
      <button
        onClick={toggle}
        className="flex w-full cursor-pointer items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-slate-800 font-inherit"
      >
        <span>👥</span>
        <span className="flex-1 text-left">
          {count !== null ? `${count} applicant${count === 1 ? '' : 's'}` : 'Applicants'}
        </span>
        <span className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="slide-down mt-2 flex flex-col gap-2">
          {loading ? (
            <div className="p-7 text-center">
              <div className="spinner mx-auto mb-3" />
              <p className="text-sm text-slate-400">Loading applicants…</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-7 text-center">
              <div className="mb-2.5 text-4xl">⏳</div>
              <div className="text-sm font-semibold text-slate-500">No applications yet</div>
              <div className="mt-1 text-[13px] text-slate-400">Share your job to get applicants!</div>
            </div>
          ) : applicants.map((app: any, i: number) => {
            const name = app.profile?.name || 'Unknown';
            const skills = app.profile?.skills;
            const location = app.profile?.location;
            const role = app.profile?.role;
            const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
            const subtitle = [role, location].filter(Boolean).join(' · ') || (skills || '');
            return (
              <button
                key={i}
                onClick={() => setViewProfile(app)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left font-inherit cursor-pointer"
              >
                <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-700">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900">{name}</div>
                  {subtitle && <div className="truncate text-xs text-slate-400">{subtitle}</div>}
                </div>
                <span className="shrink-0 text-sm font-semibold text-green-700">View →</span>
              </button>
            );
          })}
        </div>
      )}
      {viewProfile && <ProfileModal person={viewProfile} onClose={() => setViewProfile(null)} />}
    </div>
  );
}

// ── Single job card ───────────────────────────────────────────────────────────
function JobCard({ job, user, profile, authLoading, onDelete, onEdit, isBookmarked, onBookmark, onStatusChange }: {
  job: any; user: any; profile: any; authLoading: boolean;
  onDelete?: (id: string) => void; onEdit?: (job: any) => void;
  isBookmarked?: boolean; onBookmark?: (id: string) => void;
  onStatusChange?: (id: string, status: string) => void;
}) {
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [checking, setChecking] = useState(true);
  const [applicantCount, setApplicantCount] = useState<number | null>(null);
  const [shareLabel, setShareLabel] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [waLoading, setWaLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState(job.status || 'open');
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const isMyJob = user && job.posted_by === user.id;
  const cat = CATEGORIES.find(c => c.id === job.category);

  const getStatusBadge = () => {
    if (jobStatus === 'filled') return { label: 'Hired', className: 'bg-green-100 text-green-700' };
    if (jobStatus === 'closed') return { label: 'Closed', className: 'bg-red-100 text-red-600' };
    if (applicantCount && applicantCount > 0) return { label: 'Under review', className: 'bg-amber-100 text-amber-700' };
    return { label: 'Open', className: 'bg-slate-100 text-slate-500' };
  };

  const timeAgo = (() => {
    const d = (Date.now() - new Date(job.created).getTime()) / 1000;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  })();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || isMyJob) { setChecking(false); return; }
    const cacheKey = `applied_${user.id}_${job.id}`;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(cacheKey) === '1') {
      setApplied(true); setChecking(false); return;
    }
    getPb().collection('applications').getList(1, 1, { filter: `job="${job.id}" && applicant="${user.id}"` })
      .then(res => {
        if (res.totalItems > 0) {
          setApplied(true);
          if (typeof localStorage !== 'undefined') localStorage.setItem(cacheKey, '1');
        }
      }).catch(() => { }).finally(() => setChecking(false));
  }, [user, job.id, isMyJob, authLoading]);

  useEffect(() => {
    if (isMyJob) return;
    getPb().collection('applications').getList(1, 1, { filter: `job="${job.id}"` })
      .then(r => setApplicantCount(r.totalItems)).catch(() => setApplicantCount(0));
  }, [job.id, isMyJob]);

  const doApply = async () => {
    setApplying(true);
    try {
      await getPb().collection('applications').create({ job: job.id, applicant: user.id, status: 'pending' });
      setApplied(true);
      if (typeof localStorage !== 'undefined') localStorage.setItem(`applied_${user.id}_${job.id}`, '1');
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(80);
      setToast({ title: 'Application sent', body: 'The employer will reach out to you soon.' });
    } catch {
      setApplied(true);
      if (typeof localStorage !== 'undefined') localStorage.setItem(`applied_${user.id}_${job.id}`, '1');
      setToast({ title: 'Application sent', body: 'The employer will reach out to you soon.' });
    } finally { setApplying(false); }
  };

  const handleApply = async () => {
    if (!user) { window.location.href = '/login'; return; }
    // Profile completeness check
    if (!profile?.contact) { setShowProfileWarning(true); return; }
    await doApply();
  };

  const handleWhatsAppApply = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setWaLoading(true);
    try {
      const posterProfile = await getPb().collection('profiles').getFirstListItem(`user="${job.posted_by}"`);
      if (posterProfile?.contact) {
        const msg = `Hi! I saw your job post "${job.title}" (${job.pay}) on UrbanServe and I'm interested. Can we discuss?`;
        window.open(`https://wa.me/91${posterProfile.contact}?text=${encodeURIComponent(msg)}`, '_blank');
      } else {
        alert("The poster hasn't added a WhatsApp number yet. Please use the Apply button instead.");
      }
    } catch { alert('Could not fetch contact details. Try the Apply button instead.'); }
    finally { setWaLoading(false); }
  };

  const handleShare = async () => {
    const text = `💼 ${job.title} — ${job.pay} | ${job.location}\n\nApply on UrbanServe 👇`;
    const url = window.location.origin + '/gigs';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: `${job.title} — UrbanServe`, text, url }).catch(() => { });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareLabel('✅ Copied!');
      setTimeout(() => setShareLabel(null), 2000);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await getPb().collection('jobs').update(job.id, { status: newStatus });
      setJobStatus(newStatus);
      onStatusChange?.(job.id, newStatus);
    } catch { alert('Failed to update status.'); }
  };

  const statusBadge = getStatusBadge();

  return (
    <article
      aria-label={job.title}
      className={`hover-lift flex flex-col gap-4 rounded-2xl border border-slate-200 bg-[#f7fcf8] p-4 sm:p-5 ${jobStatus === 'closed' ? 'opacity-75' : ''
        }`}
    >
      {showProfileWarning && (
        <ProfileWarningModal
          onClose={() => setShowProfileWarning(false)}
          onContinue={async () => { setShowProfileWarning(false); await doApply(); }}
        />
      )}

      {toast && (
        <div className="slide-down fixed bottom-4 right-4 z-[800] flex max-w-xs items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs text-white">✓</div>
          <div>
            <div className="text-sm font-bold text-slate-900">{toast.title}</div>
            <div className="mt-0.5 text-[13px] text-slate-500">{toast.body}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between gap-2">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-green-50 text-2xl">
            {cat?.icon || '💼'}
          </div>
          <div className="min-w-0">
            <h2 className="mb-0.5 text-base font-bold text-slate-900">{job.title}</h2>
            <div className="text-[13px] text-slate-400">
              {job.company ? `${job.company} · ` : ''}{timeAgo}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-lg font-extrabold text-green-700">{job.pay}</div>
          <button
            onClick={() => onBookmark?.(job.id)}
            title={isBookmarked ? 'Remove bookmark' : 'Save job'}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 cursor-pointer"
          >
            {isBookmarked ? '🔖' : '🔗'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {job.urgent && (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-500">🔥 Urgent</span>
        )}
        <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">📍 {job.location}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">{job.type}</span>
        {cat && (
          <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600">
            {cat.icon} {cat.label}
          </span>
        )}
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge.className}`}>{statusBadge.label}</span>
      </div>

      {/* Skills */}
      {job.skills && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.split(',').filter(Boolean).map((s: string) => (
            <span key={s} className="rounded-full bg-slate-100/70 px-2.5 py-1 text-xs text-slate-500">
              {s.trim()}
            </span>
          ))}
        </div>
      )}

      {/* External apply link */}
      {job.link && (
        <a href={job.link} target="_blank" rel="noreferrer" className="no-underline">
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-green-200 bg-green-50/60 px-3.5 py-2.5 text-[13px] font-semibold text-green-700">
            <span>🔗</span>
            <span className="flex-1 truncate">Apply via employer link</span>
            <span className="text-[11px] opacity-70">↗</span>
          </div>
        </a>
      )}

      {isMyJob ? (
        <>
          <ApplicantsDrawer job={job} />

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
            {jobStatus !== 'filled' && (
              <button
                onClick={() => handleUpdateStatus('filled')}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 font-inherit cursor-pointer"
              >
                ✓ Mark hired
              </button>
            )}
            {jobStatus !== 'closed' && (
              <button
                onClick={() => handleUpdateStatus('closed')}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 font-inherit cursor-pointer"
              >
                Close job
              </button>
            )}
            {(jobStatus === 'filled' || jobStatus === 'closed') && (
              <button
                onClick={() => handleUpdateStatus('open')}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-800 font-inherit cursor-pointer"
              >
                🔄 Reopen
              </button>
            )}
            <button onClick={() => onEdit?.(job)} className="flex items-center gap-1 px-1 text-[13px] font-semibold text-slate-700 font-inherit cursor-pointer">
              ✏️ Edit
            </button>
            <button
              onClick={async () => {
                if (!confirm('Delete this job?')) return;
                setDeleting(true);
                try { await getPb().collection('jobs').delete(job.id); onDelete?.(job.id); }
                catch { alert('Failed to delete job'); }
                finally { setDeleting(false); }
              }}
              disabled={deleting}
              className={`flex items-center gap-1 px-1 text-[13px] font-semibold text-red-600 font-inherit ${deleting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              🗑️ {deleting ? 'Deleting…' : 'Delete'}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold text-slate-700 font-inherit cursor-pointer">
              {shareLabel ?? '📤 Share'}
            </button>
          </div>
        </>
      ) : (
        <>
          {applied ? (
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
              <div className="flex-1 rounded-full bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                ✅ Application sent — the employer will contact you.
              </div>
              <button onClick={handleShare} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 cursor-pointer">📤</button>
            </div>
          ) : jobStatus === 'filled' || jobStatus === 'closed' ? (
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
              <div className="flex-1 rounded-full bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-400">
                {jobStatus === 'filled' ? 'This position has been filled' : 'This job is closed'}
              </div>
              <button onClick={handleShare} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 cursor-pointer">📤</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3.5">
              <button
                onClick={handleApply}
                disabled={applying || checking}
                className={`flex-1 rounded-full border-none py-3 text-[15px] font-bold font-inherit ${applying || checking ? 'cursor-not-allowed' : 'cursor-pointer'
                  } ${checking ? 'bg-slate-100 text-slate-400' : 'bg-green-600 text-white'}`}
              >
                {checking ? 'Loading…' : applying ? 'Applying…' : 'Apply now'}
              </button>
              <button
                onClick={handleWhatsAppApply}
                disabled={waLoading}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-800 font-inherit cursor-pointer"
              >
                📞 {waLoading ? '…' : 'Contact'}
              </button>
              <button onClick={handleShare} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 cursor-pointer">📤</button>
            </div>
          )}

          {applicantCount !== null && applicantCount > 0 && (
            <div className="-mt-2 text-xs text-slate-400">
              {applicantCount} {applicantCount === 1 ? 'person' : 'people'} already applied
            </div>
          )}
        </>
      )}
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GigsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [posting, setPosting] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [form, setForm] = useState({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false, link: '' });

  // Bookmarks — persisted in localStorage
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try { return new Set(JSON.parse(localStorage.getItem('us_bookmarks') || '[]') as string[]); }
    catch { return new Set(); }
  });

  const toggleBookmark = (jobId: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
      if (typeof localStorage !== 'undefined') localStorage.setItem('us_bookmarks', JSON.stringify(Array.from(next)));
      return next;
    });
  };

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
    .filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()))
    .filter(j => !showBookmarksOnly || bookmarks.has(j.id));

  const resetForm = () => setForm({ title: '', company: '', type: 'Daily Wage', pay: '', location: '', skills: '', category: '', urgent: false, link: '' });

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!form.title || !form.pay || !form.location) { alert('Please fill: Job title, Pay, and Location'); return; }
    setPosting(true);
    try {
      if (editingJob) {
        await getPb().collection('jobs').update(editingJob.id, { ...form });
        setEditingJob(null);
      } else {
        await getPb().collection('jobs').create({ ...form, posted_by: user.id });
      }
      setShowPost(false);
      resetForm();
    } catch (e) { console.error(e); alert('Failed'); }
    finally { setPosting(false); }
  };

  const handleDeleteJob = (jobId: string) => setJobs(jobs.filter(j => j.id !== jobId));

  const handleEditJob = (job: any) => {
    setForm({ title: job.title, company: job.company || '', type: job.type, pay: job.pay, location: job.location, skills: job.skills || '', category: job.category || '', urgent: job.urgent || false, link: job.link || '' });
    setEditingJob(job);
    setShowPost(true);
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 font-inherit outline-none box-border';

  return (
    <>
      <div className="min-h-screen bg-[#f7faf5] font-outfit">
        {/* Hero */}
        <header className="relative bg-gradient-to-br from-green-900 to-green-600 px-4 pb-24 pt-8 sm:px-8 sm:pt-12">
          <div className="mx-auto max-w-5xl">
            <span className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white">
              {jobs.length} gigs hiring right now
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-5xl">Local work, matched fast.</h1>
            <p className="mt-3 max-w-xl text-[15px] text-white/80">
              Daily wage, hourly and contract gigs near you — apply in one tap, or post a job and hear from workers today.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => user ? setShowPost(true) : router.push('/login')}
                className="cursor-pointer rounded-full border-none bg-white px-5 py-2.5 text-sm font-bold text-green-700 font-inherit"
              >
                + Post a job
              </button>
              <button
                onClick={() => setShowBookmarksOnly(true)}
                className="cursor-pointer rounded-full border border-white/40 bg-transparent px-5 py-2.5 text-sm font-bold text-white font-inherit"
              >
                🔖 Saved ({bookmarks.size})
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-8" style={{ marginTop: -64 }}>
          {/* Search */}
          <div className="rounded-2xl bg-white p-2 shadow-lg">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <label htmlFor="job-search" className="hidden">Search jobs</label>
              <input
                id="job-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search jobs, skills or city"
                className="w-full rounded-xl border-none bg-transparent py-3.5 pl-11 pr-4 text-[15px] text-slate-900 outline-none font-inherit"
              />
            </div>
          </div>

          {/* All jobs / Saved toggle + results count */}
          <div className="mb-3 mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBookmarksOnly(false)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold font-inherit cursor-pointer ${!showBookmarksOnly ? 'border-green-600 bg-green-600 text-white' : 'border-slate-200 bg-white text-slate-600'
                  }`}
              >
                🌐 All jobs
              </button>
              <button
                onClick={() => setShowBookmarksOnly(true)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold font-inherit cursor-pointer ${showBookmarksOnly ? 'border-green-600 bg-green-600 text-white' : 'border-slate-200 bg-white text-slate-600'
                  }`}
              >
                🔖 Saved
              </button>
            </div>
            <div className="text-sm text-slate-400">{filtered.length} results</div>
          </div>

          {/* Category filter */}
          <div role="tablist" className="pill-scroll mb-2 flex gap-2 overflow-x-auto pb-1">
            <Pill active={catFilter === 'all'} onClick={() => setCatFilter('all')}>🌐 All categories</Pill>
            {CATEGORIES.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.icon} {c.label}</Pill>)}
          </div>
          <div className="pill-scroll mb-7 flex gap-2 overflow-x-auto pb-4">
            <Pill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>All types</Pill>
            {JOB_TYPES.map(tt => <Pill key={tt} active={typeFilter === tt} onClick={() => setTypeFilter(tt)}>{tt}</Pill>)}
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="spinner" />
              <p className="text-[15px] text-slate-400">Loading jobs…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mb-3 text-5xl">{showBookmarksOnly ? '🔖' : '🔍'}</div>
              <p className="text-lg font-bold text-slate-700">
                {showBookmarksOnly ? 'No saved jobs' : 'No jobs found'}
              </p>
              <p className="mt-1.5 text-sm text-slate-400">
                {showBookmarksOnly ? 'Tap the 🔗 icon on any job to save it' : jobs.length === 0 ? 'Be the first to post a job!' : 'Try different filters'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,340px),1fr))' }}>
              {filtered.map(job => (
                <JobCard key={job.id} job={job} user={user} profile={profile} authLoading={authLoading}
                  onDelete={handleDeleteJob} onEdit={handleEditJob}
                  isBookmarked={bookmarks.has(job.id)} onBookmark={toggleBookmark}
                  onStatusChange={(id, status) => setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Job Modal */}
        {showPost && (
          <div
            role="dialog"
            aria-modal="true"
            className="modal-backdrop fixed inset-0 z-[500] flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) { setShowPost(false); setEditingJob(null); resetForm(); } }}
          >
            <div className="slide-up post-modal max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{editingJob ? 'Edit job' : 'Post a job'}</h2>
                  <p className="mt-0.5 text-[13px] text-slate-400">{editingJob ? 'Update the details and save your changes.' : 'Fill details to find workers fast'}</p>
                </div>
                <button
                  onClick={() => { setShowPost(false); setEditingJob(null); resetForm(); }}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border-none bg-slate-100 text-lg text-slate-500"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {([
                  ['title', 'Job title *', 'e.g. Need Plumber at Home'],
                  ['pay', 'Pay *', 'e.g. ₹500/day'],
                  ['location', 'Location *', 'City or Area'],
                  ['company', 'Company / shop (optional)', 'Your business name'],
                ] as [string, string, string][]).map(([field, label, ph]) => (
                  <div key={field}>
                    <label htmlFor={`post-${field}`} className="mb-1.5 block text-[13px] font-bold text-slate-600">{label}</label>
                    <input id={`post-${field}`} placeholder={ph} className={inputClass} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Job type</label>
                    <select className={inputClass} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {JOB_TYPES.map(tt => <option key={tt}>{tt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Category</label>
                    <select className={inputClass} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      <option value="">— Select —</option>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Required skills (optional)</label>
                  <input placeholder="e.g. Plumbing, Wiring" className={inputClass} value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Apply link (optional)</label>
                  <input placeholder="e.g. https://forms.google.com/... or WhatsApp link" className={inputClass} value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
                  <p className="ml-0.5 mt-1 text-[11px] text-slate-400">Add a link where applicants can apply directly</p>
                </div>

                <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3">
                  <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} className="h-[18px] w-[18px] accent-red-600" />
                  <span className="text-sm font-bold text-red-600">🔥 Mark as urgent</span>
                </label>
              </div>

              <div className="mt-6 flex gap-2.5">
                <button
                  onClick={() => { setShowPost(false); setEditingJob(null); resetForm(); }}
                  className="flex-1 cursor-pointer rounded-full border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-600 font-inherit"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting}
                  className={`flex-[2] rounded-full border-none py-3.5 text-[15px] font-bold font-inherit ${posting ? 'cursor-not-allowed bg-green-100 text-green-700' : 'cursor-pointer bg-green-600 text-white'
                    }`}
                >
                  {posting ? 'Saving…' : editingJob ? 'Update job' : 'Post job now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .filter-pill { font-size: 13px; padding: 8px 15px; }
        @media (max-width: 480px) { .filter-pill { font-size: 12px; padding: 7px 12px; } }
        @media (min-width: 540px) { .modal-backdrop { align-items: center !important; padding: 16px !important; } .post-modal { border-radius: 20px !important; } }
        .spinner { width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #16a34a; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .slide-down { animation: slideDown 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.25s ease-out; }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .hover-lift { transition: box-shadow 0.15s, transform 0.15s; }
        .hover-lift:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.06); transform: translateY(-1px); }
      `}</style>
    </>
  );
}