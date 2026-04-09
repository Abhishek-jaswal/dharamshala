/**
 * WorkerCard.tsx
 * Displays a compact worker card with name, role, rating, and quick actions
 */

interface WorkerCardProps {
  worker: any;
  onViewDetails?: (worker: any) => void;
}

export default function WorkerCard({ worker, onViewDetails }: WorkerCardProps) {
  const getBackgroundColor = (rating: number) => {
    if (rating >= 4.8) return '#ecfdf5';
    if (rating >= 4.5) return '#f0fdf4';
    return '#f8fafc';
  };

  return (
    <div
      onClick={() => onViewDetails?.(worker)}
      className="hover-lift"
      style={{
        background: getBackgroundColor(worker.rating),
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: '18px 16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {worker.initials}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              color: '#0f172a',
              fontSize: 14,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {worker.name}
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#64748b',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {worker.role}
          </div>

          <div
            style={{
              fontSize: 11,
              color: '#94a3b8',
              marginTop: 2,
            }}
          >
            {worker.exp} experience
          </div>
        </div>

        {worker.badge && (
          <div
            style={{
              background: worker.badge === 'Top Rated' ? '#fef3c7' : '#e0e7ff',
              color: worker.badge === 'Top Rated' ? '#d97706' : '#4f46e5',
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 8px',
              borderRadius: 6,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {worker.badge === 'Top Rated' ? '⭐' : '📈'} {worker.badge}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 8,
          borderTop: '1px solid #d1fae5',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 900, color: '#16a34a' }}>
              ⭐ {worker.rating}
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              ({worker.jobs} jobs)
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#16a34a',
          }}
        >
          {worker.price}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails?.(worker);
        }}
        style={{
          width: '100%',
          background: '#16a34a',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '10px 12px',
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) =>
          ((e.target as any).style.background = '#15803d')
        }
        onMouseLeave={(e) =>
          ((e.target as any).style.background = '#16a34a')
        }
      >
        👁️ View Details
      </button>
    </div>
  );
}
