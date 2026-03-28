'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const services = [
    ['🧹','Cleaner'],['🚿','Plumber'],['⚡','Electrician'],
    ['👨‍🍳','Cook'],['🪵','Carpenter'],['🛵','Delivery Runner'],
    ['💂','Security Guard'],['🏗️','Labour'],['🌿','Gardener'],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f9fffe', fontFamily:"'Outfit',sans-serif" }}>

      {/* Hero - Two big buttons */}
      <div style={{ background:'linear-gradient(160deg,#16a34a 0%,#14532d 100%)', padding:'64px 20px 80px', textAlign:'center' }}>
        <div style={{ fontSize:60, marginBottom:16 }}>🍃</div>
        <h1 style={{ fontSize:'clamp(30px,6vw,54px)', fontWeight:900, color:'#fff', lineHeight:1.2, marginBottom:12 }}>
          Find Work.<br/>Hire People.
        </h1>
        <p style={{ color:'#86efac', fontSize:16, marginBottom:48, lineHeight:1.7 }}>
          Plumbers · Cleaners · Cooks · Drivers & more.<br/>One tap away.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:340, margin:'0 auto' }}>
          <Link href={user ? '/gigs' : '/login'}
            style={{ background:'#fff', color:'#14532d', fontWeight:900, fontSize:18, padding:'20px 32px', borderRadius:20, textDecoration:'none', display:'block', boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}>
            💼 I Want to Find Work
          </Link>
          <Link href={user ? '/gigs' : '/login'}
            style={{ background:'#22c55e', color:'#fff', fontWeight:900, fontSize:18, padding:'20px 32px', borderRadius:20, textDecoration:'none', display:'block', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
            📋 I Want to Hire Someone
          </Link>
        </div>
        {!user && <p style={{ color:'#bbf7d0', fontSize:13, marginTop:20 }}>Free to join · Takes 30 seconds</p>}
      </div>

      {/* How it works */}
      <div style={{ padding:'56px 20px', maxWidth:640, margin:'0 auto' }}>
        <h2 style={{ textAlign:'center', fontSize:22, fontWeight:900, color:'#14532d', marginBottom:32 }}>How It Works 👇</h2>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { icon:'📱', title:'Sign In', desc:'One click with Google. Free and instant.' },
            { icon:'🔍', title:'Find a Job or Post One', desc:'Browse jobs near you, or add your own job posting.' },
            { icon:'📞', title:'Call and Start Working', desc:'Contact directly. No middleman. Simple.' },
          ].map((s,i) => (
            <div key={i} style={{ background:'#fff', border:'1.5px solid #e6f4ea', borderRadius:18, padding:'18px 20px', display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:52, height:52, background:'#f0fdf4', border:'2px solid #d1fae5', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight:800, color:'#14532d', fontSize:16, marginBottom:3 }}>{s.title}</div>
                <div style={{ color:'#6b7280', fontSize:14, lineHeight:1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <h2 style={{ textAlign:'center', fontSize:20, fontWeight:900, color:'#14532d', marginTop:52, marginBottom:20 }}>Types of Work Available</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
          {services.map(([icon, label]) => (
            <Link key={label as string} href={user ? '/gigs' : '/login'}
              style={{ background:'#fff', border:'1.5px solid #e6f4ea', borderRadius:16, padding:'18px 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, textDecoration:'none' }}>
              <span style={{ fontSize:32 }}>{icon}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#14532d', textAlign:'center' }}>{label}</span>
            </Link>
          ))}
        </div>

        <div style={{ background:'#14532d', borderRadius:24, padding:'36px 24px', textAlign:'center', marginTop:48 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🚀</div>
          <h3 style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:8 }}>Ready to start?</h3>
          <p style={{ color:'#86efac', fontSize:14, marginBottom:24 }}>Join thousands of workers and employers on UrbanServe.</p>
          <Link href={user ? '/gigs' : '/login'}
            style={{ background:'#4ade80', color:'#14532d', fontWeight:800, padding:'14px 32px', borderRadius:14, textDecoration:'none', fontSize:16, display:'inline-block' }}>
            Get Started →
          </Link>
        </div>
      </div>
    </div>
  );
}
