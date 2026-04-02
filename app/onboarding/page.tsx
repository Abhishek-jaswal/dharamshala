'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import { SKILLS_EN, SKILLS_HI, INTERESTS_EN, INTERESTS_HI, STATES } from '@/lib/data';

export default function OnboardingPage() {
  const { user, loading, profile, refreshProfile } = useAuth();
  const { lang, toggle, t } = useLang();
  const router = useRouter();
  const ob = t.onboarding;
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [ans, setAns] = useState({ name: '', dob: '', contact: '', skills: [] as string[], interests: [] as string[], location: '', role: '', aadhaar: null as File | null });

  useEffect(() => { if (!loading && !user) router.push('/login'); }, [user, loading]);
  useEffect(() => {
    if (profile) setAns(a => ({ ...a, name: profile.name || '', dob: profile.dob || '', contact: profile.contact || '', skills: profile.skills ? profile.skills.split(', ').filter(Boolean) : [], interests: profile.interests ? profile.interests.split(', ').filter(Boolean) : [], location: profile.location || '', role: profile.role || '' }));
  }, [profile]);

  const total = ob.qs.length;
  const q = ob.qs[step];
  const skillsDisplay = lang === 'en' ? SKILLS_EN : SKILLS_HI;
  const interestsDisplay = lang === 'en' ? INTERESTS_EN : INTERESTS_HI;

  const canNext = () => {
    if (q.type === 'text') return ans.name.trim().length > 1;
    if (q.type === 'date') return !!ans.dob;
    if (q.type === 'tel') return /^\d{10}$/.test(ans.contact);
    if (q.type === 'skills') return ans.skills.length > 0;
    if (q.type === 'interests') return ans.interests.length > 0;
    if (q.type === 'location') return !!ans.location;
    if (q.type === 'role') return !!ans.role;
    return true;
  };

  const go = (next: number) => {
    setVisible(false);
    setTimeout(() => { setStep(next); setVisible(true); }, 160);
  };

  const toggle2 = (key: string, field: 'skills' | 'interests') =>
    setAns(a => ({ ...a, [field]: a[field].includes(key) ? a[field].filter(x => x !== key) : [...a[field], key] }));

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const pb = getPb();
      const fd = new FormData();
      fd.append('user', user.id); fd.append('name', ans.name); fd.append('dob', ans.dob);
      fd.append('contact', ans.contact); fd.append('skills', ans.skills.join(', '));
      fd.append('interests', ans.interests.join(', ')); fd.append('location', ans.location); fd.append('role', ans.role);
      if (ans.aadhaar) fd.append('aadhaar', ans.aadhaar);
      if (profile?.id) await pb.collection('profiles').update(profile.id, fd);
      else await pb.collection('profiles').create(fd);
      await pb.collection('users').update(user.id, { name: ans.name });
      refreshProfile();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 40, 60]);
      router.push('/dashboard');
    } catch { setError(lang === 'hi' ? 'कुछ गलत हुआ। फिर कोशिश करें।' : 'Something went wrong. Try again.'); setSubmitting(false); }
  };

  if (loading || !user) return null;

  const ROLES_DISPLAY = lang === 'en' ? ['Looking for Work', 'Hiring Workers', 'Both'] : ['काम की तलाश में', 'वर्कर्स किराए पर लेना', 'दोनों'];
  const ROLES_KEYS = ['worker', 'employer', 'both'];

  const inp: React.CSSProperties = { width: '100%', border: '1.5px solid #d1fae5', borderRadius: 12, padding: '12px 14px', fontSize: 15, color: '#14532d', fontFamily: 'inherit', outline: 'none', background: '#f0fdf4', boxSizing: 'border-box' };
  const chip = (active: boolean): React.CSSProperties => ({ padding: '8px 18px', borderRadius: 99, fontSize: 14, fontWeight: 600, border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', borderColor: active ? '#16a34a' : '#d1fae5', background: active ? '#16a34a' : '#f0fdf4', color: active ? '#fff' : '#15803d', transition: 'all 0.15s' });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,#f0fdf4,#dcfce7 60%,#bbf7d0)', fontFamily: "'Outfit',sans-serif" }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #d1fae5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: '#14532d', fontSize: 16 }}>
          <div style={{ width: 28, height: 28, background: '#16a34a', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>U</div>
          UrbanServe
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {profile && <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#16a34a', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>← Dashboard</button>}
          <button onClick={toggle} style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 20, border: '1px solid #d1fae5', color: '#16a34a', background: '#fff', cursor: 'pointer' }}>🌐 {t.toggle}</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px' }}>
        <div style={{ flex: 1, height: 5, background: '#d1fae5', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#16a34a,#4ade80)', borderRadius: 99, width: `${((step + 1) / total) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#4b7a5a', whiteSpace: 'nowrap' }}>{ob.step(step + 1, total)}</span>
      </div>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ width: '100%', maxWidth: 500, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.16s,transform 0.16s' }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 24, padding: '36px 28px', boxShadow: '0 16px 48px rgba(22,163,74,0.10)' }}>
            {step === 0 && <div style={{ marginBottom: 20 }}><h1 style={{ fontSize: 20, fontWeight: 900, color: '#14532d' }}>{ob.title}</h1><p style={{ fontSize: 13, color: '#4b7a5a', marginTop: 4 }}>{ob.sub}</p></div>}
            <p style={{ fontSize: 19, fontWeight: 800, color: '#14532d', marginBottom: 6 }}>{q.q}</p>
            <p style={{ fontSize: 13, color: '#86b899', marginBottom: 22 }}>{q.ph}</p>

            {q.type === 'text' && <input autoFocus style={inp} placeholder={lang === 'en' ? 'Type here…' : 'यहाँ लिखें…'} value={ans.name} onChange={e => setAns(a => ({ ...a, name: e.target.value }))} onKeyDown={e => e.key === 'Enter' && canNext() && (step < total - 1 ? go(step + 1) : handleSubmit())} />}
            {q.type === 'date' && <input type="date" style={inp} value={ans.dob} max={new Date().toISOString().split('T')[0]} onChange={e => setAns(a => ({ ...a, dob: e.target.value }))} />}
            {q.type === 'tel' && (
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #d1fae5', borderRadius: 12, overflow: 'hidden', background: '#f0fdf4' }}>
                <span style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a', borderRight: '1.5px solid #d1fae5', fontSize: 15 }}>+91</span>
                <input autoFocus style={{ ...inp, border: 'none', borderRadius: 0, background: 'transparent', paddingLeft: 12 }} placeholder="9876543210" maxLength={10} value={ans.contact} onChange={e => setAns(a => ({ ...a, contact: e.target.value.replace(/\D/g, '') }))} onKeyDown={e => e.key === 'Enter' && canNext() && go(step + 1)} />
                {/^\d{10}$/.test(ans.contact) && <span style={{ paddingRight: 12, color: '#16a34a', fontWeight: 700 }}>✓</span>}
              </div>
            )}
            {q.type === 'skills' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{skillsDisplay.map((s, i) => <button key={i} onClick={() => toggle2(SKILLS_EN[i], 'skills')} style={chip(ans.skills.includes(SKILLS_EN[i]))}>{s}</button>)}</div>}
            {q.type === 'interests' && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{interestsDisplay.map((s, i) => <button key={i} onClick={() => toggle2(INTERESTS_EN[i], 'interests')} style={chip(ans.interests.includes(INTERESTS_EN[i]))}>{s}</button>)}</div>}
            {q.type === 'location' && <select style={inp} value={ans.location} onChange={e => setAns(a => ({ ...a, location: e.target.value }))}><option value="">{lang === 'en' ? '— Select state —' : '— राज्य चुनें —'}</option>{STATES.map(s => <option key={s} value={s}>{s}</option>)}</select>}
            {q.type === 'role' && <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{ROLES_DISPLAY.map((r, i) => <button key={i} onClick={() => setAns(a => ({ ...a, role: ROLES_KEYS[i] }))} style={{ ...chip(ans.role === ROLES_KEYS[i]), padding: '12px 18px', textAlign: 'left', borderRadius: 12 }}>{r}</button>)}</div>}
            {q.type === 'file' && (
              <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${ans.aadhaar ? '#16a34a' : '#d1fae5'}`, borderRadius: 16, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: ans.aadhaar ? '#f0fdf4' : '#fafafa', transition: 'all 0.2s' }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setAns(a => ({ ...a, aadhaar: e.target.files?.[0] || null }))} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>{ans.aadhaar ? '✅' : '📄'}</div>
                <p style={{ fontWeight: 700, color: '#14532d', fontSize: 14, marginBottom: 4 }}>{ans.aadhaar ? ans.aadhaar.name : (lang === 'en' ? 'Click to upload' : 'अपलोड करें')}</p>
                <p style={{ fontSize: 12, color: '#86b899' }}>{ans.aadhaar ? (lang === 'en' ? 'Click to change' : 'बदलें') : 'JPG, PNG — max 5MB'}</p>
              </div>
            )}

            {error && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 10, fontWeight: 500 }}>{error}</p>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28 }}>
              {step > 0 && <button onClick={() => go(step - 1)} style={{ padding: '11px 20px', border: '1.5px solid #d1fae5', borderRadius: 12, color: '#15803d', fontWeight: 600, fontSize: 14, cursor: 'pointer', background: '#fff', fontFamily: 'inherit' }}>← {ob.back}</button>}
              <div style={{ flex: 1 }} />
              {step < total - 1
                ? <button onClick={() => canNext() && go(step + 1)} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: canNext() ? '#16a34a' : '#d1fae5', color: canNext() ? '#fff' : '#86b899', fontWeight: 700, fontSize: 14, cursor: canNext() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: canNext() ? '0 4px 12px rgba(22,163,74,0.25)' : 'none' }}>{ob.next} →</button>
                : <button onClick={handleSubmit} disabled={submitting} style={{ padding: '11px 24px', borderRadius: 12, border: 'none', background: submitting ? '#d1fae5' : '#16a34a', color: submitting ? '#86b899' : '#fff', fontWeight: 700, fontSize: 14, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{submitting ? ob.saving : ob.submit}</button>
              }
            </div>
            {q.type === 'file' && !ans.aadhaar && <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#86b899', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => step < total - 1 ? go(step + 1) : handleSubmit()}>{ob.skip}</p>}

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
              {Array.from({ length: total }).map((_, i) => <div key={i} style={{ height: 6, width: i === step ? 24 : 7, borderRadius: 99, background: i === step ? '#16a34a' : i < step ? '#4ade80' : '#d1fae5', transition: 'all 0.3s' }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}