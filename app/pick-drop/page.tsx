'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPb } from '@/lib/pocketbase';
import { useRouter } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR SETUP: Create a PocketBase collection called "runners_live" with:
//   user_id (text, required)
//   name    (text)
//   phone   (text)
//   lat     (number, required)
//   lng     (number, required)
//   task    (text)   ← what the runner does e.g. "Grocery, Parcel"
//   available (bool, default true)
//   last_seen (date)
// Set API rules to allow all reads, and authenticated create/update.
// ─────────────────────────────────────────────────────────────────────────────

const TASKS = [
  { id:'grocery',  icon:'🛒', label:'Grocery Run',      fee:'₹49', time:'15-30 min' },
  { id:'medicine', icon:'💊', label:'Medicine Pickup',  fee:'₹39', time:'10-20 min' },
  { id:'parcel',   icon:'📦', label:'Parcel Delivery',  fee:'₹59', time:'20-40 min' },
  { id:'document', icon:'📄', label:'Document Courier', fee:'₹49', time:'15-30 min' },
  { id:'shop',     icon:'🏪', label:'Buy From Shop',    fee:'₹69', time:'20-45 min' },
  { id:'food',     icon:'🍱', label:'Tiffin / Food',    fee:'₹39', time:'10-25 min' },
];

function distKm(lat1:number,lon1:number,lat2:number,lon2:number) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180;
  const dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
}

// ── Runner Mode ──────────────────────────────────────────────────────────────
function RunnerMode({ user, profile }: { user:any; profile:any }) {
  const [online,  setOnline]  = useState(false);
  const [coords,  setCoords]  = useState<{lat:number;lng:number}|null>(null);
  const [error,   setError]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [recId,   setRecId]   = useState<string|null>(null);
  const watchRef = useRef<number|null>(null);

  const goOnline = () => {
    setError('');
    if (!navigator.geolocation) { setError('GPS not supported on this device.'); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude:lat, longitude:lng } = pos.coords;
        setCoords({ lat, lng });
        setSaving(true);
        try {
          const pb   = getPb();
          const name  = profile?.name || user?.name || 'Runner';
          const phone = profile?.contact || '';
          const task  = profile?.skills  || 'General';
          // Try update existing, else create
          try {
            const existing = await pb.collection('runners_live').getFirstListItem(`user_id="${user.id}"`);
            await pb.collection('runners_live').update(existing.id, { lat, lng, available:true, last_seen:new Date().toISOString(), name, phone, task });
            setRecId(existing.id);
          } catch {
            const rec = await pb.collection('runners_live').create({ user_id:user.id, name, phone, lat, lng, task, available:true, last_seen:new Date().toISOString() });
            setRecId(rec.id);
          }
          setOnline(true);
        } catch(e) { console.error(e); setError('Could not go online. Check PocketBase runners_live collection.'); }
        finally { setSaving(false); }

        // Watch position every 15s
        watchRef.current = navigator.geolocation.watchPosition(
          async (p) => {
            const newLat = p.coords.latitude;
            const newLng = p.coords.longitude;
            setCoords({ lat:newLat, lng:newLng });
            try {
              const pb = getPb();
              if (recId) await pb.collection('runners_live').update(recId, { lat:newLat, lng:newLng, last_seen:new Date().toISOString() });
            } catch {}
          },
          () => {},
          { enableHighAccuracy:true, maximumAge:15000, timeout:10000 }
        );
      },
      (err) => { setError('Please allow location access to go online.'); },
      { enableHighAccuracy:true, timeout:10000 }
    );
  };

  const goOffline = async () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    try {
      if (recId) await getPb().collection('runners_live').update(recId, { available:false });
      else {
        const existing = await getPb().collection('runners_live').getFirstListItem(`user_id="${user.id}"`);
        await getPb().collection('runners_live').update(existing.id, { available:false });
      }
    } catch {}
    setOnline(false);
    setCoords(null);
  };

  useEffect(() => () => { if (watchRef.current!==null) navigator.geolocation.clearWatch(watchRef.current); }, []);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Status card */}
      <div style={{ background: online ? 'linear-gradient(135deg,#16a34a,#22c55e)' : '#f8fafc', border: online ? 'none' : '2px solid #e2e8f0', borderRadius:24, padding:'36px 28px', textAlign:'center' as const }}>
        <div style={{ fontSize:56, marginBottom:12 }}>{online ? '🟢' : '🔴'}</div>
        <h2 style={{ fontSize:24, fontWeight:900, color: online ? '#fff' : '#0f172a', marginBottom:8 }}>
          {online ? 'You are ONLINE' : 'You are OFFLINE'}
        </h2>
        <p style={{ fontSize:14, color: online ? 'rgba(255,255,255,0.8)' : '#64748b', marginBottom:24, lineHeight:1.6 }}>
          {online
            ? 'Your live location is being shared. Customers can see and book you.'
            : 'Go online to receive delivery requests from customers near you.'}
        </p>
        {coords && online && (
          <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:12, padding:'10px 16px', marginBottom:20, fontSize:13, color:'#fff', fontFamily:'monospace' }}>
            📍 {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </div>
        )}
        {error && <div style={{ background:'#fef2f2', color:'#dc2626', borderRadius:10, padding:'10px 14px', marginBottom:16, fontSize:13, fontWeight:600 }}>{error}</div>}
        <button onClick={online ? goOffline : goOnline} disabled={saving}
          style={{ background: online ? '#fff' : '#16a34a', color: online ? '#dc2626' : '#fff', border:'none', borderRadius:14, padding:'16px 36px', fontSize:16, fontWeight:900, cursor:saving?'not-allowed':'pointer', fontFamily:'inherit',
            boxShadow: online ? 'none' : '0 4px 20px rgba(22,163,74,0.35)' }}>
          {saving ? '⏳ Connecting…' : online ? '🔴 Go Offline' : '🟢 Go Online & Share Location'}
        </button>
      </div>

      {/* Info */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
        {[
          { icon:'💰', title:'Earn Per Trip', val:'₹39 – ₹150' },
          { icon:'⏱️', title:'Avg. Trip Time', val:'20–35 min' },
          { icon:'🛵', title:'Work Anywhere', val:'Your city area' },
        ].map(s => (
          <div key={s.title} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, padding:'20px', textAlign:'center' as const }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{s.icon}</div>
            <div style={{ fontWeight:800, color:'#0f172a', fontSize:15 }}>{s.val}</div>
            <div style={{ color:'#94a3b8', fontSize:12, marginTop:4 }}>{s.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Customer / Poster Mode ───────────────────────────────────────────────────
// ── Customer Mode ─────────────────────────────────────────────────────────────
function CustomerMode({ user }: { user:any }) {
  const [step,     setStep]    = useState(0);
  const [taskType, setTaskType]= useState('');
  const [runners,  setRunners] = useState<any[]>([]);
  const [loadingR, setLoadingR]= useState(false);
  const [myCoords, setMyCoords]= useState<{lat:number;lng:number}|null>(null);
  const [address,  setAddress] = useState('');
  const [items,    setItems]   = useState('');

  // Load all available runners from PocketBase immediately, GPS is optional bonus
  const loadRunners = async () => {
    setLoadingR(true);
    try {
      const res = await getPb().collection('runners_live').getList(1, 50, {
        filter: 'available=true',
        sort: '-last_seen',
      });
      // Show runners immediately without GPS
      setRunners(res.items);
      // Then try GPS in background to add distance
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const myLat = pos.coords.latitude;
          const myLng = pos.coords.longitude;
          setMyCoords({ lat: myLat, lng: myLng });
          setRunners(res.items.map((r:any) => ({
            ...r,
            dist: (r.lat && r.lng) ? distKm(myLat, myLng, r.lat, r.lng) : null,
          })).sort((a:any, b:any) => (a.dist ?? 999) - (b.dist ?? 999)));
        },
        () => {}, // GPS denied — already showing runners without distance
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } catch(e) {
      console.error(e);
      setRunners([]);
    } finally {
      setLoadingR(false);
    }
  };

  useEffect(() => { if (step === 2) loadRunners(); }, [step]);

  const selectedTask = TASKS.find(t => t.id === taskType);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:0 }}>
        {['Select Task','Task Details','Find Runners'].map((s,i) => (
          <div key={s} style={{ display:'flex', alignItems:'center', flex: i<2 ? 1 : 'unset' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800,
                background: step>=i ? '#16a34a' : '#f1f5f9', color: step>=i ? '#fff' : '#94a3b8', border:`2px solid ${step>=i?'#16a34a':'#e2e8f0'}` }}>{i+1}</div>
              <span style={{ fontSize:11, fontWeight:600, color: step>=i ? '#16a34a' : '#94a3b8', whiteSpace:'nowrap' as const }}>{s}</span>
            </div>
            {i<2 && <div style={{ flex:1, height:2, background: step>i ? '#16a34a' : '#e2e8f0', margin:'0 8px', marginBottom:16 }} />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Pick task ── */}
      {step === 0 && (
        <div>
          <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:18, marginBottom:16 }}>What do you need?</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:12, marginBottom:24 }}>
            {TASKS.map(t => (
              <button key={t.id} onClick={()=>setTaskType(t.id)}
                style={{ background: taskType===t.id ? '#f0fdf4' : '#fff', border:`2px solid ${taskType===t.id?'#16a34a':'#e2e8f0'}`, borderRadius:16, padding:'20px 14px', cursor:'pointer', fontFamily:'inherit', textAlign:'center' as const, transition:'all 0.15s' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>{t.icon}</div>
                <div style={{ fontWeight:700, color:'#0f172a', fontSize:14, marginBottom:4 }}>{t.label}</div>
                <div style={{ fontWeight:800, color:'#16a34a', fontSize:13 }}>{t.fee}</div>
                <div style={{ color:'#94a3b8', fontSize:11, marginTop:2 }}>{t.time}</div>
              </button>
            ))}
          </div>
          <button disabled={!taskType} onClick={()=>setStep(1)}
            style={{ width:'100%', padding:'15px', border:'none', borderRadius:14, fontWeight:800, fontSize:15, cursor:taskType?'pointer':'not-allowed', fontFamily:'inherit',
              background:taskType?'#16a34a':'#e2e8f0', color:taskType?'#fff':'#94a3b8', boxShadow:taskType?'0 4px 16px rgba(22,163,74,0.3)':'none' }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 1: Task details ── */}
      {step === 1 && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:18 }}>Task Details</h3>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>Your Address *</label>
            <input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Enter your full address"
              style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:700, color:'#475569', display:'block', marginBottom:6 }}>Items / Instructions</label>
            <textarea value={items} onChange={e=>setItems(e.target.value)} rows={3}
              placeholder="e.g. 2kg tomatoes, 1L milk, Paracetamol 500mg..."
              style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'12px 14px', fontSize:14, fontFamily:'inherit', outline:'none', resize:'none' as const, boxSizing:'border-box' as const }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={()=>setStep(0)} style={{ flex:1, padding:'13px', border:'1.5px solid #e2e8f0', borderRadius:12, color:'#475569', fontWeight:600, fontSize:14, cursor:'pointer', background:'#fff', fontFamily:'inherit' }}>← Back</button>
            <button disabled={!address} onClick={()=>setStep(2)}
              style={{ flex:2, padding:'13px', border:'none', borderRadius:12, fontWeight:800, fontSize:15, cursor:address?'pointer':'not-allowed', fontFamily:'inherit',
                background:address?'#16a34a':'#e2e8f0', color:address?'#fff':'#94a3b8' }}>
              Find Runners →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Runners list with contact ── */}
      {step === 2 && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
            <div>
              <h3 style={{ fontWeight:800, color:'#0f172a', fontSize:18 }}>Available Runners</h3>
              <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>
                {myCoords ? '📍 Sorted by distance from you' : '🟢 All online runners shown'}
              </p>
            </div>
            <button onClick={loadRunners}
              style={{ background:'#f0fdf4', border:'1px solid #d1fae5', borderRadius:10, padding:'8px 16px', fontSize:13, color:'#16a34a', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              🔄 Refresh
            </button>
          </div>

          {/* Request summary */}
          <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:14, padding:'14px 16px', marginBottom:20 }}>
            <div style={{ fontWeight:700, color:'#475569', fontSize:12, marginBottom:6 }}>📋 YOUR REQUEST</div>
            <div style={{ color:'#0f172a', fontWeight:600 }}>{selectedTask?.icon} {selectedTask?.label} · 📍 {address}</div>
            {items && <div style={{ color:'#64748b', fontSize:13, marginTop:4 }}>Items: {items}</div>}
          </div>

          {loadingR ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div className="spinner" style={{ margin:'0 auto 12px' }} />
              <p style={{ color:'#94a3b8', fontSize:14 }}>Finding runners…</p>
            </div>
          ) : runners.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px', background:'#f8fafc', borderRadius:16, border:'1px dashed #e2e8f0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🛵</div>
              <div style={{ fontWeight:700, color:'#334155', fontSize:16 }}>No runners online right now</div>
              <div style={{ color:'#94a3b8', fontSize:14, marginTop:6, marginBottom:16 }}>
                Try again in a few minutes, or ask someone to go online as a runner.
              </div>
              <button onClick={loadRunners}
                style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:10, padding:'12px 24px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
                🔄 Try Again
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {runners.map((r:any, i:number) => {
                const waMsg = encodeURIComponent(
                  `Hi ${r.name || 'Runner'}, I need a ${selectedTask?.label || 'delivery'} from UrbanServe.\n📍 Pickup: ${address}\n📦 Items: ${items || 'Will share details'}\nAre you available?`
                );
                return (
                  <div key={r.id || i} style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:18, padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* Runner info row */}
                    <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:54, height:54, borderRadius:'50%', background:'linear-gradient(135deg,#0f172a,#334155)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🛵</div>
                        <div style={{ position:'absolute', bottom:1, right:1, width:13, height:13, background:'#16a34a', borderRadius:'50%', border:'2px solid #fff' }} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, color:'#0f172a', fontSize:16 }}>{r.name || 'Runner'}</div>
                        {r.task && <div style={{ color:'#64748b', fontSize:13, marginTop:2 }}>🛠 {r.task}</div>}
                        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' as const }}>
                          <span style={{ background:'#f0fdf4', color:'#16a34a', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:700, border:'1px solid #d1fae5' }}>🟢 Online</span>
                          {r.dist !== null && r.dist !== undefined && (
                            <span style={{ background:'#eff6ff', color:'#3b82f6', borderRadius:99, padding:'3px 10px', fontSize:11, fontWeight:700, border:'1px solid #bfdbfe' }}>
                              📍 {r.dist} km away
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact buttons */}
                    {r.phone ? (
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                        <a href={`tel:${r.phone}`} style={{ textDecoration:'none' }}>
                          <button style={{ width:'100%', background:'#16a34a', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 3px 12px rgba(22,163,74,0.3)' }}>
                            📞 Call Runner
                          </button>
                        </a>
                        <a href={`https://wa.me/91${r.phone}?text=${waMsg}`} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
                          <button style={{ width:'100%', background:'#25D366', color:'#fff', border:'none', borderRadius:12, padding:'13px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                            💬 WhatsApp
                          </button>
                        </a>
                      </div>
                    ) : (
                      <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:10, padding:'11px 14px', color:'#dc2626', fontSize:13, fontWeight:600, textAlign:'center' as const }}>
                        ⚠️ Runner has not added a phone number yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button onClick={()=>setStep(1)}
            style={{ marginTop:20, width:'100%', padding:'13px', border:'1.5px solid #e2e8f0', borderRadius:12, color:'#475569', fontWeight:600, fontSize:14, cursor:'pointer', background:'#fff', fontFamily:'inherit' }}>
            ← Change Task or Address
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function PickDropPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'choose'|'runner'|'customer'>('choose');

  if (loading) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return (
    <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Outfit',sans-serif", padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🛵</div>
        <h2 style={{ fontWeight:900, color:'#0f172a', fontSize:22, marginBottom:8 }}>Sign in to continue</h2>
        <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>Login to book a runner or go online as a runner.</p>
        <button onClick={()=>router.push('/login')} style={{ background:'#16a34a', color:'#fff', border:'none', borderRadius:14, padding:'14px 36px', fontWeight:800, fontSize:15, cursor:'pointer', fontFamily:'inherit' }}>Sign In →</button>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Outfit',sans-serif", background:'#f8fafc', minHeight:'100vh' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', padding:'44px 24px 60px' }}>
        <div style={{ maxWidth:1400, margin:'0 auto' }}>
          <h1 style={{ fontSize:'clamp(24px,3vw,40px)', fontWeight:900, color:'#fff', marginBottom:8 }}>🛵 Pick & Drop</h1>
          <p style={{ color:'rgba(255,255,255,0.65)', fontSize:15 }}>Live runners near you · Direct call · No commission</p>
        </div>
      </div>

      <div style={{ maxWidth:1400, margin:'-20px auto 0', padding:'0 24px 60px' }}>
        <div style={{ maxWidth:700, margin:'0 auto' }}>

          {/* Mode chooser */}
          {mode === 'choose' && (
            <div className="slide-down" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'#fff', borderRadius:20, padding:'12px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <button onClick={()=>setMode('customer')} style={{ background:'linear-gradient(135deg,#16a34a,#22c55e)', border:'none', borderRadius:14, padding:'28px 20px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, boxShadow:'0 4px 16px rgba(22,163,74,0.3)' }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>📦</div>
                    <div style={{ fontWeight:900, color:'#fff', fontSize:17, marginBottom:4 }}>I Need a Runner</div>
                    <div style={{ color:'rgba(255,255,255,0.75)', fontSize:13 }}>Groceries, parcels, medicine & more</div>
                  </button>
                  <button onClick={()=>setMode('runner')} style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', border:'none', borderRadius:14, padding:'28px 20px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>🛵</div>
                    <div style={{ fontWeight:900, color:'#fff', fontSize:17, marginBottom:4 }}>I Am a Runner</div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>Go online & earn ₹39–₹150/trip</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Runner mode */}
          {mode === 'runner' && (
            <div className="slide-down">
              <button onClick={()=>setMode('choose')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'#475569', fontWeight:600, fontSize:14, cursor:'pointer', marginBottom:20, fontFamily:'inherit', padding:0 }}>
                ← Back
              </button>
              <RunnerMode user={user} profile={profile} />
            </div>
          )}

          {/* Customer mode */}
          {mode === 'customer' && (
            <div className="slide-down">
              <button onClick={()=>setMode('choose')} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'#475569', fontWeight:600, fontSize:14, cursor:'pointer', marginBottom:20, fontFamily:'inherit', padding:0 }}>
                ← Back
              </button>
              <div style={{ background:'#fff', borderRadius:20, padding:28, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
                <CustomerMode user={user} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
