'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';

const JOB_TYPES = ['Daily Wage','Hourly','Part-Time','Contract','Full-Time','Team Hire'];

// Simple pill filter button
const Pill = ({ active, onClick, children }: any) => (
  <button onClick={onClick} style={{ fontSize:13, fontWeight:600, padding:'8px 16px', borderRadius:99, border:'2px solid', whiteSpace:'nowrap' as const, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s', borderColor: active ? '#16a34a' : '#e6f4ea', background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#14532d' }}>
    {children}
  </button>
);

// Applicants panel shown to the job poster
function ApplicantsPanel({ job }: { job: any }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [open, setOpen]             = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const apps = await getPb().collection('applications').getList(1, 50, {
        filter: `job_id="${job.id}"`,
        expand: 'applicant_id',
        sort: '-created',
      });
      // For each application, fetch the profile to get phone number
      const withProfiles = await Promise.all(apps.items.map(async (app: any) => {
        try {
          const profile = await getPb().collection('profiles').getFirstListItem(`user_id="${app.applicant_id}"`);
          return { ...app, profile };
        } catch { return app; }
      }));
      setApplicants(withProfiles);
    } catch { setApplicants([]); }
    finally { setLoading(false); }
  };

  const toggle = () => {
    if (!open) fetchApplicants();
    setOpen(o => !o);
  };

  return (
    <div style={{ marginTop:12 }}>
      <button onClick={toggle} style={{ width:'100%', background:'#f0fdf4', border:'2px solid #d1fae5', borderRadius:12, padding:'11px', fontSize:14, fontWeight:700, color:'#16a34a', cursor:'pointer', fontFamily:'inherit' }}>
        {open ? '▲ Hide Applicants' : `👀 See Who Applied`}
      </button>

      {open && (
        <div style={{ marginTop:10, display:'flex', flexDirection:'column', gap:10 }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:20, color:'#9ca3af', fontSize:14 }}>Loading...</div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign:'center', padding:24, background:'#f9fffe', borderRadius:12 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>⏳</div>
              <div style={{ color:'#6b7280', fontSize:14 }}>No one applied yet. Share this job!</div>
            </div>
          ) : applicants.map((app: any, i: number) => {
            const name    = app.profile?.name || app.expand?.applicant_id?.name || 'Applicant';
            const phone   = app.profile?.contact;
            const skills  = app.profile?.skills;
            const location= app.profile?.location;
            return (
              <div key={i} style={{ background:'#f0fdf4', border:'1.5px solid #d1fae5', borderRadius:14, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, color:'#14532d', fontSize:15 }}>👤 {name}</div>
                  {location && <div style={{ color:'#6b7280', fontSize:13, marginTop:2 }}>📍 {location}</div>}
                  {skills   && <div style={{ color:'#6b7280', fontSize:13, marginTop:2 }}>🛠️ {skills}</div>}
                  {phone    && <div style={{ color:'#16a34a', fontSize:13, fontWeight:700, marginTop:4 }}>📞 {phone}</div>}
                </div>
                {phone ? (
                  <a href={`tel:${phone}`} style={{ textDecoration:'none' }}>
                    <button style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:12, padding:'12px 20px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' as const }}>
                      📞 Call
                    </button>
                  </a>
                ) : (
                  <div style={{ color:'#9ca3af', fontSize:12 }}>No phone</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Single job card
function JobCard({ job, user, lang }: { job: any; user: any; lang: string }) {
  const [applied,  setApplied]  = useState(false);
  const [applying, setApplying] = useState(false);
  const isMyJob = user && job.posted_by === user.id;
  const cat = CATEGORIES.find(c => c.id === job.category);

  const handleApply = async () => {
    if (!user) { alert('Please login first'); return; }
    setApplying(true);
    try {
      await getPb().collection('applications').create({ job_id: job.id, applicant_id: user.id, status: 'pending' });
      setApplied(true);
    } catch { setApplied(true); }
    finally { setApplying(false); }
  };

  return (
    <div style={{ background:'#fff', border:'1.5px solid #e6f4ea', borderRadius:20, padding:20 }}>
      {/* Top row */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12, gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:54, height:54, background:'#f0fdf4', border:'2px solid #d1fae5', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>
            {cat?.icon || '💼'}
          </div>
          <div>
            <div style={{ fontWeight:800, color:'#14532d', fontSize:16 }}>{job.title}</div>
            {job.company && <div style={{ color:'#9ca3af', fontSize:13 }}>{job.company}</div>}
          </div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0 }}>
          <div style={{ fontWeight:900, color:'#16a34a', fontSize:17 }}>{job.pay}</div>
          {job.urgent && <div style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:99, padding:'2px 8px', fontSize:11, fontWeight:700, marginTop:4 }}>🔥 Urgent</div>}
        </div>
      </div>

      {/* Details */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' as const, marginBottom:14 }}>
        <span style={{ background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:600 }}>📍 {job.location}</span>
        <span style={{ background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{job.type}</span>
      </div>

      {/* Action */}
      {isMyJob ? (
        // Job poster sees applicants
        <ApplicantsPanel job={job} />
      ) : (
        // Job seeker applies
        <button onClick={handleApply} disabled={applied || applying}
          style={{ width:'100%', padding:'13px', border:'none', borderRadius:14, fontWeight:800, fontSize:15, cursor: applied ? 'default' : 'pointer', fontFamily:'inherit', background: applied ? '#f0fdf4' : '#16a34a', color: applied ? '#16a34a' : '#fff' }}>
          {applying ? 'Applying…' : applied ? '✅ Applied!' : '✅ Apply Now'}
        </button>
      )}
    </div>
  );
}

export default function GigsPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [jobs,       setJobs]      = useState<any[]>([]);
  const [loading,    setLoading]   = useState(true);
  const [catFilter,  setCatFilter] = useState('all');
  const [typeFilter, setTypeFilter]= useState('all');
  const [showPost,   setShowPost]  = useState(false);
  const [posting,    setPosting]   = useState(false);
  const [search,     setSearch]    = useState('');
  const [form, setForm] = useState({ title:'', company:'', type:'Daily Wage', pay:'', location:'', skills:'', category:'', urgent:false });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await getPb().collection('jobs').getList(1, 100, { sort:'-created' });
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

  const filtered = jobs
    .filter(j => catFilter === 'all' || j.category === catFilter)
    .filter(j => typeFilter === 'all' || j.type === typeFilter)
    .filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()));

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!form.title || !form.pay || !form.location) { alert('Please fill: Job title, Pay, and Location'); return; }
    setPosting(true);
    try {
      await getPb().collection('jobs').create({ ...form, posted_by: user.id });
      setShowPost(false);
      setForm({ title:'', company:'', type:'Daily Wage', pay:'', location:'', skills:'', category:'', urgent:false });
    } catch(e) { console.error(e); }
    finally { setPosting(false); }
  };

  const inp: React.CSSProperties = { width:'100%', border:'1.5px solid #d1fae5', borderRadius:10, padding:'11px 12px', fontSize:14, color:'#14532d', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, background:'#f0fdf4' };

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'28px 16px', fontFamily:"'Outfit',sans-serif" }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap' as const, gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:900, color:'#14532d', marginBottom:4 }}>💼 Find Jobs</h1>
          <p style={{ fontSize:14, color:'#6b7280' }}>Tap any job and click Apply</p>
        </div>
        <button onClick={() => user ? setShowPost(true) : router.push('/login')}
          style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:14, padding:'12px 22px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>
          + Post a Job
        </button>
      </div>

      {/* Search */}
      <input value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="🔍 Search jobs or city..."
        style={{ ...inp, marginBottom:16, fontSize:15, padding:'13px 16px' }} />

      {/* Category filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto' as const, paddingBottom:8, marginBottom:8 }}>
        <Pill active={catFilter==='all'} onClick={()=>setCatFilter('all')}>All</Pill>
        {CATEGORIES.map(c => <Pill key={c.id} active={catFilter===c.id} onClick={()=>setCatFilter(c.id)}>{c.icon} {c.label}</Pill>)}
      </div>

      {/* Type filter */}
      <div style={{ display:'flex', gap:8, overflowX:'auto' as const, paddingBottom:16, marginBottom:24 }}>
        <Pill active={typeFilter==='all'} onClick={()=>setTypeFilter('all')}>All Types</Pill>
        {JOB_TYPES.map(tt => <Pill key={tt} active={typeFilter===tt} onClick={()=>setTypeFilter(tt)}>{tt}</Pill>)}
      </div>

      {/* Jobs list */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'80px 0', color:'#16a34a', fontSize:16 }}>Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 0' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
          <p style={{ color:'#6b7280', fontWeight:600, fontSize:16 }}>No jobs found</p>
          {jobs.length === 0 && <p style={{ color:'#9ca3af', fontSize:14, marginTop:8 }}>Be the first to post a job!</p>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {filtered.map(job => <JobCard key={job.id} job={job} user={user} lang="en" />)}
        </div>
      )}

      {/* Post Job Modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:500 }}
          onClick={e => { if(e.target===e.currentTarget) setShowPost(false); }}>
          <div style={{ background:'#fff', borderRadius:24, padding:28, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto' as const }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:20, fontWeight:900, color:'#14532d' }}>📋 Post a Job</h2>
              <button onClick={()=>setShowPost(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#9ca3af' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Job Title *</label>
                <input placeholder="e.g. Need Plumber at Home" style={inp} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Pay *</label>
                <input placeholder="e.g. ₹500/day" style={inp} value={form.pay} onChange={e=>setForm(f=>({...f,pay:e.target.value}))} />
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Location *</label>
                <input placeholder="City or Area" style={inp} value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Job Type</label>
                  <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {JOB_TYPES.map(tt=><option key={tt}>{tt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'#4b7a5a', display:'block', marginBottom:6 }}>Company (optional)</label>
                <input placeholder="Your company or shop name" style={inp} value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                <input type="checkbox" checked={form.urgent} onChange={e=>setForm(f=>({...f,urgent:e.target.checked}))} style={{ accentColor:'#16a34a', width:18, height:18 }} />
                <span style={{ fontSize:14, fontWeight:700, color:'#14532d' }}>🔥 Mark as Urgent</span>
              </label>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button onClick={()=>setShowPost(false)} style={{ flex:1, padding:'13px', border:'2px solid #e6f4ea', borderRadius:12, color:'#14532d', fontWeight:600, fontSize:14, cursor:'pointer', background:'#fff', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={handlePost} disabled={posting} style={{ flex:1, padding:'13px', border:'none', borderRadius:12, background: posting ? '#d1fae5' : '#16a34a', color: posting ? '#4b7a5a' : '#fff', fontWeight:800, fontSize:14, cursor: posting ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                {posting ? 'Posting…' : '✅ Post Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
