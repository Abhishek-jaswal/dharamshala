'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';

const JOB_TYPES = [
  'Daily Wage',
  'Hourly',
  'Part-Time',
  'Contract',
  'Full-Time',
  'Team Hire',
];

const colors = {
  green: '#16a34a',
  greenDark: '#166534',
  greenDeep: '#14532d',
  greenLight: '#f0fdf4',
  greenSoft: '#dcfce7',
  white: '#ffffff',
  slate900: '#0f172a',
  slate800: '#1e293b',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748b',
  slate400: '#94a3b8',
  slate300: '#cbd5e1',
  slate200: '#e2e8f0',
  slate100: '#f1f5f9',
  red: '#dc2626',
  redLight: '#fef2f2',
  amber: '#d97706',
  amberLight: '#fffbeb',
};

const Pill = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    style={{
      whiteSpace: 'nowrap',
      borderRadius: '9999px',
      border: `1px solid ${active ? colors.green : colors.slate200}`,
      backgroundColor: active ? colors.green : colors.white,
      color: active ? colors.white : colors.slate600,
      fontWeight: 600,
      fontFamily: 'inherit',
      fontSize: '13px',
      padding: '8px 15px',
      transition: 'all 0.15s ease',
      cursor: 'pointer',
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

// ── Profile Incomplete Warning Modal ─────────────────────────────────────────

function ProfileWarningModal({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.60)',
        padding: '16px',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          borderRadius: '18px',
          backgroundColor: colors.white,
          padding: '28px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.20)',
        }}
      >
        <div
          style={{
            marginBottom: '16px',
            textAlign: 'center',
            fontSize: '48px',
          }}
        >
          ⚠️
        </div>

        <h3
          style={{
            margin: '0 0 8px',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 800,
            color: colors.slate900,
          }}
        >
          Profile Incomplete
        </h3>

        <p
          style={{
            margin: '0 0 20px',
            textAlign: 'center',
            fontSize: '14px',
            lineHeight: 1.6,
            color: colors.slate500,
          }}
        >
          You haven't added a <strong>phone number</strong> to your profile.
          The employer won't be able to contact you!
        </p>

        <div
          style={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <a
            href="/dashboard"
            style={{
              flex: 1,
              textDecoration: 'none',
            }}
          >
            <button
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '9999px',
                backgroundColor: colors.green,
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: colors.white,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              📱 Add Phone
            </button>
          </a>

          <button
            onClick={onContinue}
            style={{
              flex: 1,
              borderRadius: '9999px',
              border: `1px solid ${colors.slate200}`,
              backgroundColor: colors.white,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: colors.slate500,
              fontFamily: 'inherit',
              cursor: 'pointer',
            }}
          >
            Apply Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Full profile modal shown when poster clicks applicant name ───────────────

function ProfileModal({
  person,
  onClose,
}: {
  person: any;
  onClose: () => void;
}) {
  const p = person.profile;

  const name =
    p?.name ||
    person.expand?.applicant?.name ||
    'Unknown';

  const phone = p?.contact;
  const skills = p?.skills;
  const location = p?.location;
  const role = p?.role;

  const dob = p?.dob
    ? new Date(p.dob).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  const interests = p?.interests;

  const initials = name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const applied = new Date(person.created).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.60)',
        padding: '16px',
        backdropFilter: 'blur(5px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '448px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          backgroundColor: colors.white,
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '24px 24px 0 0',
            background:
              'linear-gradient(135deg, #166534 0%, #16a34a 100%)',
            padding: '32px 28px 28px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.20)',
              color: colors.white,
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.40)',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: colors.white,
                fontSize: '24px',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>

            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.white,
                }}
              >
                {name}
              </div>

              {role && (
                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '14px',
                    textTransform: 'capitalize',
                    color: 'rgba(255,255,255,0.75)',
                  }}
                >
                  {role}
                </div>
              )}

              {location && (
                <div
                  style={{
                    marginTop: '2px',
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.65)',
                  }}
                >
                  📍 {location}
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '24px 28px',
          }}
        >
          <div
            style={{
              borderRadius: '9999px',
              backgroundColor: colors.greenLight,
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#15803d',
            }}
          >
            ✅ Applied on {applied}
          </div>

          <div>
            <div
              style={{
                marginBottom: '10px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: colors.slate400,
              }}
            >
              CONTACT
            </div>

            {phone ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <a
                    href={`tel:${phone}`}
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                    }}
                  >
                    <button
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: 'none',
                        borderRadius: '9999px',
                        backgroundColor: colors.green,
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: colors.white,
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      📞 Call Now
                    </button>
                  </a>

                  <a
                    href={`https://wa.me/91${phone}?text=${encodeURIComponent(
                      `Hi ${name}, I saw your application on UrbanServe. Are you still available?`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                    }}
                  >
                    <button
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        border: `1px solid ${colors.slate200}`,
                        borderRadius: '9999px',
                        backgroundColor: colors.white,
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#15803d',
                        fontFamily: 'inherit',
                        cursor: 'pointer',
                      }}
                    >
                      💬 WhatsApp
                    </button>
                  </a>
                </div>

                <div
                  style={{
                    marginTop: '8px',
                    borderRadius: '8px',
                    backgroundColor: colors.slate100,
                    padding: '10px 14px',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: colors.slate500,
                  }}
                >
                  📱 {phone}
                </div>
              </>
            ) : (
              <div
                style={{
                  borderRadius: '12px',
                  backgroundColor: colors.redLight,
                  padding: '12px 14px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#dc2626',
                }}
              >
                ⚠️ This person has not added a phone number yet.
              </div>
            )}
          </div>

          <div>
            <div
              style={{
                marginBottom: '10px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                color: colors.slate400,
              }}
            >
              PROFILE DETAILS
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '16px',
                backgroundColor: colors.slate100,
              }}
            >
              {(
                [
                  ['📍', 'Location', location],
                  ['🎂', 'Date of Birth', dob],
                  ['👤', 'Role', role],
                ] as [string, string, string | null][]
              )
                .filter(([, , v]) => v)
                .map(([icon, label, val], index, arr) => (
                  <div
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderBottom:
                        index !== arr.length - 1
                          ? `1px solid ${colors.slate200}`
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '18px',
                      }}
                    >
                      {icon}
                    </span>

                    <span
                      style={{
                        minWidth: '90px',
                        fontSize: '14px',
                        color: colors.slate400,
                      }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.slate900,
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {skills && (
            <div>
              <div
                style={{
                  marginBottom: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: colors.slate400,
                }}
              >
                SKILLS
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {skills
                  .split(', ')
                  .filter(Boolean)
                  .map((s: string) => (
                    <span
                      key={s}
                      style={{
                        borderRadius: '9999px',
                        backgroundColor: colors.greenLight,
                        padding: '6px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#15803d',
                      }}
                    >
                      {s}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {interests && (
            <div>
              <div
                style={{
                  marginBottom: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  color: colors.slate400,
                }}
              >
                INTERESTS
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {interests
                  .split(', ')
                  .filter(Boolean)
                  .map((s: string) => (
                    <span
                      key={s}
                      style={{
                        borderRadius: '9999px',
                        backgroundColor: colors.amberLight,
                        padding: '6px 14px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#b45309',
                      }}
                    >
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
    getPb()
      .collection('applications')
      .getList(1, 1, {
        filter: `job="${job.id}"`,
      })
      .then((r) => setCount(r.totalItems))
      .catch(() => setCount(0));
  }, [job.id]);

  const load = async () => {
    setLoading(true);

    try {
      const apps = await getPb()
        .collection('applications')
        .getList(1, 100, {
          filter: `job="${job.id}"`,
          sort: '-created',
        });

      const rich = await Promise.all(
        apps.items.map(async (app: any) => {
          try {
            const profile = await getPb()
              .collection('profiles')
              .getFirstListItem(`user="${app.applicant}"`);

            return {
              ...app,
              profile,
            };
          } catch {
            return {
              ...app,
              profile: null,
            };
          }
        })
      );

      setApplicants(rich);
    } catch {
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    if (!open) load();
    setOpen((o) => !o);
  };

  return (
    <div>
      <button
        onClick={toggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: 'none',
          borderRadius: '12px',
          backgroundColor: colors.greenLight,
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 700,
          color: colors.slate800,
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        <span>👥</span>

        <span
          style={{
            flex: 1,
            textAlign: 'left',
          }}
        >
          {count !== null
            ? `${count} applicant${count === 1 ? '' : 's'}`
            : 'Applicants'}
        </span>

        <span
          style={{
            fontSize: '12px',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          {loading ? (
            <div
              style={{
                padding: '28px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  margin: '0 auto 12px',
                  border: '3px solid #e2e8f0',
                  borderTopColor: '#16a34a',
                  borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite',
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: colors.slate400,
                }}
              >
                Loading applicants…
              </p>
            </div>
          ) : applicants.length === 0 ? (
            <div
              style={{
                border: `1px dashed ${colors.slate200}`,
                borderRadius: '12px',
                backgroundColor: colors.slate100,
                padding: '28px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  marginBottom: '10px',
                  fontSize: '36px',
                }}
              >
                ⏳
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.slate500,
                }}
              >
                No applications yet
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '13px',
                  color: colors.slate400,
                }}
              >
                Share your job to get applicants!
              </div>
            </div>
          ) : (
            applicants.map((app: any, i: number) => {
              const name = app.profile?.name || 'Unknown';
              const skills = app.profile?.skills;
              const location = app.profile?.location;
              const role = app.profile?.role;

              const initials = name
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              const subtitle =
                [role, location].filter(Boolean).join(' · ') ||
                skills ||
                '';

              return (
                <button
                  key={i}
                  onClick={() => setViewProfile(app)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `1px solid ${colors.slate200}`,
                    borderRadius: '12px',
                    backgroundColor: colors.white,
                    padding: '14px',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      backgroundColor: colors.greenLight,
                      color: '#15803d',
                      fontSize: '14px',
                      fontWeight: 700,
                    }}
                  >
                    {initials}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.slate900,
                      }}
                    >
                      {name}
                    </div>

                    {subtitle && (
                      <div
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: '12px',
                          color: colors.slate400,
                        }}
                      >
                        {subtitle}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#15803d',
                    }}
                  >
                    View →
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}

      {viewProfile && (
        <ProfileModal
          person={viewProfile}
          onClose={() => setViewProfile(null)}
        />
      )}
    </div>
  );
}

// ── Single job card ───────────────────────────────────────────────────────────

function JobCard({
  job,
  user,
  profile,
  authLoading,
  onDelete,
  onEdit,
  isBookmarked,
  onBookmark,
  onStatusChange,
}: {
  job: any;
  user: any;
  profile: any;
  authLoading: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (job: any) => void;
  isBookmarked?: boolean;
  onBookmark?: (id: string) => void;
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
  const [toast, setToast] = useState<{
    title: string;
    body: string;
  } | null>(null);

  const isMyJob = user && job.posted_by === user.id;
  const cat = CATEGORIES.find((c) => c.id === job.category);

  const getStatusBadge = () => {
    if (jobStatus === 'filled') {
      return {
        label: 'Hired',
        className: {
          backgroundColor: '#dcfce7',
          color: '#15803d',
        },
      };
    }

    if (jobStatus === 'closed') {
      return {
        label: 'Closed',
        className: {
          backgroundColor: '#fee2e2',
          color: '#dc2626',
        },
      };
    }

    if (applicantCount && applicantCount > 0) {
      return {
        label: 'Under review',
        className: {
          backgroundColor: '#fef3c7',
          color: '#b45309',
        },
      };
    }

    return {
      label: 'Open',
      className: {
        backgroundColor: colors.slate100,
        color: colors.slate500,
      },
    };
  };

  const timeAgo = (() => {
    const d =
      (Date.now() - new Date(job.created).getTime()) / 1000;

    if (d < 3600) {
      return `${Math.floor(d / 60)}m ago`;
    }

    if (d < 86400) {
      return `${Math.floor(d / 3600)}h ago`;
    }

    return `${Math.floor(d / 86400)}d ago`;
  })();

  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(() => setToast(null), 3200);

    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || isMyJob) {
      setChecking(false);
      return;
    }

    const cacheKey = `applied_${user.id}_${job.id}`;

    if (
      typeof localStorage !== 'undefined' &&
      localStorage.getItem(cacheKey) === '1'
    ) {
      setApplied(true);
      setChecking(false);
      return;
    }

    getPb()
      .collection('applications')
      .getList(1, 1, {
        filter: `job="${job.id}" && applicant="${user.id}"`,
      })
      .then((res) => {
        if (res.totalItems > 0) {
          setApplied(true);

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(cacheKey, '1');
          }
        }
      })
      .catch(() => { })
      .finally(() => setChecking(false));
  }, [user, job.id, isMyJob, authLoading]);

  useEffect(() => {
    if (isMyJob) return;

    getPb()
      .collection('applications')
      .getList(1, 1, {
        filter: `job="${job.id}"`,
      })
      .then((r) => setApplicantCount(r.totalItems))
      .catch(() => setApplicantCount(0));
  }, [job.id, isMyJob]);

  const doApply = async () => {
    setApplying(true);

    try {
      await getPb()
        .collection('applications')
        .create({
          job: job.id,
          applicant: user.id,
          status: 'pending',
        });

      setApplied(true);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `applied_${user.id}_${job.id}`,
          '1'
        );
      }

      if (
        typeof navigator !== 'undefined' &&
        navigator.vibrate
      ) {
        navigator.vibrate(80);
      }

      setToast({
        title: 'Application sent',
        body: 'The employer will reach out to you soon.',
      });
    } catch {
      setApplied(true);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          `applied_${user.id}_${job.id}`,
          '1'
        );
      }

      setToast({
        title: 'Application sent',
        body: 'The employer will reach out to you soon.',
      });
    } finally {
      setApplying(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (!profile?.contact) {
      setShowProfileWarning(true);
      return;
    }

    await doApply();
  };

  const handleWhatsAppApply = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setWaLoading(true);

    try {
      const posterProfile = await getPb()
        .collection('profiles')
        .getFirstListItem(`user="${job.posted_by}"`);

      if (posterProfile?.contact) {
        const msg = `Hi! I saw your job post "${job.title}" (${job.pay}) on UrbanServe and I'm interested. Can we discuss?`;

        window.open(
          `https://wa.me/91${posterProfile.contact}?text=${encodeURIComponent(
            msg
          )}`,
          '_blank'
        );
      } else {
        alert(
          "The poster hasn't added a WhatsApp number yet. Please use the Apply button instead."
        );
      }
    } catch {
      alert(
        'Could not fetch contact details. Try the Apply button instead.'
      );
    } finally {
      setWaLoading(false);
    }
  };

  const handleShare = async () => {
    const text = `💼 ${job.title} — ${job.pay} | ${job.location}\n\nApply on UrbanServe 👇`;

    const url =
      window.location.origin + '/gigs';

    if (
      typeof navigator !== 'undefined' &&
      navigator.share
    ) {
      navigator
        .share({
          title: `${job.title} — UrbanServe`,
          text,
          url,
        })
        .catch(() => { });
    } else if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard
    ) {
      await navigator.clipboard.writeText(
        `${text}\n${url}`
      );

      setShareLabel('✅ Copied!');

      setTimeout(
        () => setShareLabel(null),
        2000
      );
    }
  };

  const handleUpdateStatus = async (
    newStatus: string
  ) => {
    try {
      await getPb()
        .collection('jobs')
        .update(job.id, {
          status: newStatus,
        });

      setJobStatus(newStatus);

      onStatusChange?.(
        job.id,
        newStatus
      );
    } catch {
      alert('Failed to update status.');
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <article
      aria-label={job.title}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderRadius: '16px',
        border: `1px solid ${colors.slate200}`,
        backgroundColor: '#f7fcf8',
        padding: '16px',
        opacity: jobStatus === 'closed' ? 0.75 : 1,
        transition:
          'box-shadow 0.15s ease, transform 0.15s ease',
        boxSizing: 'border-box',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          '0 6px 20px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform =
          'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform =
          'translateY(0)';
      }}
    >
      {showProfileWarning && (
        <ProfileWarningModal
          onClose={() =>
            setShowProfileWarning(false)
          }
          onContinue={async () => {
            setShowProfileWarning(false);
            await doApply();
          }}
        />
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            right: '16px',
            bottom: '16px',
            zIndex: 800,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            width: 'fit-content',
            maxWidth: '320px',
            borderRadius: '16px',
            border: `1px solid ${colors.slate200}`,
            backgroundColor: colors.white,
            padding: '16px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: colors.slate900,
              color: colors.white,
              fontSize: '12px',
            }}
          >
            ✓
          </div>

          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: colors.slate900,
              }}
            >
              {toast.title}
            </div>

            <div
              style={{
                marginTop: '2px',
                fontSize: '13px',
                color: colors.slate500,
              }}
            >
              {toast.body}
            </div>
          </div>
        </div>
      )}

      {/* Header */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            minWidth: 0,
            flex: 1,
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              backgroundColor: colors.greenLight,
              fontSize: '24px',
            }}
          >
            {cat?.icon || '💼'}
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <h2
              style={{
                margin: '0 0 2px',
                fontSize: '16px',
                fontWeight: 700,
                color: colors.slate900,
              }}
            >
              {job.title}
            </h2>

            <div
              style={{
                fontSize: '13px',
                color: colors.slate400,
              }}
            >
              {job.company
                ? `${job.company} · `
                : ''}
              {timeAgo}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#15803d',
            }}
          >
            {job.pay}
          </div>

          <button
            onClick={() =>
              onBookmark?.(job.id)
            }
            title={
              isBookmarked
                ? 'Remove bookmark'
                : 'Save job'
            }
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              background: 'transparent',
              color: colors.slate400,
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {isBookmarked ? '🔖' : '🔗'}
          </button>
        </div>
      </div>

      {/* Tags */}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {job.urgent && (
          <span
            style={{
              borderRadius: '9999px',
              backgroundColor: colors.redLight,
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ef4444',
            }}
          >
            🔥 Urgent
          </span>
        )}

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: `1px solid ${colors.slate200}`,
            borderRadius: '9999px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 500,
            color: colors.slate600,
          }}
        >
          📍 {job.location}
        </span>

        <span
          style={{
            borderRadius: '9999px',
            backgroundColor: colors.slate100,
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 700,
            color: colors.slate800,
          }}
        >
          {job.type}
        </span>

        {cat && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: `1px solid ${colors.slate200}`,
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              color: colors.slate600,
            }}
          >
            {cat.icon} {cat.label}
          </span>
        )}

        <span
          style={{
            borderRadius: '9999px',
            padding: '4px 10px',
            fontSize: '12px',
            fontWeight: 600,
            ...statusBadge.className,
          }}
        >
          {statusBadge.label}
        </span>
      </div>

      {/* Skills */}

      {job.skills && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}
        >
          {job.skills
            .split(',')
            .filter(Boolean)
            .map((s: string) => (
              <span
                key={s}
                style={{
                  borderRadius: '9999px',
                  backgroundColor:
                    'rgba(241,245,249,0.70)',
                  padding: '4px 10px',
                  fontSize: '12px',
                  color: colors.slate500,
                }}
              >
                {s.trim()}
              </span>
            ))}
        </div>
      )}

      {/* External apply link */}

      {job.link && (
        <a
          href={job.link}
          target="_blank"
          rel="noreferrer"
          style={{
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px dashed #bbf7d0',
              borderRadius: '12px',
              backgroundColor:
                'rgba(240,253,244,0.60)',
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#15803d',
            }}
          >
            <span>🔗</span>

            <span
              style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Apply via employer link
            </span>

            <span
              style={{
                fontSize: '11px',
                opacity: 0.7,
              }}
            >
              ↗
            </span>
          </div>
        </a>
      )}

      {isMyJob ? (
        <>
          <ApplicantsDrawer job={job} />

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '8px',
              borderTop: `1px solid ${colors.slate100}`,
              paddingTop: '14px',
            }}
          >
            {jobStatus !== 'filled' && (
              <button
                onClick={() =>
                  handleUpdateStatus('filled')
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: `1px solid ${colors.slate200}`,
                  borderRadius: '9999px',
                  backgroundColor: colors.white,
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.slate800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                ✓ Mark hired
              </button>
            )}

            {jobStatus !== 'closed' && (
              <button
                onClick={() =>
                  handleUpdateStatus('closed')
                }
                style={{
                  border: `1px solid ${colors.slate200}`,
                  borderRadius: '9999px',
                  backgroundColor: colors.white,
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.slate800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Close job
              </button>
            )}

            {(jobStatus === 'filled' ||
              jobStatus === 'closed') && (
                <button
                  onClick={() =>
                    handleUpdateStatus('open')
                  }
                  style={{
                    border: `1px solid ${colors.slate200}`,
                    borderRadius: '9999px',
                    backgroundColor: colors.white,
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.slate800,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Reopen
                </button>
              )}

            <button
              onClick={() => onEdit?.(job)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                fontSize: '13px',
                fontWeight: 600,
                color: colors.slate700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              ✏️ Edit
            </button>

            <button
              onClick={async () => {
                if (!confirm('Delete this job?')) return;

                setDeleting(true);

                try {
                  await getPb()
                    .collection('jobs')
                    .delete(job.id);

                  onDelete?.(job.id);
                } catch {
                  alert('Failed to delete job');
                } finally {
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                background: 'transparent',
                padding: '4px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#dc2626',
                fontFamily: 'inherit',
                cursor: deleting
                  ? 'not-allowed'
                  : 'pointer',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              🗑️ {deleting ? 'Deleting…' : 'Delete'}
            </button>

            <button
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                borderRadius: '9999px',
                background: 'transparent',
                padding: '4px 8px',
                fontSize: '13px',
                fontWeight: 600,
                color: colors.slate700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              {shareLabel ?? '📤 Share'}
            </button>
          </div>
        </>
      ) : (
        <>
          {applied ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderTop: `1px solid ${colors.slate100}`,
                paddingTop: '14px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  borderRadius: '9999px',
                  backgroundColor: colors.greenLight,
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#15803d',
                }}
              >
                ✅ Application sent — the employer will contact you.
              </div>

              <button
                onClick={handleShare}
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'transparent',
                  color: colors.slate500,
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                📤
              </button>
            </div>
          ) : jobStatus === 'filled' ||
            jobStatus === 'closed' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderTop: `1px solid ${colors.slate100}`,
                paddingTop: '14px',
              }}
            >
              <div
                style={{
                  flex: 1,
                  borderRadius: '9999px',
                  backgroundColor: colors.slate100,
                  padding: '12px 16px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.slate400,
                }}
              >
                {jobStatus === 'filled'
                  ? 'This position has been filled'
                  : 'This job is closed'}
              </div>

              <button
                onClick={handleShare}
                style={{
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  border: 'none',
                  borderRadius: '50%',
                  background: 'transparent',
                  color: colors.slate500,
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                📤
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderTop: `1px solid ${colors.slate100}`,
                paddingTop: '14px',
              }}
            >
              <button
                onClick={handleApply}
                disabled={applying || checking}
                style={{
                  flex: 1,
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '12px 0',
                  fontSize: '15px',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  cursor:
                    applying || checking
                      ? 'not-allowed'
                      : 'pointer',
                  backgroundColor: checking
                    ? colors.slate100
                    : colors.green,
                  color: checking
                    ? colors.slate400
                    : colors.white,
                }}
              >
                {checking
                  ? 'Loading…'
                  : applying
                    ? 'Applying…'
                    : 'Apply now'}
              </button>

              <button
                onClick={handleWhatsAppApply}
                disabled={waLoading}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: `1px solid ${colors.slate200}`,
                  borderRadius: '9999px',
                  backgroundColor: colors.white,
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: colors.slate800,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                📞 {waLoading ? '…' : 'Contact'}
              </button>

              <button
                onClick={handleShare}
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '50%',
                  background: 'transparent',
                  color: colors.slate500,
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                📤
              </button>
            </div>
          )}

          {applicantCount !== null &&
            applicantCount > 0 && (
              <div
                style={{
                  marginTop: '-8px',
                  fontSize: '12px',
                  color: colors.slate400,
                }}
              >
                {applicantCount}{' '}
                {applicantCount === 1
                  ? 'person'
                  : 'people'}{' '}
                already applied
              </div>
            )}
        </>
      )}
    </article>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function GigsPage() {
  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] =
    useState(true);

  const [catFilter, setCatFilter] =
    useState('all');

  const [typeFilter, setTypeFilter] =
    useState('all');

  const [search, setSearch] =
    useState('');

  const [showPost, setShowPost] =
    useState(false);

  const [posting, setPosting] =
    useState(false);

  const [editingJob, setEditingJob] =
    useState<any | null>(null);

  const [
    showBookmarksOnly,
    setShowBookmarksOnly,
  ] = useState(false);

  const [form, setForm] = useState({
    title: '',
    company: '',
    type: 'Daily Wage',
    pay: '',
    location: '',
    skills: '',
    category: '',
    urgent: false,
    link: '',
  });

  // Bookmarks — persisted in localStorage

  const [bookmarks, setBookmarks] =
    useState<Set<string>>(() => {
      if (
        typeof window === 'undefined'
      ) {
        return new Set();
      }

      try {
        return new Set(
          JSON.parse(
            localStorage.getItem(
              'us_bookmarks'
            ) || '[]'
          ) as string[]
        );
      } catch {
        return new Set();
      }
    });

  const toggleBookmark = (
    jobId: string
  ) => {
    setBookmarks((prev) => {
      const next = new Set(prev);

      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }

      if (
        typeof localStorage !==
        'undefined'
      ) {
        localStorage.setItem(
          'us_bookmarks',
          JSON.stringify(
            Array.from(next)
          )
        );
      }

      return next;
    });
  };

  const fetchJobs = async () => {
    setLoading(true);

    try {
      const res = await getPb()
        .collection('jobs')
        .getList(1, 100, {
          sort: '-created',
        });

      setJobs(res.items);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const pb = getPb();

    try {
      pb.collection('jobs').subscribe(
        '*',
        () => fetchJobs()
      );
    } catch { }

    return () => {
      try {
        pb.collection('jobs').unsubscribe(
          '*'
        );
      } catch { }
    };
  }, []);

  const filtered = jobs
    .filter(
      (j) =>
        catFilter === 'all' ||
        j.category === catFilter
    )
    .filter(
      (j) =>
        typeFilter === 'all' ||
        j.type === typeFilter
    )
    .filter(
      (j) =>
        !search ||
        j.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        j.location
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    )
    .filter(
      (j) =>
        !showBookmarksOnly ||
        bookmarks.has(j.id)
    );

  const resetForm = () =>
    setForm({
      title: '',
      company: '',
      type: 'Daily Wage',
      pay: '',
      location: '',
      skills: '',
      category: '',
      urgent: false,
      link: '',
    });

  const handlePost = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (
      !form.title ||
      !form.pay ||
      !form.location
    ) {
      alert(
        'Please fill: Job title, Pay, and Location'
      );
      return;
    }

    setPosting(true);

    try {
      if (editingJob) {
        await getPb()
          .collection('jobs')
          .update(editingJob.id, {
            ...form,
          });

        setEditingJob(null);
      } else {
        await getPb()
          .collection('jobs')
          .create({
            ...form,
            posted_by: user.id,
          });
      }

      setShowPost(false);
      resetForm();
    } catch (e) {
      console.error(e);
      alert('Failed');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteJob = (
    jobId: string
  ) =>
    setJobs(
      jobs.filter(
        (j) => j.id !== jobId
      )
    );

  const handleEditJob = (
    job: any
  ) => {
    setForm({
      title: job.title,
      company: job.company || '',
      type: job.type,
      pay: job.pay,
      location: job.location,
      skills: job.skills || '',
      category: job.category || '',
      urgent: job.urgent || false,
      link: job.link || '',
    });

    setEditingJob(job);
    setShowPost(true);
  };

  const inputStyle: React.CSSProperties =
  {
    width: '100%',
    boxSizing: 'border-box',
    border: `1px solid ${colors.slate200}`,
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    padding: '12px 14px',
    fontSize: '14px',
    color: colors.slate900,
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f7faf5',
          fontFamily: 'inherit',
        }}
      >
        {/* Hero */}

        <header
          style={{
            position: 'relative',
            background:
              'linear-gradient(135deg, #14532d 0%, #16a34a 100%)',
            padding:
              '32px 16px 96px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1024px',
              margin: '0 auto',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                border:
                  '1px solid rgba(255,255,255,0.30)',
                borderRadius: '9999px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 500,
                color: colors.white,
              }}
            >
              {jobs.length} gigs hiring right now
            </span>

            <h1
              style={{
                margin:
                  '16px 0 0',
                fontSize:
                  'clamp(30px, 5vw, 48px)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: colors.white,
              }}
            >
              Local work, matched fast.
            </h1>

            <p
              style={{
                maxWidth: '600px',
                margin:
                  '12px 0 0',
                fontSize: '15px',
                lineHeight: 1.6,
                color:
                  'rgba(255,255,255,0.80)',
              }}
            >
              Daily wage, hourly and contract
              gigs near you — apply in one tap,
              or post a job and hear from workers
              today.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button
                onClick={() =>
                  user
                    ? setShowPost(true)
                    : router.push('/login')
                }
                style={{
                  border: 'none',
                  borderRadius: '9999px',
                  backgroundColor: colors.white,
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#15803d',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                + Post a job
              </button>

              <button
                onClick={() =>
                  setShowBookmarksOnly(true)
                }
                style={{
                  border:
                    '1px solid rgba(255,255,255,0.40)',
                  borderRadius: '9999px',
                  backgroundColor:
                    'transparent',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: colors.white,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                }}
              >
                🔖 Saved ({bookmarks.size})
              </button>
            </div>
          </div>
        </header>

        <div
          style={{
            width: '100%',
            maxWidth: '1024px',
            boxSizing: 'border-box',
            margin:
              '-64px auto 0',
            padding:
              '0 16px 48px',
          }}
        >
          {/* Search */}

          <div
            style={{
              borderRadius: '16px',
              backgroundColor: colors.white,
              padding: '8px',
              boxShadow:
                '0 10px 30px rgba(0,0,0,0.10)',
            }}
          >
            <div
              style={{
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform:
                    'translateY(-50%)',
                  color: colors.slate400,
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>

              <label
                htmlFor="job-search"
                style={{
                  display: 'none',
                }}
              >
                Search jobs
              </label>

              <input
                id="job-search"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search jobs, skills or city"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: 'none',
                  outline: 'none',
                  backgroundColor:
                    'transparent',
                  padding:
                    '14px 16px 14px 44px',
                  fontSize: '15px',
                  color: colors.slate900,
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* All jobs / Saved toggle */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'space-between',
              gap: '12px',
              margin:
                '16px 0 12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <button
                onClick={() =>
                  setShowBookmarksOnly(
                    false
                  )
                }
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '6px',
                  border: `1px solid ${!showBookmarksOnly
                    ? colors.green
                    : colors.slate200
                    }`,
                  borderRadius:
                    '9999px',
                  backgroundColor:
                    !showBookmarksOnly
                      ? colors.green
                      : colors.white,
                  padding:
                    '6px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color:
                    !showBookmarksOnly
                      ? colors.white
                      : colors.slate600,
                  fontFamily:
                    'inherit',
                  cursor:
                    'pointer',
                }}
              >
                🌐 All jobs
              </button>

              <button
                onClick={() =>
                  setShowBookmarksOnly(
                    true
                  )
                }
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: '6px',
                  border: `1px solid ${showBookmarksOnly
                    ? colors.green
                    : colors.slate200
                    }`,
                  borderRadius:
                    '9999px',
                  backgroundColor:
                    showBookmarksOnly
                      ? colors.green
                      : colors.white,
                  padding:
                    '6px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color:
                    showBookmarksOnly
                      ? colors.white
                      : colors.slate600,
                  fontFamily:
                    'inherit',
                  cursor:
                    'pointer',
                }}
              >
                🔖 Saved
              </button>
            </div>

            <div
              style={{
                fontSize: '14px',
                color: colors.slate400,
              }}
            >
              {filtered.length} results
            </div>
          </div>

          {/* Category filter */}

          <div
            role="tablist"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            <Pill
              active={
                catFilter === 'all'
              }
              onClick={() =>
                setCatFilter('all')
              }
            >
              🌐 All categories
            </Pill>

            {CATEGORIES.map((c) => (
              <Pill
                key={c.id}
                active={
                  catFilter === c.id
                }
                onClick={() =>
                  setCatFilter(c.id)
                }
              >
                {c.icon} {c.label}
              </Pill>
            ))}
          </div>

          {/* Type filter */}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '16px',
              marginBottom: '12px',
              scrollbarWidth: 'none',
            }}
          >
            <Pill
              active={
                typeFilter === 'all'
              }
              onClick={() =>
                setTypeFilter('all')
              }
            >
              All types
            </Pill>

            {JOB_TYPES.map((tt) => (
              <Pill
                key={tt}
                active={
                  typeFilter === tt
                }
                onClick={() =>
                  setTypeFilter(tt)
                }
              >
                {tt}
              </Pill>
            ))}
          </div>

          {loading ? (
            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                alignItems:
                  'center',
                gap: '16px',
                padding:
                  '80px 20px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  border:
                    '3px solid #e2e8f0',
                  borderTopColor:
                    '#16a34a',
                  borderRadius:
                    '50%',
                  animation:
                    'spin 0.7s linear infinite',
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: '15px',
                  color: colors.slate400,
                }}
              >
                Loading jobs…
              </p>
            </div>
          ) : filtered.length ===
            0 ? (
            <div
              style={{
                padding:
                  '80px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  marginBottom:
                    '12px',
                  fontSize: '48px',
                }}
              >
                {showBookmarksOnly
                  ? '🔖'
                  : '🔍'}
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.slate700,
                }}
              >
                {showBookmarksOnly
                  ? 'No saved jobs'
                  : 'No jobs found'}
              </p>

              <p
                style={{
                  margin:
                    '6px 0 0',
                  fontSize: '14px',
                  color: colors.slate400,
                }}
              >
                {showBookmarksOnly
                  ? 'Tap the 🔗 icon on any job to save it'
                  : jobs.length === 0
                    ? 'Be the first to post a job!'
                    : 'Try different filters'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                gap: '14px',
              }}
            >
              {filtered.map(
                (job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    user={user}
                    profile={profile}
                    authLoading={
                      authLoading
                    }
                    onDelete={
                      handleDeleteJob
                    }
                    onEdit={
                      handleEditJob
                    }
                    isBookmarked={bookmarks.has(
                      job.id
                    )}
                    onBookmark={
                      toggleBookmark
                    }
                    onStatusChange={(
                      id,
                      status
                    ) =>
                      setJobs(
                        (prev) =>
                          prev.map(
                            (j) =>
                              j.id ===
                                id
                                ? {
                                  ...j,
                                  status,
                                }
                                : j
                          )
                      )
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* Post Job Modal */}

        {showPost && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
              if (
                e.target ===
                e.currentTarget
              ) {
                setShowPost(false);
                setEditingJob(null);
                resetForm();
              }
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 500,
              display: 'flex',
              alignItems:
                'flex-end',
              justifyContent:
                'center',
              backgroundColor:
                'rgba(0,0,0,0.60)',
              backdropFilter:
                'blur(5px)',
              padding: 0,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '512px',
                maxHeight: '92vh',
                overflowY:
                  'auto',
                borderRadius:
                  '20px 20px 0 0',
                backgroundColor:
                  colors.white,
                padding:
                  '20px',
                boxSizing:
                  'border-box',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between',
                  marginBottom:
                    '24px',
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize:
                        '20px',
                      fontWeight: 900,
                      color:
                        colors.slate900,
                    }}
                  >
                    {editingJob
                      ? 'Edit job'
                      : 'Post a job'}
                  </h2>

                  <p
                    style={{
                      margin:
                        '2px 0 0',
                      fontSize:
                        '13px',
                      color:
                        colors.slate400,
                    }}
                  >
                    {editingJob
                      ? 'Update the details and save your changes.'
                      : 'Fill details to find workers fast'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPost(
                      false
                    );
                    setEditingJob(
                      null
                    );
                    resetForm();
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    justifyContent:
                      'center',
                    border:
                      'none',
                    borderRadius:
                      '8px',
                    backgroundColor:
                      colors.slate100,
                    color:
                      colors.slate500,
                    fontSize:
                      '18px',
                    cursor:
                      'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '16px',
                }}
              >
                {(
                  [
                    [
                      'title',
                      'Job title *',
                      'e.g. Need Plumber at Home',
                    ],
                    [
                      'pay',
                      'Pay *',
                      'e.g. ₹500/day',
                    ],
                    [
                      'location',
                      'Location *',
                      'City or Area',
                    ],
                    [
                      'company',
                      'Company / shop (optional)',
                      'Your business name',
                    ],
                  ] as [
                    string,
                    string,
                    string
                  ][]
                ).map(
                  ([
                    field,
                    label,
                    ph,
                  ]) => (
                    <div
                      key={
                        field
                      }
                    >
                      <label
                        htmlFor={`post-${field}`}
                        style={{
                          display:
                            'block',
                          marginBottom:
                            '6px',
                          fontSize:
                            '13px',
                          fontWeight:
                            700,
                          color:
                            colors.slate600,
                        }}
                      >
                        {label}
                      </label>

                      <input
                        id={`post-${field}`}
                        placeholder={
                          ph
                        }
                        style={
                          inputStyle
                        }
                        value={
                          (
                            form as any
                          )[field]
                        }
                        onChange={(
                          e
                        ) =>
                          setForm(
                            (
                              f
                            ) => ({
                              ...f,
                              [field]:
                                e
                                  .target
                                  .value,
                            })
                          )
                        }
                      />
                    </div>
                  )
                )}

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap: '12px',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        marginBottom:
                          '6px',
                        fontSize:
                          '13px',
                        fontWeight:
                          700,
                        color:
                          colors.slate600,
                      }}
                    >
                      Job type
                    </label>

                    <select
                      style={
                        inputStyle
                      }
                      value={
                        form.type
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (f) => ({
                            ...f,
                            type: e
                              .target
                              .value,
                          })
                        )
                      }
                    >
                      {JOB_TYPES.map(
                        (
                          tt
                        ) => (
                          <option
                            key={
                              tt
                            }
                          >
                            {tt}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          'block',
                        marginBottom:
                          '6px',
                        fontSize:
                          '13px',
                        fontWeight:
                          700,
                        color:
                          colors.slate600,
                      }}
                    >
                      Category
                    </label>

                    <select
                      style={
                        inputStyle
                      }
                      value={
                        form.category
                      }
                      onChange={(
                        e
                      ) =>
                        setForm(
                          (f) => ({
                            ...f,
                            category:
                              e
                                .target
                                .value,
                          })
                        )
                      }
                    >
                      <option value="">
                        — Select —
                      </option>

                      {CATEGORIES.map(
                        (c) => (
                          <option
                            key={
                              c.id
                            }
                            value={
                              c.id
                            }
                          >
                            {
                              c.icon
                            }{' '}
                            {
                              c.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '13px',
                      fontWeight:
                        700,
                      color:
                        colors.slate600,
                    }}
                  >
                    Required skills
                    (optional)
                  </label>

                  <input
                    placeholder="e.g. Plumbing, Wiring"
                    style={
                      inputStyle
                    }
                    value={
                      form.skills
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (f) => ({
                          ...f,
                          skills:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '13px',
                      fontWeight:
                        700,
                      color:
                        colors.slate600,
                    }}
                  >
                    Apply link
                    (optional)
                  </label>

                  <input
                    placeholder="e.g. https://forms.google.com/... or WhatsApp link"
                    style={
                      inputStyle
                    }
                    value={
                      form.link
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (f) => ({
                          ...f,
                          link:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                  />

                  <p
                    style={{
                      margin:
                        '4px 0 0 2px',
                      fontSize:
                        '11px',
                      color:
                        colors.slate400,
                    }}
                  >
                    Add a link where
                    applicants can apply
                    directly
                  </p>
                </div>

                <label
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: '10px',
                    border:
                      '1px solid #fecaca',
                    borderRadius:
                      '12px',
                    backgroundColor:
                      colors.redLight,
                    padding:
                      '12px 14px',
                    cursor:
                      'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      form.urgent
                    }
                    onChange={(
                      e
                    ) =>
                      setForm(
                        (f) => ({
                          ...f,
                          urgent:
                            e
                              .target
                              .checked,
                        })
                      )
                    }
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor:
                        '#dc2626',
                    }}
                  />

                  <span
                    style={{
                      fontSize:
                        '14px',
                      fontWeight:
                        700,
                      color:
                        '#dc2626',
                    }}
                  >
                    🔥 Mark as urgent
                  </span>
                </label>
              </div>

              <div
                style={{
                  display:
                    'flex',
                  gap: '10px',
                  marginTop:
                    '24px',
                }}
              >
                <button
                  onClick={() => {
                    setShowPost(
                      false
                    );
                    setEditingJob(
                      null
                    );
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    border: `1px solid ${colors.slate200}`,
                    borderRadius:
                      '9999px',
                    backgroundColor:
                      colors.white,
                    padding:
                      '14px',
                    fontSize:
                      '14px',
                    fontWeight:
                      600,
                    color:
                      colors.slate600,
                    fontFamily:
                      'inherit',
                    cursor:
                      'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handlePost
                  }
                  disabled={
                    posting
                  }
                  style={{
                    flex: 2,
                    border:
                      'none',
                    borderRadius:
                      '9999px',
                    backgroundColor:
                      posting
                        ? '#dcfce7'
                        : colors.green,
                    padding:
                      '14px',
                    fontSize:
                      '15px',
                    fontWeight:
                      700,
                    color:
                      posting
                        ? '#15803d'
                        : colors.white,
                    fontFamily:
                      'inherit',
                    cursor:
                      posting
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {posting
                    ? 'Saving…'
                    : editingJob
                      ? 'Update job'
                      : 'Post job now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}