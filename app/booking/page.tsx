'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import { BOOKING_TYPES, DEMO_WORKERS } from '@/lib/data';
import { Badge } from '@/components/Badge';

export default function BookingPage() {
  const { lang } = useLang();
  const [step,        setStep]        = useState(0);
  const [bookingType, setBookingType] = useState('daily');
  const worker = DEMO_WORKERS[0];

  const StepBar = () => (
    <div className="flex items-center gap-2 mb-8">
      {['Booking Type', 'Schedule', 'Confirm & Pay'].map((s, i) => (
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
    <div className="page-enter max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/workers" className="text-sm text-green-500 hover:text-green-700 mb-6 flex items-center gap-1 font-medium">
        ← {lang === 'hi' ? 'वर्कर्स पर वापस' : 'Back to Workers'}
      </Link>

      <div className="bg-white border border-green-100 rounded-2xl p-5 mb-6">
        <div className="flex gap-4 items-start">
          <div className="w-14 h-14 bg-green-100 border-2 border-green-300 rounded-2xl flex items-center justify-center text-green-800 font-black text-lg flex-shrink-0">
            {worker.initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-green-900">{worker.name}</span>
              <span className="text-green-500 text-xs font-bold">✓ Verified</span>
              <Badge>{worker.badge}</Badge>
            </div>
            <p className="text-sm text-green-500 mb-2">{worker.role}</p>
            <div className="flex gap-4 text-xs text-green-400">
              <span>⭐ {worker.rating}</span><span>✅ {worker.jobs} jobs</span><span>🕐 {worker.exp}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-black text-green-700 text-lg">{worker.price}</div>
            <div className="text-xs text-green-400">Starting rate</div>
          </div>
        </div>
      </div>

      <StepBar />

      {step === 0 && (
        <div className="bg-white border border-green-100 rounded-2xl p-6">
          <h3 className="font-bold text-green-900 mb-5">{lang === 'hi' ? 'बुकिंग प्रकार चुनें' : 'Select Booking Type'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {BOOKING_TYPES.map(bt => (
              <div key={bt.id} onClick={() => setBookingType(bt.id)}
                className={`cursor-pointer rounded-2xl p-4 border-2 text-center transition-all ${
                  bookingType === bt.id ? 'border-green-500 bg-green-50' : 'border-green-100 hover:border-green-300'
                }`}>
                <div className="text-2xl mb-2">{bt.icon}</div>
                <div className={`font-semibold text-sm mb-1 ${bookingType === bt.id ? 'text-green-700' : 'text-green-900'}`}>{bt.label}</div>
                <div className="text-xs text-green-400">{bt.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl text-sm">
            {lang === 'hi' ? 'आगे →' : 'Continue →'}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="bg-white border border-green-100 rounded-2xl p-6">
          <h3 className="font-bold text-green-900 mb-5">{lang === 'hi' ? 'शेड्यूल और स्थान' : 'Schedule & Location'}</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[['Start Date', 'date', ''], ['Start Time', 'time', ''], ['Duration', 'text', 'e.g. 1 day'], ['Location', 'text', 'Full address'], ['Special Notes', 'text', 'Instructions'], ['No. of Workers', 'number', '1']].map(([lbl, type, ph]) => (
              <div key={String(lbl)}>
                <label className="text-xs font-semibold text-green-600 block mb-1">{lbl}</label>
                <input type={String(type)} placeholder={String(ph)} className="w-full border-2 border-green-200 rounded-xl px-3 py-2.5 text-sm text-green-900 placeholder-green-300" />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm">← {lang === 'hi' ? 'वापस' : 'Back'}</button>
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">{lang === 'hi' ? 'आगे →' : 'Continue →'}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-green-100 rounded-2xl p-6">
          <h3 className="font-bold text-green-900 mb-5">{lang === 'hi' ? 'पुष्टि करें और भुगतान करें' : 'Confirm & Pay (Escrow)'}</h3>
          <div className="border border-green-100 rounded-2xl p-4 mb-4">
            {[['Worker Rate', worker.price], ['Platform Fee (15%)', '₹128'], ['GST (18%)', '₹153'], ['Accident Insurance', '₹5L (Included)']].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between text-sm py-1.5 border-b border-green-50">
                <span className="text-green-500">{k}</span><span className="font-medium text-green-900">{v}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-3">
              <span className="text-green-900">{lang === 'hi' ? 'कुल' : 'Total'}</span>
              <span className="text-green-700 text-base">₹1,131/day</span>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex gap-2 text-xs text-green-600">
            <span>🔒</span><span>{lang === 'hi' ? 'भुगतान एस्क्रो में — काम पूरा होने पर ही दिया जाएगा।' : 'Payment held in secure escrow. Released only after you confirm job completion.'}</span>
          </div>
          <div className="mb-5">
            <label className="text-xs font-semibold text-green-600 block mb-2">{lang === 'hi' ? 'भुगतान विधि' : 'Payment Method'}</label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI 💳', 'Card 🏦', 'Cash 💵'].map(m => (
                <div key={m} className="border-2 border-green-200 rounded-xl py-2 text-center text-sm font-medium text-green-700 hover:border-green-400 cursor-pointer transition-colors">{m}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl border-2 border-green-200 text-green-700 font-semibold text-sm">← {lang === 'hi' ? 'वापस' : 'Back'}</button>
            <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">{lang === 'hi' ? 'पुष्टि करें ✓' : 'Confirm & Pay ✓'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
