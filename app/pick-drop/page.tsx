'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';

const TASKS = [
  { id: 'grocery',  icon: '🛒', label: 'Grocery Run',       labelHi: 'किराने का सामान',  desc: 'Any supermarket or kirana store', descHi: 'कोई भी सुपरमार्केट या किराना',   fee: '₹49' },
  { id: 'medicine', icon: '💊', label: 'Medicine Pickup',   labelHi: 'दवाइयां',           desc: 'Chemist / pharmacy near you',     descHi: 'नजदीकी दवा की दुकान',           fee: '₹39' },
  { id: 'parcel',   icon: '📦', label: 'Parcel Delivery',   labelHi: 'पार्सल डिलीवरी',   desc: 'Send or receive packages locally', descHi: 'स्थानीय पार्सल भेजें/पाएं',     fee: '₹59' },
  { id: 'document', icon: '📄', label: 'Document Courier',  labelHi: 'दस्तावेज़ कूरियर',  desc: 'Offices, banks, courier hubs',    descHi: 'दफ्तर, बैंक, कूरियर हब',        fee: '₹49' },
  { id: 'shop',     icon: '🏪', label: 'Buy From Shop',     labelHi: 'दुकान से खरीदें',   desc: 'Send a list — runner buys for you',descHi: 'लिस्ट भेजें — रनर खरीदेगा',     fee: '₹69' },
  { id: 'food',     icon: '🍱', label: 'Tiffin / Food',     labelHi: 'टिफिन / खाना',     desc: 'Pick up food from any restaurant', descHi: 'किसी भी रेस्टोरेंट से खाना',    fee: '₹39' },
];

export default function PickDropPage() {
  const { lang } = useLang();
  const [step,     setStep]     = useState(0);
  const [taskType, setTaskType] = useState('');

  const StepBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {['Select Task', 'Task Details', 'Confirm & Pay'].map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 flex-shrink-0 ${
            step >= i ? 'bg-green-600 border-green-600 text-white' : 'border-green-200 text-green-400'
          }`}>{i + 1}</div>
          <span className={`text-xs font-medium hidden sm:block truncate ${step >= i ? 'text-green-700' : 'text-green-300'}`}>{s}</span>
          {i < 2 && <div className={`flex-1 h-0.5 ${step > i ? 'bg-green-500' : 'bg-green-100'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-enter max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">🛵 {lang === 'hi' ? 'पिक & ड्रॉप रनर' : 'Pick & Drop Runner'}</h1>
        <p className="text-green-500 text-sm mt-1">{lang === 'hi' ? 'अपने इलाके में किसी भी काम के लिए एक सत्यापित रनर भेजें' : 'Send a nearby verified runner for any errand in your area'}</p>
      </div>
      <StepBar />

      {step === 0 && (
        <div>
          <h3 className="font-bold text-green-900 mb-4">{lang === 'hi' ? 'आपको क्या चाहिए?' : 'What do you need?'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {TASKS.map(tt => (
              <div key={tt.id} onClick={() => setTaskType(tt.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 text-center transition-all hover:-translate-y-0.5 ${
                  taskType === tt.id ? 'border-green-500 bg-green-50' : 'border-green-100 bg-white hover:border-green-300'
                }`}>
                <div className="text-3xl mb-2">{tt.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${taskType === tt.id ? 'text-green-700' : 'text-green-900'}`}>
                  {lang === 'hi' ? tt.labelHi : tt.label}
                </div>
                <div className="text-xs text-green-500 mb-2 leading-snug">{lang === 'hi' ? tt.descHi : tt.desc}</div>
                <div className="font-bold text-green-700 text-sm">{tt.fee} base fee</div>
              </div>
            ))}
          </div>
          <button disabled={!taskType} onClick={() => setStep(1)}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-colors ${
              taskType ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-100 text-green-400 cursor-not-allowed'
            }`}>
            {lang === 'hi' ? 'आगे →' : 'Continue →'}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-green-900 mb-4">{lang === 'hi' ? 'कार्य विवरण' : 'Task Details'}</h3>
          {[
            [lang === 'hi' ? 'आपका पता *' : 'Your Address *',    'Enter full address'],
            [lang === 'hi' ? 'दुकान का नाम (वैकल्पिक)' : 'Shop / Destination (optional)', 'e.g. Big Bazaar'],
            [lang === 'hi' ? 'अनुमानित बजट (₹)' : 'Estimated Budget (₹)', 'e.g. 500'],
          ].map(([lbl, ph]) => (
            <div key={String(lbl)}>
              <label className="text-xs font-bold text-green-600 block mb-1">{lbl}</label>
              <input placeholder={String(ph)} className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-green-600 block mb-1">{lang === 'hi' ? 'वस्तुओं की सूची' : 'Item List / Instructions'}</label>
            <textarea rows={3} placeholder={lang === 'hi' ? 'जैसे: 2kg टमाटर, 1L दूध...' : 'e.g. 2kg tomatoes, 1L milk, bread...'}
              className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300 resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm">{lang === 'hi' ? '← वापस' : '← Back'}</button>
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">{lang === 'hi' ? 'आगे →' : 'Continue →'}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-bold text-green-900 mb-4">{lang === 'hi' ? 'पुष्टि करें और भुगतान करें' : 'Confirm & Pay'}</h3>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🛵</div>
            <div className="flex-1">
              <div className="font-bold text-green-900 text-sm">Runner: Vikram S.</div>
              <div className="text-xs text-green-500 mt-0.5">4.8 ⭐ · 1,240 deliveries · 0.8 km away</div>
            </div>
            <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-semibold">ETA 8 min</span>
          </div>
          <div className="bg-white border border-green-100 rounded-2xl p-5 mb-4">
            <h4 className="font-bold text-green-900 text-sm mb-3">{lang === 'hi' ? 'मूल्य विवरण' : 'Price Breakdown'}</h4>
            {[['Runner Base Fee', '₹49'], ['Distance Charge', '₹12'], ['Platform Fee (10%)', '₹6'], ['GST (18%)', '₹12']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1.5 border-b border-green-50">
                <span className="text-green-500">{k}</span><span className="font-medium text-green-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-3">
              <span className="text-green-900">{lang === 'hi' ? 'कुल' : 'Total'}</span>
              <span className="text-green-700 text-base">₹79</span>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex gap-2 text-xs text-green-600">
            <span>🔒</span><span>{lang === 'hi' ? 'भुगतान एस्क्रो में रखा जाएगा — डिलीवरी की पुष्टि के बाद रनर को दिया जाएगा।' : 'Payment held in escrow — released to runner only after you confirm delivery.'}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm">{lang === 'hi' ? '← वापस' : '← Back'}</button>
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">{lang === 'hi' ? 'पुष्टि करें ✓' : 'Confirm & Pay ✓'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
