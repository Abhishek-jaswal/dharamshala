'use client';
import { useState } from 'react';
import { Badge } from './Badge';
import { CATEGORIES } from '@/lib/data';
import { getPb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';

export function JobCard({ job, lang }: { job: any; lang: string }) {
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const cat = CATEGORIES.find(c => c.id === job.category);

  const handleApply = async () => {
    if (!user) { alert(lang === 'hi' ? 'पहले लॉगिन करें' : 'Please login first'); return; }
    setLoading(true);
    try {
      await getPb().collection('applications').create({ job_id: job.id, applicant_id: user.id, status: 'pending' });
      setApplied(true);
    } catch { setApplied(true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:16, padding:20, transition:'transform 0.15s,box-shadow 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(22,163,74,0.10)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow=''; }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {job.urgent && <Badge variant="urgent">🔴 {lang === 'hi' ? 'अत्यावश्यक' : 'Urgent'}</Badge>}
          {cat && <Badge variant="outline">{cat.icon} {cat.label}</Badge>}
          <Badge variant="muted">{job.type}</Badge>
        </div>
        <span style={{ fontWeight:900, color:'#15803d', fontSize:16, marginLeft:8, flexShrink:0 }}>{job.pay}</span>
      </div>
      <h3 style={{ fontWeight:700, color:'#14532d', fontSize:16, marginBottom:4 }}>{job.title}</h3>
      <p style={{ fontSize:13, color:'#86b899', marginBottom:12 }}>{job.company}</p>
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {(job.skills || '').split(',').filter(Boolean).map((s: string) => (
            <span key={s} style={{ fontSize:11, background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:6, padding:'2px 8px' }}>{s.trim()}</span>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:12, color:'#86b899' }}>📍 {job.location}</span>
          <button onClick={handleApply} disabled={applied || loading}
            style={{ fontSize:12, fontWeight:700, padding:'6px 14px', borderRadius:8, border:'none', cursor: applied ? 'default' : 'pointer', background: applied ? '#dcfce7' : '#16a34a', color: applied ? '#15803d' : '#fff', fontFamily:'inherit' }}>
            {loading ? '…' : applied ? (lang === 'hi' ? 'आवेदित ✓' : 'Applied ✓') : (lang === 'hi' ? 'आवेदन →' : 'Apply →')}
          </button>
        </div>
      </div>
    </div>
  );
}
