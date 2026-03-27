'use client';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import { CATEGORIES, STATS, TRUST, PRICING, DEMO_WORKERS } from '@/lib/data';
import { WorkerCard } from '@/components/WorkerCard';
import { Badge } from '@/components/Badge';

const Section = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 16px' }}>{children}</div>
);

const SectionTitle = ({ title, sub, action, href }: any) => (
  <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:8 }}>
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, color:'#14532d' }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:'#4b7a5a', marginTop:4 }}>{sub}</p>}
    </div>
    {action && href && <Link href={href} style={{ fontSize:13, fontWeight:700, color:'#16a34a', textDecoration:'none' }}>{action} →</Link>}
  </div>
);

const Grid = ({ cols, gap = 16, children }: { cols: string; gap?: number; children: React.ReactNode }) => (
  <div style={{ display:'grid', gridTemplateColumns:cols, gap, marginBottom:8 }}>{children}</div>
);

export default function HomePage() {
  const { t } = useLang();
  const h = t.home;

  return (
    <div className="page-enter">
      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', borderBottom:'1px solid #d1fae5', padding:'64px 16px' }}>
        <div style={{ maxWidth:720, margin:'0 auto', textAlign:'center' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fff', border:'1px solid #d1fae5', borderRadius:99, padding:'6px 16px', marginBottom:20 }}>
            <span className="live-dot" style={{ width:8, height:8, background:'#16a34a', borderRadius:'50%', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:700, color:'#15803d', letterSpacing:'0.06em' }}>{h.badge}</span>
          </div>
          <h1 style={{ fontSize:'clamp(28px,5vw,52px)', fontWeight:900, color:'#14532d', lineHeight:1.2, marginBottom:16 }}>
            {h.h1a}<br />
            <span style={{ background:'linear-gradient(135deg,#15803d,#4ade80)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{h.h1b}</span>
          </h1>
          <p style={{ fontSize:16, color:'#4b7a5a', marginBottom:28, lineHeight:1.6, maxWidth:500, margin:'0 auto 28px' }}>{h.sub}</p>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10, marginBottom:24 }}>
            <Link href="/services" style={{ background:'#16a34a', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontSize:14 }}>{h.hireBtn}</Link>
            <Link href="/manpower" style={{ background:'#fff', color:'#15803d', fontWeight:700, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontSize:14, border:'2px solid #d1fae5' }}>{h.manpowerBtn}</Link>
            <Link href="/gigs"     style={{ background:'#14532d', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontSize:14 }}>{h.jobBtn}</Link>
          </div>
          <div style={{ display:'flex', gap:8, maxWidth:460, margin:'0 auto' }}>
            <input placeholder={h.searchPh} style={{ flex:1, border:'2px solid #d1fae5', borderRadius:10, padding:'10px 14px', fontSize:14, color:'#14532d', background:'#fff', fontFamily:'inherit', outline:'none' }} />
            <button style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:10, padding:'10px 16px', fontSize:14, cursor:'pointer' }}>🔍</button>
          </div>
        </div>
      </div>

      <div style={{ padding:'48px 0', display:'flex', flexDirection:'column', gap:56 }}>
        {/* Stats */}
        <Section>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:12 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:14, padding:16, textAlign:'center' }}>
                <div style={{ fontSize:24, fontWeight:900, color:'#15803d' }}>{s.value}</div>
                <div style={{ fontSize:12, color:'#4b7a5a', marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Categories */}
        <Section>
          <SectionTitle title={h.categoriesTitle} sub={h.categoriesSub} action={h.viewAll} href="/services" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href="/services" style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:16, padding:20, textDecoration:'none', display:'block', transition:'transform 0.2s,box-shadow 0.2s' }}
                onMouseEnter={e => { const el = e.currentTarget; el.style.transform='translateY(-2px)'; el.style.boxShadow='0 8px 24px rgba(22,163,74,0.12)'; }}
                onMouseLeave={e => { const el = e.currentTarget; el.style.transform=''; el.style.boxShadow=''; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{ width:48, height:48, background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{cat.icon}</div>
                  <Badge>{cat.count.toLocaleString()} workers</Badge>
                </div>
                <h3 style={{ fontWeight:700, color:'#14532d', fontSize:15, marginBottom:4 }}>{cat.label}</h3>
                <p style={{ fontSize:12, color:'#4b7a5a', marginBottom:12, lineHeight:1.5 }}>{cat.tagline}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {cat.subs.slice(0,3).map(s => (
                    <span key={s.name} style={{ fontSize:11, background:'#f0fdf4', border:'1px solid #d1fae5', color:'#15803d', borderRadius:6, padding:'2px 8px' }}>{s.name}</span>
                  ))}
                  <span style={{ fontSize:11, color:'#4b7a5a', fontWeight:600 }}>+{cat.subs.length-3} more</span>
                </div>
              </Link>
            ))}
          </div>
        </Section>

        {/* Pick & Drop Banner */}
        <Section>
          <div style={{ background:'linear-gradient(135deg,#15803d,#14532d)', borderRadius:24, padding:'32px 28px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:24 }}>
            <div>
              <Badge variant="solid">New Feature</Badge>
              <h3 style={{ fontSize:24, fontWeight:900, color:'#fff', margin:'12px 0 8px' }}>{h.pickDropTitle}</h3>
              <p style={{ fontSize:14, color:'#86efac', maxWidth:420, lineHeight:1.6 }}>{h.pickDropSub}</p>
            </div>
            <Link href="/pick-drop" style={{ background:'#fff', color:'#14532d', fontWeight:700, padding:'12px 24px', borderRadius:14, textDecoration:'none', fontSize:14, whiteSpace:'nowrap' }}>
              {h.sendRunner}
            </Link>
          </div>
        </Section>

        {/* Top Workers */}
        <Section>
          <SectionTitle title={h.workersTitle} sub={h.workersSub} action={h.browseAll} href="/workers" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
            {DEMO_WORKERS.slice(0,6).map(w => <WorkerCard key={w.id} worker={w} onBook={() => {}} />)}
          </div>
        </Section>

        {/* Trust */}
        <Section>
          <SectionTitle title={h.trustTitle} sub={h.trustSub} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
            {TRUST.map(f => (
              <div key={f.title} style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:14, padding:20 }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
                <div style={{ fontWeight:700, color:'#14532d', fontSize:13, marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:12, color:'#4b7a5a', lineHeight:1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Manpower CTA */}
        <Section>
          <div style={{ background:'#14532d', borderRadius:24, padding:'32px 28px', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:24 }}>
            <div>
              <h3 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:8 }}>{h.manpowerCTATitle}</h3>
              <p style={{ fontSize:14, color:'#86efac', maxWidth:420, lineHeight:1.6 }}>{h.manpowerCTASub}</p>
            </div>
            <Link href="/manpower" style={{ background:'#4ade80', color:'#14532d', fontWeight:700, padding:'12px 28px', borderRadius:14, textDecoration:'none', fontSize:14, whiteSpace:'nowrap' }}>
              {h.buildTeam}
            </Link>
          </div>
        </Section>

        {/* Pricing */}
        <Section>
          <SectionTitle title={h.pricingTitle} sub={h.pricingSub} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
            {PRICING.map(p => (
              <div key={p.tier} style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:14, padding:20 }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{p.icon}</div>
                <div style={{ fontWeight:900, color:'#16a34a', fontSize:13, marginBottom:4 }}>{p.tier}</div>
                <div style={{ fontSize:17, fontWeight:700, color:'#14532d', marginBottom:6 }}>{p.range}</div>
                <div style={{ fontSize:12, color:'#4b7a5a' }}>Best for: {p.best}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Gig CTA */}
        <Section>
          <div style={{ background:'#f0fdf4', border:'2px solid #d1fae5', borderRadius:24, padding:'40px 28px', textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>💼</div>
            <h3 style={{ fontSize:22, fontWeight:900, color:'#14532d', marginBottom:8 }}>{h.gigTitle}</h3>
            <p style={{ fontSize:14, color:'#4b7a5a', maxWidth:400, margin:'0 auto 24px', lineHeight:1.6 }}>{h.gigSub}</p>
            <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10 }}>
              <Link href="/gigs"       style={{ background:'#16a34a', color:'#fff', fontWeight:700, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontSize:14 }}>{h.browseJobs}</Link>
              <Link href="/onboarding" style={{ background:'#fff', color:'#15803d', fontWeight:700, padding:'12px 24px', borderRadius:12, textDecoration:'none', fontSize:14, border:'2px solid #d1fae5' }}>{h.registerWorker}</Link>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
