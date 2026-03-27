'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';
import { JobCard } from '@/components/JobCard';

const JOB_TYPES = ['Daily Wage','Hourly','Part-Time','Contract','Full-Time','Team Hire'];

const Pill = ({ active, onClick, children }: any) => (
  <button onClick={onClick} style={{ fontSize:12, fontWeight:600, padding:'6px 14px', borderRadius:99, border:'1px solid', whiteSpace:'nowrap', cursor:'pointer', fontFamily:'inherit', borderColor: active ? '#16a34a' : '#d1fae5', background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#15803d', transition:'all 0.15s' }}>
    {children}
  </button>
);

export default function GigsPage() {
  const { user } = useAuth();
  const { lang, t } = useLang();
  const g = t.gigs;
  const [jobs,      setJobs]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [typeFilter,setTypeFilter]= useState('all');
  const [showPost,  setShowPost]  = useState(false);
  const [posting,   setPosting]   = useState(false);
  const [form, setForm] = useState({ title:'', company:'', type:'Daily Wage', pay:'', location:'', skills:'', category:'', urgent:false });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getPb().collection('jobs').getList(1, 50, { sort:'-created' });
      setJobs(res.items);
    } catch { setJobs([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    const pb = getPb();
    try { pb.collection('jobs').subscribe('*', () => fetchJobs()); } catch {}
    return () => { try { pb.collection('jobs').unsubscribe('*'); } catch {} };
  }, []);

  const filtered = jobs.filter(j => catFilter === 'all' || j.category === catFilter).filter(j => typeFilter === 'all' || j.type === typeFilter);

  const handlePost = async () => {
    if (!user) { alert(lang === 'hi' ? 'पहले लॉगिन करें' : 'Please login first'); return; }
    if (!form.title || !form.pay || !form.location) { alert(lang === 'hi' ? 'सभी जरूरी फ़ील्ड भरें' : 'Fill required fields'); return; }
    setPosting(true);
    try { await getPb().collection('jobs').create({ ...form, posted_by: user.id }); setShowPost(false); setForm({ title:'', company:'', type:'Daily Wage', pay:'', location:'', skills:'', category:'', urgent:false }); }
    catch(e) { console.error(e); }
    finally { setPosting(false); }
  };

  const inputStyle: React.CSSProperties = { width:'100%', border:'1.5px solid #d1fae5', borderRadius:10, padding:'10px 12px', fontSize:14, color:'#14532d', fontFamily:'inherit', outline:'none', boxSizing:'border-box', background:'#f0fdf4' };

  return (
    <div className="page-enter" style={{ maxWidth:1200, margin:'0 auto', padding:'32px 16px' }}>
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:24 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#14532d' }}>{g.title}</h1>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'#16a34a', background:'#f0fdf4', border:'1px solid #d1fae5', padding:'3px 10px', borderRadius:99 }}>
              <span className="live-dot" style={{ width:6, height:6, background:'#16a34a', borderRadius:'50%', display:'inline-block' }} />
              {g.liveTag}
            </span>
          </div>
          <p style={{ fontSize:13, color:'#4b7a5a' }}>{g.sub}</p>
        </div>
        <button onClick={() => setShowPost(true)} style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
          + {g.postBtn}
        </button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:10 }}>
        <Pill active={catFilter === 'all'} onClick={() => setCatFilter('all')}>{g.allCats}</Pill>
        {CATEGORIES.map(c => <Pill key={c.id} active={catFilter === c.id} onClick={() => setCatFilter(c.id)}>{c.icon} {c.label}</Pill>)}
      </div>
      <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:12, marginBottom:24 }}>
        <Pill active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>{g.allTypes}</Pill>
        {JOB_TYPES.map(tt => <Pill key={tt} active={typeFilter === tt} onClick={() => setTypeFilter(tt)}>{tt}</Pill>)}
      </div>

      {/* Jobs */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
          <p style={{ color:'#4b7a5a', fontWeight:600 }}>{g.noJobs}</p>
          {jobs.length === 0 && <p style={{ color:'#86b899', fontSize:13, marginTop:8 }}>{lang === 'hi' ? 'पहली नौकरी पोस्ट करें!' : 'Be the first to post a job!'}</p>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14, marginBottom:48 }}>
          {filtered.map(job => <JobCard key={job.id} job={job} lang={lang} />)}
        </div>
      )}

      {/* CTA */}
      <div style={{ background:'#14532d', borderRadius:24, padding:'40px 24px', textAlign:'center', marginTop:24 }}>
        <div style={{ fontSize:36, marginBottom:12 }}>🙌</div>
        <h3 style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:8 }}>{g.workerCTATitle}</h3>
        <p style={{ fontSize:14, color:'#86efac', maxWidth:420, margin:'0 auto 20px', lineHeight:1.6 }}>{g.workerCTASub}</p>
        <Link href="/onboarding" style={{ background:'#4ade80', color:'#14532d', fontWeight:700, padding:'12px 28px', borderRadius:14, textDecoration:'none', fontSize:14, display:'inline-block' }}>{g.joinBtn}</Link>
      </div>

      {/* Post Job Modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:500 }} onClick={e => { if(e.target === e.currentTarget) setShowPost(false); }}>
          <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:'#14532d' }}>{g.postTitle}</h2>
              <button onClick={() => setShowPost(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#86b899' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {[['title',g.jobTitle+' *','e.g. AC Technician'],['company',g.company,'Company name'],['pay',g.pay+' *','₹800/day'],['location',g.location+' *','City, State'],['skills',g.skills,'Plumbing, Wiring']].map(([field,label,ph]) => (
                <div key={field}>
                  <label style={{ fontSize:12, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:5 }}>{label}</label>
                  <input placeholder={ph} style={inputStyle} value={(form as any)[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:5 }}>{g.jobType}</label>
                  <select style={{ ...inputStyle }} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {JOB_TYPES.map(tt => <option key={tt}>{tt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:5 }}>{g.category}</label>
                  <select style={{ ...inputStyle }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                <input type="checkbox" checked={form.urgent} onChange={e => setForm(f => ({ ...f, urgent: e.target.checked }))} style={{ accentColor:'#16a34a', width:16, height:16 }} />
                <span style={{ fontSize:14, fontWeight:600, color:'#14532d' }}>{g.markUrgent}</span>
              </label>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button onClick={() => setShowPost(false)} style={{ flex:1, padding:'11px', border:'1.5px solid #d1fae5', borderRadius:12, color:'#15803d', fontWeight:600, fontSize:14, cursor:'pointer', background:'#fff', fontFamily:'inherit' }}>{g.cancel}</button>
              <button onClick={handlePost} disabled={posting} style={{ flex:1, padding:'11px', border:'none', borderRadius:12, background: posting ? '#d1fae5' : '#16a34a', color: posting ? '#4b7a5a' : '#fff', fontWeight:700, fontSize:14, cursor: posting ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                {posting ? '…' : g.postSubmit}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
