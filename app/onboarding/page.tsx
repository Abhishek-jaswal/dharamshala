'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { getPb } from '../lib/pocketbase';

// ─── translations ────────────────────────────────────────────────────────────
const LANG = {
  en: {
    toggle: 'हिंदी में बदलें',
    step: (c:number,t:number) => `Step ${c} of ${t}`,
    back: 'Back', next: 'Next', submit: 'Submit', saving: 'Saving…',
    skip: 'Skip for now',
    qs: [
      { q:"What's your full name?",            ph:'Enter your full name',         type:'text'      },
      { q:'Your date of birth?',               ph:'Select your date of birth',    type:'date'      },
      { q:'Your contact number?',              ph:'10-digit mobile number',       type:'tel'       },
      { q:'What are your skills?',             ph:'Choose all that apply',        type:'multi'     },
      { q:'What are your interests?',          ph:'Pick your interests',          type:'interests' },
      { q:'Which state are you from?',         ph:'Select your state',            type:'location'  },
      { q:'Upload your Aadhaar card',          ph:'JPG / PNG, max 5 MB',         type:'file'      },
    ],
  },
  hi: {
    toggle: 'Switch to English',
    step: (c:number,t:number) => `चरण ${c} / ${t}`,
    back: 'वापस', next: 'आगे', submit: 'जमा करें', saving: 'सहेज रहे हैं…',
    skip: 'अभी के लिए छोड़ें',
    qs: [
      { q:'आपका पूरा नाम क्या है?',       ph:'अपना पूरा नाम लिखें',          type:'text'      },
      { q:'आपकी जन्म तिथि?',              ph:'जन्म तिथि चुनें',              type:'date'      },
      { q:'आपका संपर्क नंबर?',             ph:'10 अंकों का मोबाइल नंबर',    type:'tel'       },
      { q:'आपके कौशल क्या हैं?',           ph:'सभी लागू विकल्प चुनें',       type:'multi'     },
      { q:'आपकी रुचियाँ क्या हैं?',        ph:'अपनी रुचियाँ चुनें',          type:'interests' },
      { q:'आप किस राज्य से हैं?',          ph:'अपना राज्य चुनें',             type:'location'  },
      { q:'अपना आधार कार्ड अपलोड करें',   ph:'JPG / PNG, अधिकतम 5 MB',     type:'file'      },
    ],
  },
};

const SKILLS_EN = ['Cooking','Farming','Carpentry','Tailoring','Driving','Teaching','Nursing','Plumbing','Electrical','IT/Computer','Painting','Masonry','Photography','Music','Welding'];
const SKILLS_HI = ['खाना पकाना','खेती','बढ़ईगीरी','सिलाई','ड्राइविंग','शिक्षण','नर्सिंग','प्लंबिंग','इलेक्ट्रिकल','IT/कंप्यूटर','चित्रकारी','राजमिस्त्री','फोटोग्राफी','संगीत','वेल्डिंग'];

const INTERESTS_EN = ['Sports','Travel','Reading','Music','Art','Cooking','Technology','Farming','Business','Social Work','Yoga','Cinema','Nature','Fitness'];
const INTERESTS_HI = ['खेल','यात्रा','पढ़ना','संगीत','कला','खाना','तकनीक','खेती','व्यापार','सामाजिक कार्य','योग','सिनेमा','प्रकृति','फिटनेस'];

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

// canonical English keys always stored
const SKILL_KEYS   = SKILLS_EN;
const INTEREST_KEYS = INTERESTS_EN;

export default function OnboardingPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [lang, setLang] = useState<'en'|'hi'>('en');
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [slideDir, setSlideDir] = useState<'l'|'r'>('l');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [ans, setAns] = useState({
    name:'', dob:'', contact:'', skills:[] as string[],
    interests:[] as string[], location:'', aadhaar:null as File|null,
  });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);

  const t  = LANG[lang];
  const q  = t.qs[step];
  const total = t.qs.length;

  const skillsDisplay   = lang==='en' ? SKILLS_EN   : SKILLS_HI;
  const interestsDisplay = lang==='en' ? INTERESTS_EN : INTERESTS_HI;

  const canNext = () => {
    if (q.type==='text')     return ans.name.trim().length > 1;
    if (q.type==='date')     return !!ans.dob;
    if (q.type==='tel')      return /^\d{10}$/.test(ans.contact);
    if (q.type==='multi')    return ans.skills.length > 0;
    if (q.type==='interests')return ans.interests.length > 0;
    if (q.type==='location') return !!ans.location;
    return true;
  };

  const transition = (nextStep:number) => {
    setSlideDir(nextStep > step ? 'l' : 'r');
    setVisible(false);
    setTimeout(() => { setStep(nextStep); setVisible(true); }, 200);
  };

  const toggleSkill = (key:string) => setAns(a => ({
    ...a, skills: a.skills.includes(key) ? a.skills.filter(x=>x!==key) : [...a.skills, key],
  }));
  const toggleInterest = (key:string) => setAns(a => ({
    ...a, interests: a.interests.includes(key) ? a.interests.filter(x=>x!==key) : [...a.interests, key],
  }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const pb = getPb();
      const fd = new FormData();
      fd.append('user_id',   user.id);
      fd.append('name',      ans.name);
      fd.append('dob',       ans.dob);
      fd.append('contact',   ans.contact);
      fd.append('skills',    ans.skills.join(', '));
      fd.append('interests', ans.interests.join(', '));
      fd.append('location',  ans.location);
      if (ans.aadhaar) fd.append('aadhaar', ans.aadhaar);
      await pb.collection('profiles').create(fd);
      await pb.collection('users').update(user.id, { name: ans.name });
      refreshProfile();
      router.push('/dashboard');
    } catch(e:any) {
      setError(lang==='en' ? 'Something went wrong. Try again.' : 'कुछ गलत हुआ। फिर कोशिश करें।');
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div style={styles.root}>
      {/* ── top bar ── */}
      <div style={styles.topbar}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏠</span>
          <span style={styles.logoText}>Dharamshala</span>
        </div>
        <button style={styles.langBtn} onClick={() => setLang(l => l==='en'?'hi':'en')}>
          🌐 {t.toggle}
        </button>
      </div>

      {/* ── progress ── */}
      <div style={styles.progressWrap}>
        <div style={styles.progressBg}>
          <div style={{...styles.progressFill, width:`${((step+1)/total)*100}%`}} />
        </div>
        <span style={styles.stepLabel}>{t.step(step+1, total)}</span>
      </div>

      {/* ── card ── */}
      <div style={styles.center}>
        <div style={{
          ...styles.card,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : slideDir==='l' ? 'translateY(16px)' : 'translateY(-16px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}>
          <p style={styles.question}>{q.q}</p>
          <p style={styles.hint}>{q.ph}</p>

          {/* ── text ── */}
          {q.type==='text' && (
            <input autoFocus style={styles.input}
              placeholder={lang==='en'?'Type here…':'यहाँ लिखें…'}
              value={ans.name}
              onChange={e => setAns(a=>({...a, name:e.target.value}))}
              onKeyDown={e => e.key==='Enter' && canNext() && (step<total-1?transition(step+1):handleSubmit())}
            />
          )}

          {/* ── date ── */}
          {q.type==='date' && (
            <input type="date" style={styles.input}
              value={ans.dob}
              max={new Date().toISOString().split('T')[0]}
              onChange={e => setAns(a=>({...a, dob:e.target.value}))}
            />
          )}

          {/* ── tel ── */}
          {q.type==='tel' && (
            <div style={styles.telWrap}>
              <span style={styles.telPrefix}>+91</span>
              <input autoFocus style={{...styles.input, ...styles.telInput}}
                placeholder="9876543210" maxLength={10}
                value={ans.contact}
                onChange={e => setAns(a=>({...a, contact:e.target.value.replace(/\D/g,'')}))}
                onKeyDown={e => e.key==='Enter' && canNext() && transition(step+1)}
              />
            </div>
          )}

          {/* ── skills ── */}
          {q.type==='multi' && (
            <div style={styles.tags}>
              {skillsDisplay.map((s,i) => (
                <button key={i}
                  style={ans.skills.includes(SKILL_KEYS[i]) ? styles.tagActive : styles.tag}
                  onClick={() => toggleSkill(SKILL_KEYS[i])}
                >{s}</button>
              ))}
            </div>
          )}

          {/* ── interests ── */}
          {q.type==='interests' && (
            <div style={styles.tags}>
              {interestsDisplay.map((s,i) => (
                <button key={i}
                  style={ans.interests.includes(INTEREST_KEYS[i]) ? styles.tagActive : styles.tag}
                  onClick={() => toggleInterest(INTEREST_KEYS[i])}
                >{s}</button>
              ))}
            </div>
          )}

          {/* ── location ── */}
          {q.type==='location' && (
            <select style={styles.select}
              value={ans.location}
              onChange={e => setAns(a=>({...a, location:e.target.value}))}
            >
              <option value="">{lang==='en'?'— Select your state —':'— राज्य चुनें —'}</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}

          {/* ── file ── */}
          {q.type==='file' && (
            <div style={ans.aadhaar ? styles.fileDone : styles.fileDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
                onChange={e => setAns(a=>({...a, aadhaar:e.target.files?.[0]||null}))}
              />
              <div style={styles.fileIcon}>{ans.aadhaar ? '✅' : '📄'}</div>
              <p style={styles.fileName}>
                {ans.aadhaar ? ans.aadhaar.name : (lang==='en'?'Click to upload':'अपलोड करें')}
              </p>
              <p style={styles.fileSub}>
                {ans.aadhaar
                  ? (lang==='en'?'Click to change':'बदलने के लिए क्लिक करें')
                  : (lang==='en'?'JPG or PNG, max 5MB':'JPG या PNG, 5MB तक')}
              </p>
            </div>
          )}

          {error && <p style={styles.error}>{error}</p>}

          {/* ── buttons ── */}
          <div style={styles.btnRow}>
            {step > 0 && (
              <button style={styles.btnBack} onClick={() => transition(step-1)}>
                ← {t.back}
              </button>
            )}
            <div style={{flex:1}} />
            {step < total-1 ? (
              <button
                style={canNext() ? styles.btnNext : styles.btnNextDisabled}
                onClick={() => canNext() && transition(step+1)}
              >{t.next} →</button>
            ) : (
              <button
                style={submitting ? styles.btnNextDisabled : styles.btnNext}
                onClick={handleSubmit} disabled={submitting}
              >{submitting ? t.saving : t.submit}</button>
            )}
          </div>

          {/* skip only for file */}
          {q.type==='file' && !ans.aadhaar && (
            <p style={styles.skip} onClick={() => step<total-1?transition(step+1):handleSubmit()}>
              {t.skip}
            </p>
          )}

          {/* ── dots ── */}
          <div style={styles.dots}>
            {Array.from({length:total}).map((_,i)=>(
              <div key={i} style={i===step?styles.dotActive:i<step?styles.dotDone:styles.dot} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── styles ────────────────────────────────────────────────────────────────
const base = { fontFamily:"'Plus Jakarta Sans',sans-serif" } as const;
const styles:Record<string,React.CSSProperties> = {
  root:{...base, minHeight:'100vh', display:'flex', flexDirection:'column',
    background:'linear-gradient(160deg,#f0fdf4 0%,#dcfce7 60%,#bbf7d0 100%)'},
  topbar:{display:'flex',alignItems:'center',justifyContent:'space-between',
    padding:'14px 28px',background:'rgba(255,255,255,0.75)',
    backdropFilter:'blur(12px)',borderBottom:'1px solid #d1fae5'},
  logo:{display:'flex',alignItems:'center',gap:8},
  logoIcon:{fontSize:'1.3rem'},
  logoText:{fontWeight:800,fontSize:'1rem',color:'#14532d'},
  langBtn:{padding:'7px 16px',background:'white',color:'#16a34a',
    border:'1.5px solid #d1fae5',borderRadius:20,cursor:'pointer',
    fontFamily:'inherit',fontSize:'0.83rem',fontWeight:600},
  progressWrap:{display:'flex',alignItems:'center',gap:14,padding:'16px 28px 0'},
  progressBg:{flex:1,height:6,background:'#d1fae5',borderRadius:99,overflow:'hidden'},
  progressFill:{height:'100%',background:'linear-gradient(90deg,#16a34a,#4ade80)',
    borderRadius:99,transition:'width 0.4s ease'},
  stepLabel:{fontSize:'0.8rem',fontWeight:600,color:'#4b7a5a',whiteSpace:'nowrap'},
  center:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'28px 20px'},
  card:{background:'rgba(255,255,255,0.92)',border:'1px solid rgba(255,255,255,0.95)',
    borderRadius:28,padding:'44px 40px',width:'100%',maxWidth:540,
    boxShadow:'0 16px 48px rgba(22,163,74,0.10)'},
  question:{fontSize:'1.5rem',fontWeight:800,color:'#14532d',lineHeight:1.3,marginBottom:8},
  hint:{fontSize:'0.88rem',color:'#6b9a7a',marginBottom:28},
  input:{width:'100%',padding:'14px 18px',background:'#f0fdf4',
    border:'2px solid #d1fae5',borderRadius:14,fontSize:'1rem',
    fontFamily:'inherit',color:'#14532d',outline:'none',
    transition:'border-color 0.2s',boxSizing:'border-box'},
  telWrap:{display:'flex',alignItems:'center',background:'#f0fdf4',
    border:'2px solid #d1fae5',borderRadius:14,overflow:'hidden'},
  telPrefix:{padding:'14px 14px 14px 18px',fontWeight:700,color:'#16a34a',
    borderRight:'2px solid #d1fae5'},
  telInput:{border:'none !important',borderRadius:'0 !important',
    background:'transparent !important',paddingLeft:12},
  tags:{display:'flex',flexWrap:'wrap',gap:10,marginBottom:8},
  tag:{padding:'9px 18px',background:'#f0fdf4',border:'2px solid #d1fae5',
    borderRadius:99,fontFamily:'inherit',fontSize:'0.88rem',fontWeight:500,
    color:'#4b7a5a',cursor:'pointer',transition:'all 0.15s'},
  tagActive:{padding:'9px 18px',background:'linear-gradient(135deg,#16a34a,#22c55e)',
    border:'2px solid transparent',borderRadius:99,fontFamily:'inherit',
    fontSize:'0.88rem',fontWeight:600,color:'white',cursor:'pointer',
    boxShadow:'0 2px 10px rgba(22,163,74,0.3)'},
  select:{width:'100%',padding:'14px 18px',background:'#f0fdf4',
    border:'2px solid #d1fae5',borderRadius:14,fontFamily:'inherit',
    fontSize:'1rem',color:'#14532d',outline:'none',cursor:'pointer'},
  fileDrop:{border:'2px dashed #86efac',borderRadius:16,padding:'36px 24px',
    textAlign:'center',cursor:'pointer',transition:'all 0.2s',background:'#f0fdf4'},
  fileDone:{border:'2px solid #4ade80',borderRadius:16,padding:'36px 24px',
    textAlign:'center',cursor:'pointer',background:'#f0fdf4'},
  fileIcon:{fontSize:'2.2rem',marginBottom:10},
  fileName:{fontWeight:700,color:'#14532d',marginBottom:4,fontSize:'0.95rem'},
  fileSub:{fontSize:'0.8rem',color:'#6b9a7a'},
  error:{color:'#dc2626',fontSize:'0.85rem',marginBottom:12,fontWeight:500},
  btnRow:{display:'flex',alignItems:'center',gap:12,marginTop:32},
  btnBack:{padding:'12px 22px',background:'white',color:'#4b7a5a',
    border:'1.5px solid #d1fae5',borderRadius:12,cursor:'pointer',
    fontFamily:'inherit',fontSize:'0.9rem',fontWeight:600},
  btnNext:{padding:'12px 28px',background:'linear-gradient(135deg,#16a34a,#22c55e)',
    color:'white',border:'none',borderRadius:12,cursor:'pointer',
    fontFamily:'inherit',fontSize:'0.95rem',fontWeight:700,
    boxShadow:'0 4px 16px rgba(22,163,74,0.3)'},
  btnNextDisabled:{padding:'12px 28px',background:'#d1fae5',
    color:'#86b899',border:'none',borderRadius:12,cursor:'not-allowed',
    fontFamily:'inherit',fontSize:'0.95rem',fontWeight:700},
  skip:{textAlign:'center',marginTop:16,fontSize:'0.83rem',color:'#86b899',
    cursor:'pointer',textDecoration:'underline'},
  dots:{display:'flex',justifyContent:'center',gap:8,marginTop:28},
  dot:{width:8,height:8,borderRadius:99,background:'#d1fae5'},
  dotActive:{width:24,height:8,borderRadius:99,background:'#16a34a',transition:'width 0.3s'},
  dotDone:{width:8,height:8,borderRadius:99,background:'#4ade80'},
};
