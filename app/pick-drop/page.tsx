'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';

const TASKS = [
  { id: 'grocery',  icon: '🛒', label: 'Grocery Run',      labelHi: 'किराने का सामान', desc: 'Any supermarket or kirana store',  descHi: 'कोई भी सुपरमार्केट या किराना', fee: '₹49' },
  { id: 'medicine', icon: '💊', label: 'Medicine Pickup',  labelHi: 'दवाइयां',          desc: 'Chemist / pharmacy near you',      descHi: 'नजदीकी दवा की दुकान',          fee: '₹39' },
  { id: 'parcel',   icon: '📦', label: 'Parcel Delivery',  labelHi: 'पार्सल डिलीवरी',  desc: 'Send or receive packages locally', descHi: 'स्थानीय पार्सल भेजें/पाएं',    fee: '₹59' },
  { id: 'document', icon: '📄', label: 'Document Courier', labelHi: 'दस्तावेज़ कूरियर', desc: 'Offices, banks, courier hubs',     descHi: 'दफ्तर, बैंक, कूरियर हब',       fee: '₹49' },
  { id: 'shop',     icon: '🏪', label: 'Buy From Shop',    labelHi: 'दुकान से खरीदें',  desc: 'Send a list — runner buys for you',descHi: 'लिस्ट भेजें — रनर खरीदेगा',    fee: '₹69' },
  { id: 'food',     icon: '🍱', label: 'Tiffin / Food',    labelHi: 'टिफिन / खाना',    desc: 'Pick up food from any restaurant', descHi: 'किसी भी रेस्टोरेंट से खाना',   fee: '₹39' },
];

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1fae5', borderRadius: 12,
  padding: '10px 14px', fontSize: 14, color: '#14532d', fontFamily: 'inherit',
  outline: 'none', background: '#f0fdf4', boxSizing: 'border-box',
};

const btnPrimary = (disabled = false): React.CSSProperties => ({
  flex: 1, padding: '13px', border: 'none', borderRadius: 14,
  background: disabled ? '#d1fae5' : '#16a34a',
  color: disabled ? '#86b899' : '#fff',
  fontWeight: 700, fontSize: 14,
  cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
});

const btnSecondary: React.CSSProperties = {
  flex: 1, padding: '13px', border: '1.5px solid #d1fae5', borderRadius: 14,
  background: '#fff', color: '#15803d', fontWeight: 600, fontSize: 14,
  cursor: 'pointer', fontFamily: 'inherit',
};

export default function PickDropPage() {
  const { lang } = useLang();
  const [step,     setStep]     = useState(0);
  const [taskType, setTaskType] = useState('');

  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
      {['Select Task', 'Task Details', 'Confirm & Pay'].map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
            border: '2px solid', flexShrink: 0,
            borderColor: step >= i ? '#16a34a' : '#d1fae5',
            background: step >= i ? '#16a34a' : 'transparent',
            color: step >= i ? '#fff' : '#86b899',
          }}>{i + 1}</div>
          <span style={{ fontSize: 12, fontWeight: 500, color: step >= i ? '#15803d' : '#86b899', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{s}</span>
          {i < 2 && <div style={{ flex: 1, height: 2, background: step > i ? '#16a34a' : '#d1fae5', borderRadius: 2 }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#14532d' }}>🛵 {lang === 'hi' ? 'पिक & ड्रॉप रनर' : 'Pick & Drop Runner'}</h1>
        <p style={{ color: '#16a34a', fontSize: 13, marginTop: 4 }}>{lang === 'hi' ? 'अपने इलाके में किसी भी काम के लिए एक सत्यापित रनर भेजें' : 'Send a nearby verified runner for any errand in your area'}</p>
      </div>
      <StepBar />

      {/* Step 0 – Select task */}
      {step === 0 && (
        <div>
          <h3 style={{ fontWeight: 700, color: '#14532d', marginBottom: 16 }}>{lang === 'hi' ? 'आपको क्या चाहिए?' : 'What do you need?'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
            {TASKS.map(tt => (
              <div key={tt.id} onClick={() => setTaskType(tt.id)} style={{
                cursor: 'pointer', borderRadius: 16, padding: 20, border: '2px solid',
                textAlign: 'center', transition: 'all 0.15s',
                borderColor: taskType === tt.id ? '#16a34a' : '#d1fae5',
                background: taskType === tt.id ? '#f0fdf4' : '#fff',
              }}
                onMouseEnter={e => { if (taskType !== tt.id) (e.currentTarget as HTMLElement).style.borderColor = '#86efac'; }}
                onMouseLeave={e => { if (taskType !== tt.id) (e.currentTarget as HTMLElement).style.borderColor = '#d1fae5'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{tt.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: taskType === tt.id ? '#15803d' : '#14532d' }}>
                  {lang === 'hi' ? tt.labelHi : tt.label}
                </div>
                <div style={{ fontSize: 11, color: '#4b7a5a', marginBottom: 8, lineHeight: 1.4 }}>{lang === 'hi' ? tt.descHi : tt.desc}</div>
                <div style={{ fontWeight: 700, color: '#16a34a', fontSize: 13 }}>{tt.fee} base fee</div>
              </div>
            ))}
          </div>
          <button disabled={!taskType} onClick={() => setStep(1)} style={btnPrimary(!taskType)}>
            {lang === 'hi' ? 'आगे →' : 'Continue →'}
          </button>
        </div>
      )}

      {/* Step 1 – Task details */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontWeight: 700, color: '#14532d', marginBottom: 4 }}>{lang === 'hi' ? 'कार्य विवरण' : 'Task Details'}</h3>
          {([
            [lang === 'hi' ? 'आपका पता *' : 'Your Address *', 'Enter full address'],
            [lang === 'hi' ? 'दुकान का नाम (वैकल्पिक)' : 'Shop / Destination (optional)', 'e.g. Big Bazaar'],
            [lang === 'hi' ? 'अनुमानित बजट (₹)' : 'Estimated Budget (₹)', 'e.g. 500'],
          ] as [string, string][]).map(([lbl, ph]) => (
            <div key={lbl}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#4b7a5a', display: 'block', marginBottom: 5 }}>{lbl}</label>
              <input placeholder={ph} style={inp} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b7a5a', display: 'block', marginBottom: 5 }}>
              {lang === 'hi' ? 'वस्तुओं की सूची' : 'Item List / Instructions'}
            </label>
            <textarea rows={3} placeholder={lang === 'hi' ? 'जैसे: 2kg टमाटर, 1L दूध...' : 'e.g. 2kg tomatoes, 1L milk, bread...'}
              style={{ ...inp, resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => setStep(0)} style={btnSecondary}>{lang === 'hi' ? '← वापस' : '← Back'}</button>
            <button onClick={() => setStep(2)} style={btnPrimary()}>{lang === 'hi' ? 'आगे →' : 'Continue →'}</button>
          </div>
        </div>
      )}

      {/* Step 2 – Confirm & Pay */}
      {step === 2 && (
        <div>
          <h3 style={{ fontWeight: 700, color: '#14532d', marginBottom: 16 }}>{lang === 'hi' ? 'पुष्टि करें और भुगतान करें' : 'Confirm & Pay'}</h3>

          {/* Runner card */}
          <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: '#d1fae5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🛵</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#14532d', fontSize: 14 }}>Runner: Vikram S.</div>
              <div style={{ fontSize: 12, color: '#86b899', marginTop: 2 }}>4.8 ⭐ · 1,240 deliveries · 0.8 km away</div>
            </div>
            <span style={{ fontSize: 11, background: '#fff', color: '#16a34a', border: '1px solid #d1fae5', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>ETA 8 min</span>
          </div>

          {/* Price breakdown */}
          <div style={{ background: '#fff', border: '1px solid #d1fae5', borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontWeight: 700, color: '#14532d', fontSize: 13, marginBottom: 12 }}>{lang === 'hi' ? 'मूल्य विवरण' : 'Price Breakdown'}</h4>
            {[['Runner Base Fee', '₹49'], ['Distance Charge', '₹12'], ['Platform Fee (10%)', '₹6'], ['GST (18%)', '₹12']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderBottom: '1px solid #f0fdf4' }}>
                <span style={{ color: '#4b7a5a' }}>{k}</span>
                <span style={{ fontWeight: 600, color: '#14532d' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: 12 }}>
              <span style={{ color: '#14532d' }}>{lang === 'hi' ? 'कुल' : 'Total'}</span>
              <span style={{ color: '#16a34a', fontSize: 17 }}>₹79</span>
            </div>
          </div>

          {/* Escrow note */}
          <div style={{ background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 12, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 8, fontSize: 12, color: '#4b7a5a' }}>
            <span>🔒</span>
            <span>{lang === 'hi' ? 'भुगतान एस्क्रो में रखा जाएगा — डिलीवरी की पुष्टि के बाद रनर को दिया जाएगा।' : 'Payment held in escrow — released to runner only after you confirm delivery.'}</span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>{lang === 'hi' ? '← वापस' : '← Back'}</button>
            <button onClick={() => setStep(0)} style={btnPrimary()}>{lang === 'hi' ? 'पुष्टि करें ✓' : 'Confirm & Pay ✓'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
