'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import { WORK_TYPES, TEAM_SIZES, BOOKING_TYPES } from '@/lib/data';

const Card = ({ active, onClick, children }: any) => (
  <div onClick={onClick} style={{
    cursor: 'pointer', borderRadius: 16, border: '2px solid', textAlign: 'center',
    padding: 16, transition: 'all 0.15s',
    borderColor: active ? '#16a34a' : '#d1fae5',
    background:  active ? '#f0fdf4' : '#fff',
  }}
    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.borderColor = '#86efac'; } }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; if (!active) (e.currentTarget as HTMLElement).style.borderColor = '#d1fae5'; }}
  >{children}</div>
);

export function ManpowerPage() {
  const { lang } = useLang();
  const [workType,   setWorkType]   = useState('');
  const [teamSize,   setTeamSize]   = useState<any>(null);
  const [engageType, setEngageType] = useState('daily');

  const cost = () => {
    if (!teamSize || teamSize.count === 999) return lang === 'hi' ? 'कस्टम कोट' : 'Custom Quote';
    const rate  = engageType === 'hourly' ? 120 : engageType === 'contract' ? 25000 : 750;
    const total = Math.round(rate * teamSize.multiplier);
    const sfx   = engageType === 'hourly' ? '/hr' : engageType === 'contract' ? '/mo' : '/day';
    return `₹${total.toLocaleString()}${sfx}`;
  };

  const Step = ({ n, label }: { n: number; label: string }) => (
    <h3 style={{ fontWeight: 700, color: '#14532d', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
      <span style={{ width: 24, height: 24, background: '#16a34a', color: '#fff', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{n}</span>
      {label}
    </h3>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#14532d' }}>👷 {lang === 'hi' ? 'पूर्ण मैनपावर आपूर्ति' : 'Full Manpower Supply'}</h1>
        <p style={{ color: '#16a34a', fontSize: 13, marginTop: 4 }}>{lang === 'hi' ? 'भारत में किसी भी स्थान पर किसी भी आकार की लेबर टीम तैनात करें' : 'Deploy labour teams of any size to any location across India'}</p>
      </div>

      {/* Step 1 – Work Type */}
      <div style={{ marginBottom: 40 }}>
        <Step n={1} label={lang === 'hi' ? 'कार्य प्रकार चुनें' : 'Select Work Type'} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
          {WORK_TYPES.map(wt => (
            <Card key={wt.id} active={workType === wt.id} onClick={() => setWorkType(wt.id)}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{wt.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: workType === wt.id ? '#15803d' : '#14532d' }}>{wt.label}</div>
              <div style={{ fontSize: 11, color: '#86b899', lineHeight: 1.4 }}>{wt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 2 – Team Size */}
      <div style={{ marginBottom: 40 }}>
        <Step n={2} label={lang === 'hi' ? 'टीम का आकार चुनें' : 'Select Team Size'} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
          {TEAM_SIZES.map(ts => (
            <Card key={ts.count} active={teamSize?.count === ts.count} onClick={() => setTeamSize(ts)}>
              <div style={{ fontWeight: 900, fontSize: 24, marginBottom: 4, color: teamSize?.count === ts.count ? '#15803d' : '#14532d' }}>
                {ts.count === 999 ? '∞' : ts.count}
              </div>
              <div style={{ fontSize: 11, color: '#4b7a5a', marginBottom: 8 }}>{ts.count === 999 ? 'Workers' : `Worker${ts.count > 1 ? 's' : ''}`}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#f0fdf4', color: '#16a34a', border: '1px solid #d1fae5' }}>{ts.badge}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 3 – Engagement Type */}
      <div style={{ marginBottom: 40 }}>
        <Step n={3} label={lang === 'hi' ? 'एंगेजमेंट प्रकार' : 'Engagement Type'} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {BOOKING_TYPES.map(bt => (
            <Card key={bt.id} active={engageType === bt.id} onClick={() => setEngageType(bt.id)}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{bt.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: engageType === bt.id ? '#15803d' : '#14532d' }}>{bt.label}</div>
              <div style={{ fontSize: 11, color: '#86b899' }}>{bt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Summary */}
      {(workType || teamSize) && (
        <div style={{ background: 'linear-gradient(135deg,#15803d,#14532d)', borderRadius: 24, padding: '32px 28px', color: '#fff', marginBottom: 40 }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 20 }}>📋 {lang === 'hi' ? 'बुकिंग सारांश' : 'Booking Summary'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
            {([
              [lang === 'hi' ? 'कार्य प्रकार'    : 'Work Type',   workType  ? WORK_TYPES.find(w => w.id === workType)?.label : '—'],
              [lang === 'hi' ? 'टीम का आकार'    : 'Team Size',   teamSize  ? (teamSize.count === 999 ? 'Full Team' : `${teamSize.count} Workers`) : '—'],
              [lang === 'hi' ? 'एंगेजमेंट'      : 'Engagement',  BOOKING_TYPES.find(b => b.id === engageType)?.label ?? '—'],
              [lang === 'hi' ? 'अनुमानित लागत' : 'Est. Cost',   cost()],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: '#86efac', marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button style={{ flex: 1, minWidth: 200, background: '#4ade80', color: '#14532d', border: 'none', fontWeight: 700, padding: '13px 20px', borderRadius: 14, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'hi' ? 'टीम का अनुरोध करें → 4 घंटे में तैनाती' : 'Request Team → Deploy in < 4 Hours'}
            </button>
            <button style={{ background: 'rgba(255,255,255,0.12)', color: '#d1fae5', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 600, padding: '13px 20px', borderRadius: 14, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              {lang === 'hi' ? 'कस्टम कोट प्राप्त करें' : 'Get Custom Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManpowerPage;
