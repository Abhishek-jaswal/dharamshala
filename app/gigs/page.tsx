'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';
import { CATEGORIES } from '@/lib/data';

const JOB_TYPES = ['Daily Wage','Hourly','Part-Time','Contract','Full-Time','Team Hire'];

const Pill = ({ active, onClick, children }: any) => (
  <button onClick={onClick} style={{ fontSize:13, fontWeight:600, padding:'9px 18px', borderRadius:99, border:'1.5px solid', whiteSpace:'nowrap' as const, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s',
    borderColor: active ? '#16a34a' : '#e2e8f0', background: active ? '#16a34a' : '#fff', color: active ? '#fff' : '#475569' }}>
    {children}
  </button>
);

// ── Applicants drawer for the job poster ────────────────────────────
function ApplicantsDrawer({ job }: { job: any }) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [open,       setOpen]       = useState(false);
  const [count,      setCount]      = useState<number|null>(null);

  // Just count on mount
  useEffect(() => {
    getPb().collection('applications').getList(1,1,{ filter:`job_id="${job.id}"` })
      .then(r => setCount(r.totalItems)).catch(()=>setCount(0));
  }, [job.id]);

  const load = async () => {
    setLoading(true);
    try {
      const apps = await getPb().collection('applications').getList(1, 100, {
        filter: `job_id="${job.id}"`, sort:'-created',
      });
      const rich = await Promise.all(apps.items.map(async (app:any) => {
        try {
          const profile = await getPb().collection('profiles').getFirstListItem(`user_id="${app.applicant_id}"`);
          return { ...app, profile };
        } catch { return app; }
      }));
      setApplicants(rich);
    } catch { setApplicants([]); }
    finally { setLoading(false); }
  };

  const toggle = () => { if (!open) load(); setOpen(o=>!o); };

  return (
    <div>
      <button onClick={toggle} style={{ width:'100%', background: open ? '#0f172a' : '#f0fdf4', border:`1.5px solid ${open?'#0f172a':'#d1fae5'}`, borderRadius:12, padding:'12px', fontSize:14, fontWeight:700, color: open?'#fff':'#16a34a', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
        <span>👥</span>
        {open ? '▲ Hide Applicants' : `See Who Applied${count!==null ? ` (${count})` : ''}`}
      </button>

      {open && (
        <div className="slide-down" style={{ marginTop:12 }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'28px', color:'#94a3b8', fontSize:14 }}>
              <div className="spinner" style={{ margin:'0 auto 12px' }} />
              Loading applicants…
            </div>
          ) : applicants.length === 0 ? (
            <div style={{ textAlign:'center', padding:'28px 20px', background:'#f8fafc', borderRadius:12, border:'1px dashed #e2e8f0' }}>
              <div style={{ fontSize:40, marginBottom:10 }}>⏳</div>
              <div style={{ color:'#64748b', fontSize:14, fontWeight:600 }}>No applications yet</div>
              <div style={{ color:'#94a3b8', fontSize:13, marginTop:4 }}>Share this job to get applicants!</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {applicants.map((app:any, i:number) => {
                const name     = app.profile?.name || 'Unknown';
                const phone    = app.profile?.contact;
                const skills   = app.profile?.skills;
                const location = app.profile?.location;
                const applied  = new Date(app.created).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
                return (
                  <div key={i} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, minWidth:0 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#16a34a,#22c55e)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16, flexShrink:0 }}>
                        {name[0]?.toUpperCase()}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontWeight:800, color:'#0f172a', fontSize:15 }}>{name}</div>
                        {location && <div style={{ color:'#64748b', fontSize:12, marginTop:1 }}>📍 {location}</div>}
                        {skills && <div style={{ color:'#94a3b8', fontSize:12, marginTop:1 }}>🛠 {skills}</div>}
                        <div style={{ color:'#cbd5e1', fontSize:11, marginTop:2 }}>Applied {applied}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
                      {phone ? (
                        <a href={`tel:${phone}`} style={{ textDecoration:'none' }}>
                          <button style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:800, fontSize:14, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                            📞 Call
                          </button>
                        </a>
                      ) : (
                        <div style={{ color:'#94a3b8', fontSize:12, textAlign:'center' as const }}>No phone</div>
                      )}
                      {phone && (
                        <a href={`https://wa.me/91${phone}`} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                          <button style={{ background:'#dcfce7', color:'#16a34a', border:'1px solid #d1fae5', borderRadius:10, padding:'8px 16px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', width:'100%' }}>
                            💬 WhatsApp
                          </button>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Job card ────────────────────────────────────────────────────────
function JobCard({ job, user }: { job:any; user:any }) {
  const [applied,  setApplied]  = useState(false);
  const [applying, setApplying] = useState(false);
  const isMyJob = user && job.posted_by === user.id;
  const cat = CATEGORIES.find(c => c.id === job.category);
  const timeAgo = (() => {
    const d = (Date.now() - new Date(job.created).getTime()) / 1000;
    if (d < 3600) return `${Math.floor(d/60)}m ago`;
    if (d < 86400) return `${Math.floor(d/3600)}h ago`;
    return `${Math.floor(d/86400)}d ago`;
  })();

  const handleApply = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setApplying(true);
    try {
      await getPb().collection('applications').create({ job_id:job.id, applicant_id:user.id, status:'pending' });
      setApplied(true);
    } catch { setApplied(true); }
    finally { setApplying(false); }
  };

  return (
    <div className="hover-lift" style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:20, padding:22, boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:16 }}>
      {/* Top */}
      <div style={{ display:'flex', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', gap:12, flex:1, minWidth:0 }}>
          <div style={{ width:52, height:52, background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>
            {cat?.icon || '💼'}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:16, marginBottom:2 }}>{job.title}</div>
            {job.company && <div style={{ color:'#94a3b8', fontSize:13 }}>{job.company}</div>}
          </div>
        </div>
        <div style={{ textAlign:'right' as const, flexShrink:0 }}>
          <div style={{ fontWeight:900, color:'#16a34a', fontSize:18 }}>{job.pay}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{timeAgo}</div>
        </div>
      </div>

      {/* Tags */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const }}>
        {job.urgent && <span style={{ background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:700 }}>🔥 Urgent</span>}
        <span style={{ background:'#f0fdf4', color:'#15803d', border:'1px solid #d1fae5', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:600 }}>📍 {job.location}</span>
        <span style={{ background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{job.type}</span>
        {cat && <span style={{ background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:600 }}>{cat.icon} {cat.label}</span>}
      </div>

      {/* Skills */}
      {job.skills && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const }}>
          {job.skills.split(',').filter(Boolean).map((s:string) => (
            <span key={s} style={{ fontSize:11, background:'#eff6ff', color:'#3b82f6', borderRadius:6, padding:'3px 8px', fontWeight:600 }}>{s.trim()}</span>
          ))}
        </div>
      )}

      {/* Posted by */}
      {isMyJob && (
        <div style={{ background:'#f0fdf4', borderRadius:10, padding:'8px 12px', fontSize:12, color:'#16a34a', fontWeight:700 }}>
          ✅ Your Job Posting
        </div>
      )}

      {/* Action */}
      {isMyJob ? (
        <ApplicantsDrawer job={job} />
      ) : (
        <button onClick={handleApply} disabled={applied || applying}
          style={{ width:'100%', padding:'14px', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor: applied ? 'default' : 'pointer', fontFamily:'inherit', transition:'all 0.2s',
            background: applied ? '#f0fdf4' : '#16a34a',
            color:      applied ? '#16a34a' : '#fff',
            boxShadow:  applied ? 'none' : '0 4px 16px rgba(22,163,74,0.3)',
          }}>
          {applying ? 'Applying…' : applied ? '✅ Applied Successfully!' : 'Apply Now →'}
        </button>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────
export default function GigsPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const [jobs,        setJobs]      = useState<any[]>([]);
  const [loading,     setLoading]   = useState(true);
  const [catFilter,   setCatFilter] = useState('all');
  const [typeFilter,  setTypeFilter]= useState('all');
  const [search,      setSearch]    = useState('');
  const [showPost,    setShowPost]  = useState(false);
  const [posting,     setPosting]   = useState(false);
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
    try { pb.collection('jobs').subscribe('*', ()=>fetchJobs()); } catch {}
    return () => { try { pb.collection('jobs').unsubscribe('*'); } catch {} };
  }, []);

  const filtered = jobs
    .filter(j => catFilter==='all' || j.category===catFilter)
    .filter(j => typeFilter==='all' || j.type===typeFilter)
    .filter(j => !search || j.title?.toLowerCase().includes(search.toLowerCase()) || j.location?.toLowerCase().includes(search.toLowerCase()));

  const handlePost = async () => {
    if (!user) { router.push('/login'); return; }
    if (!form.title || !form.pay || !form.location) { alert('Please fill: Job title, Pay, and Location'); return; }
    setPosting(true);
    try {
      await getPb().collection('jobs').create({ ...form, posted_by:user.id });
      setShowPost(false);
      setForm({ title:'', company:'', type:'Daily Wage', pay:'', location:'', skills:'', category:'', urgent:false });
    } catch(e) { console.error(e); }
    finally { setPosting(false); }
  };

  const inp: React.CSSProperties = { width:'100%', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 14px', fontSize:14, color:'#0f172a', fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, background:'#f8fafc', transition:'border-color 0.15s' };

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:'#f8fafc', minHeight:'100vh' }}>

      {/* Header strip */}
      <div style={{ background:'linear-gradient(135deg,#0f4c25,#16a34a)', padding:'40px 24px 56px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'clamp(22px,3vw,36px)', fontWeight:900, color:'#fff', marginBottom:6 }}>
              💼 Find Jobs
            </h1>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:15 }}>
              {jobs.length} jobs live right now — tap any card to apply
            </p>
          </div>
          <button onClick={() => user ? setShowPost(true) : router.push('/login')}
            style={{ background:'#fff', color:'#16a34a', border:'none', borderRadius:14, padding:'14px 28px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', gap:8 }}>
            + Post a Job
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'-24px auto 0', padding:'0 24px 48px' }}>
        {/* Search */}
        <div style={{ background:'#fff', borderRadius:16, padding:6, boxShadow:'0 4px 20px rgba(0,0,0,0.1)', marginBottom:24, display:'flex', gap:0 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search jobs, skills, or city..."
            style={{ flex:1, border:'none', background:'transparent', padding:'14px 18px', fontSize:16, fontFamily:'inherit', outline:'none', color:'#0f172a' }} />
          <button style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:12, padding:'0 24px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Search</button>
        </div>

        {/* Category filter */}
        <div className="pill-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, marginBottom:8 }}>
          <Pill active={catFilter==='all'} onClick={()=>setCatFilter('all')}>🌐 All Categories</Pill>
          {CATEGORIES.map(c => <Pill key={c.id} active={catFilter===c.id} onClick={()=>setCatFilter(c.id)}>{c.icon} {c.label}</Pill>)}
        </div>
        {/* Type filter */}
        <div className="pill-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:16, marginBottom:28 }}>
          <Pill active={typeFilter==='all'} onClick={()=>setTypeFilter('all')}>All Types</Pill>
          {JOB_TYPES.map(tt => <Pill key={tt} active={typeFilter===tt} onClick={()=>setTypeFilter(tt)}>{tt}</Pill>)}
        </div>

        {/* Jobs grid */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 0', gap:16 }}>
            <div className="spinner" />
            <p style={{ color:'#94a3b8', fontSize:15 }}>Loading jobs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:56, marginBottom:12 }}>🔍</div>
            <p style={{ color:'#334155', fontWeight:700, fontSize:18 }}>No jobs found</p>
            <p style={{ color:'#94a3b8', fontSize:14, marginTop:6 }}>{jobs.length===0 ? 'Be the first to post a job!' : 'Try different filters'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:18 }}>
            {filtered.map(job => <JobCard key={job.id} job={job} user={user} />)}
          </div>
        )}
      </div>

      {/* Post Job Modal */}
      {showPost && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:500, backdropFilter:'blur(4px)' }}
          onClick={e=>{if(e.target===e.currentTarget)setShowPost(false);}}>
          <div className="slide-down" style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:500, maxHeight:'90vh', overflowY:'auto' as const, boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>📋 Post a Job</h2>
                <p style={{ color:'#94a3b8', fontSize:13, marginTop:2 }}>Fill the details to find workers</p>
              </div>
              <button onClick={()=>setShowPost(false)} style={{ background:'#f1f5f9', border:'none', borderRadius:10, width:36, height:36, fontSize:18, cursor:'pointer', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {([['title','Job Title *','e.g. Need Plumber at Home'],['pay','Pay *','e.g. ₹500/day'],['location','Location *','City or Area'],['company','Company / Shop (optional)','Your business name']] as [string,string,string][]).map(([field,label,ph]) => (
                <div key={field}>
                  <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>{label}</label>
                  <input placeholder={ph} style={inp} value={(form as any)[field]} onChange={e=>setForm(f=>({...f,[field]:e.target.value}))} />
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>Job Type</label>
                  <select style={inp} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                    {JOB_TYPES.map(tt=><option key={tt}>{tt}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>Category</label>
                  <select style={inp} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                    <option value="">— Select —</option>
                    {CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>Required Skills (optional)</label>
                <input placeholder="e.g. Plumbing, Wiring" style={inp} value={form.skills} onChange={e=>setForm(f=>({...f,skills:e.target.value}))} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:'12px 14px', background:'#fef2f2', borderRadius:12, border:'1px solid #fecaca' }}>
                <input type="checkbox" checked={form.urgent} onChange={e=>setForm(f=>({...f,urgent:e.target.checked}))} style={{ accentColor:'#dc2626', width:18, height:18 }} />
                <span style={{ fontSize:14, fontWeight:700, color:'#dc2626' }}>🔥 Mark as Urgent (gets more attention)</span>
              </label>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button onClick={()=>setShowPost(false)} style={{ flex:1, padding:'14px', border:'1.5px solid #e2e8f0', borderRadius:12, color:'#475569', fontWeight:600, fontSize:14, cursor:'pointer', background:'#fff', fontFamily:'inherit' }}>Cancel</button>
              <button onClick={handlePost} disabled={posting} style={{ flex:2, padding:'14px', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor:posting?'not-allowed':'pointer', fontFamily:'inherit',
                background:posting?'#d1fae5':'#16a34a', color:posting?'#4b7a5a':'#fff',
                boxShadow:posting?'none':'0 4px 16px rgba(22,163,74,0.3)' }}>
                {posting ? 'Posting…' : '✅ Post Job Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
