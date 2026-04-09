/**
 * WorkerDetail.tsx
 * Full worker profile modal showing details, ratings, reviews, and contact options
 */

interface WorkerDetailProps {
  worker: any;
  onClose: () => void;
}

export default function WorkerDetail({ worker, onClose }: WorkerDetailProps) {
  // Sample reviews for demo
  const reviews = [
    {
      id: 1,
      reviewer: 'Rajesh M.',
      rating: 5,
      date: '2 days ago',
      text: 'Excellent work! Fixed my electrical issue quickly and professionally.',
    },
    {
      id: 2,
      reviewer: 'Priya S.',
      rating: 5,
      date: '1 week ago',
      text: 'Very reliable and punctual. Highly recommended!',
    },
    {
      id: 3,
      reviewer: 'Amit K.',
      rating: 4,
      date: '2 weeks ago',
      text: 'Good work, though could have explained the issue better.',
    },
  ];

  const handleCall = () => {
    if (worker.phone) {
      window.location.href = `tel:${worker.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (worker.phone) {
      const message = `Hi ${encodeURIComponent(
        worker.name
      )}, I found you on UrbanServe and would like to book your services.`;
      window.open(
        `https://wa.me/91${worker.phone}?text=${message}`,
        '_blank'
      );
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 700,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 16,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 500,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
          animation: 'slideUp 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg,#0f4c25,#16a34a)',
            padding: '32px 28px 28px',
            borderRadius: '24px 24px 0 0',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 8,
              width: 32,
              height: 32,
              fontSize: 16,
              cursor: 'pointer',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '3px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 28,
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {worker.initials}
            </div>

            <div>
              <div style={{ fontWeight: 900, color: '#fff', fontSize: 22 }}>
                {worker.name}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: 14,
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {worker.role}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  ⭐ {worker.rating}
                </div>

                {worker.verified && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'rgba(255,255,255,0.2)',
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    ✅ Verified
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Stats */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #dcfce7',
                borderRadius: 12,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#16a34a',
                  marginBottom: 4,
                }}
              >
                {worker.jobs}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Jobs Completed
              </div>
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: 12,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#3b82f6',
                  marginBottom: 4,
                }}
              >
                {worker.exp}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Experience
              </div>
            </div>

            <div
              style={{
                background: '#fef9e7',
                border: '1px solid #fef3c7',
                borderRadius: 12,
                padding: '14px 12px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: '#f59e0b',
                  marginBottom: 4,
                }}
              >
                {worker.price}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                Starting Rate
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              ABOUT
            </div>
            <div
              style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: '14px 16px',
                fontSize: 14,
                color: '#475569',
                lineHeight: 1.6,
              }}
            >
              Highly skilled {worker.role} with {worker.exp} of professional experience. Specializes in quality work, timely completion, and customer satisfaction. Verified and insured professional.
            </div>
          </div>

          {/* Skills */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                marginBottom: 10,
              }}
            >
              SPECIALTIES
            </div>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {[
                'Installation',
                'Repair',
                'Maintenance',
                'Troubleshooting',
                'Customer Service',
              ].map((skill) => (
                <div
                  key={skill}
                  style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                marginBottom: 12,
              }}
            >
              ⭐ RECENT REVIEWS ({reviews.length})
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: 13,
                      }}
                    >
                      {review.reviewer}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#94a3b8',
                      }}
                    >
                      {review.date}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 4,
                      marginBottom: 8,
                    }}
                  >
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 12,
                          color: i < review.rating ? '#f59e0b' : '#cbd5e1',
                        }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      color: '#475569',
                      lineHeight: 1.5,
                    }}
                  >
                    {review.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Buttons */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.06em',
                marginBottom: 12,
              }}
            >
              CONTACT
            </div>

            <div
              style={{
                display: 'flex',
                gap: 10,
              }}
            >
              <button
                onClick={handleCall}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as any).style.background = '#15803d';
                }}
                onMouseLeave={(e) => {
                  (e.target as any).style.background = '#16a34a';
                }}
              >
                📞 Call
              </button>

              <button
                onClick={handleWhatsApp}
                style={{
                  flex: 1,
                  background: '#dcfce7',
                  color: '#16a34a',
                  border: '1.5px solid #d1fae5',
                  borderRadius: 12,
                  padding: '14px 16px',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.target as any).style.background = '#bbf7d0';
                }}
                onMouseLeave={(e) => {
                  (e.target as any).style.background = '#dcfce7';
                }}
              >
                💬 WhatsApp
              </button>
            </div>
          </div>

          {/* Bottom spacing */}
          <div style={{ height: 12 }} />
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(100px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
