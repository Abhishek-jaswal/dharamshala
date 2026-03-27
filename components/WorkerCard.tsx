import { Badge } from './Badge';

export function WorkerCard({ worker, onBook }: { worker: any; onBook: () => void }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #d1fae5', borderRadius:16, padding:20, display:'flex', flexDirection:'column', gap:16, transition:'transform 0.2s,box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 8px 24px rgba(22,163,74,0.12)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow=''; }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
        <div style={{ width:48, height:48, borderRadius:12, background:'#dcfce7', border:'2px solid #86efac', display:'flex', alignItems:'center', justifyContent:'center', color:'#15803d', fontWeight:700, fontSize:14, flexShrink:0 }}>
          {worker.initials}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, color:'#14532d', fontSize:14 }}>{worker.name}</span>
            {worker.verified && <span style={{ color:'#16a34a', fontSize:12, fontWeight:700 }}>✓</span>}
          </div>
          <p style={{ fontSize:12, color:'#4b7a5a', marginTop:2 }}>{worker.role}</p>
        </div>
        <Badge>{worker.badge}</Badge>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[['⭐',worker.rating,'Rating'],['✅',worker.jobs,'Jobs'],['🕐',worker.exp,'Exp']].map(([icon,val,lbl]) => (
          <div key={String(lbl)} style={{ background:'#f0fdf4', borderRadius:10, padding:'8px 4px', textAlign:'center' }}>
            <div style={{ fontSize:11, color:'#86efac' }}>{icon}</div>
            <div style={{ fontWeight:700, color:'#14532d', fontSize:13 }}>{val}</div>
            <div style={{ fontSize:11, color:'#4b7a5a' }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <span style={{ fontSize:11, color:'#86b899' }}>From</span>
          <p style={{ fontWeight:700, color:'#15803d', fontSize:15 }}>{worker.price}</p>
        </div>
        <button onClick={onBook} style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:10, padding:'8px 16px', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
          Book Now
        </button>
      </div>
    </div>
  );
}
