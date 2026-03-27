export function Footer() {
  return (
    <footer style={{ background:'#14532d', color:'#d1fae5', marginTop:64 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'48px 24px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:32, marginBottom:40 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <div style={{ width:32, height:32, background:'#4ade80', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#14532d', fontWeight:900, fontSize:14 }}>U</div>
              <span style={{ fontWeight:900, color:'#fff', fontSize:18 }}>UrbanServe</span>
            </div>
            <p style={{ fontSize:13, color:'#86efac', lineHeight:1.6 }}>India's #1 multi-service super app. Connecting verified workers with everyday needs across 340+ cities.</p>
          </div>
          {[
            { title:'Services', items:['Home Help','Pick & Drop','Repair & Tech','Home Repair','IT Services','Manpower Supply'] },
            { title:'Company',  items:['About Us','Careers','Investor Relations','Press Kit','Blog','Partner Program'] },
            { title:'Support',  items:['Help Centre','Safety Guide','Terms of Service','Privacy Policy','Refund Policy','Contact Us'] },
          ].map(col => (
            <div key={col.title}>
              <h4 style={{ fontWeight:700, color:'#fff', marginBottom:12, fontSize:15 }}>{col.title}</h4>
              {col.items.map(item => <div key={item} style={{ fontSize:13, color:'#86efac', marginBottom:6, cursor:'pointer' }}>{item}</div>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid #166534', paddingTop:20, display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:8, fontSize:12, color:'#6b9a7a' }}>
          <span>© 2025 UrbanServe Technologies Pvt. Ltd. | DPIIT Recognised Startup</span>
          <span>ISO 27001 Certified · PCI DSS Compliant · 1800-123-4567</span>
        </div>
      </div>
    </footer>
  );
}
