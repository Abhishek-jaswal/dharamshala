'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import { WORK_TYPES, TEAM_SIZES, BOOKING_TYPES, DEMO_WORKERS } from '@/lib/data';

const Card = ({ active, onClick, children }: any) => (
  <div onClick={onClick}
    className={`cursor-pointer rounded-2xl border-2 text-center p-4 transition-all hover:-translate-y-0.5 ${active ? 'border-green-500 bg-green-50' : 'border-green-100 bg-white hover:border-green-300'
      }`}>{children}
  </div>
);

function ManpowerPage() {
  const { lang } = useLang();
  const [workType, setWorkType] = useState('');
  const [teamSize, setTeamSize] = useState<any>(null);
  const [engageType, setEngageType] = useState('daily');

  const cost = () => {
    if (!teamSize || teamSize.count === 999) return lang === 'hi' ? 'कस्टम कोट' : 'Custom Quote';
    const rate = engageType === 'hourly' ? 120 : engageType === 'contract' ? 25000 : 750;
    const total = Math.round(rate * teamSize.multiplier);
    const sfx = engageType === 'hourly' ? '/hr' : engageType === 'contract' ? '/mo' : '/day';
    return `₹${total.toLocaleString()}${sfx}`;
  };

  const Step = ({ n, label }: { n: number; label: string }) => (
    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{n}</span>
      {label}
    </h3>
  );

  return (
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-900">👷 {lang === 'hi' ? 'पूर्ण मैनपावर आपूर्ति' : 'Full Manpower Supply'}</h1>
        <p className="text-green-500 text-sm mt-1">{lang === 'hi' ? 'भारत में किसी भी स्थान पर किसी भी आकार की लेबर टीम तैनात करें' : 'Deploy labour teams of any size to any location across India'}</p>
      </div>

      <div className="mb-10">
        <Step n={1} label={lang === 'hi' ? 'कार्य प्रकार चुनें' : 'Select Work Type'} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {WORK_TYPES.map(wt => (
            <Card key={wt.id} active={workType === wt.id} onClick={() => setWorkType(wt.id)}>
              <div className="text-2xl mb-2">{wt.icon}</div>
              <div className={`font-semibold text-sm mb-1 ${workType === wt.id ? 'text-green-700' : 'text-green-900'}`}>{wt.label}</div>
              <div className="text-xs text-green-400 leading-snug">{wt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <Step n={2} label={lang === 'hi' ? 'टीम का आकार चुनें' : 'Select Team Size'} />
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {TEAM_SIZES.map(ts => (
            <Card key={ts.count} active={teamSize?.count === ts.count} onClick={() => setTeamSize(ts)}>
              <div className={`font-black text-2xl mb-1 ${teamSize?.count === ts.count ? 'text-green-700' : 'text-green-900'}`}>
                {ts.count === 999 ? '∞' : ts.count}
              </div>
              <div className="text-xs text-green-500 mb-2">{ts.count === 999 ? 'Workers' : `Worker${ts.count > 1 ? 's' : ''}`}</div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ts.cls}`}>{ts.badge}</span>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10">
        <Step n={3} label={lang === 'hi' ? 'एंगेजमेंट प्रकार' : 'Engagement Type'} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BOOKING_TYPES.map(bt => (
            <Card key={bt.id} active={engageType === bt.id} onClick={() => setEngageType(bt.id)}>
              <div className="text-2xl mb-2">{bt.icon}</div>
              <div className={`font-semibold text-sm mb-1 ${engageType === bt.id ? 'text-green-700' : 'text-green-900'}`}>{bt.label}</div>
              <div className="text-xs text-green-400">{bt.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {(workType || teamSize) && (
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-3xl p-6 sm:p-8 text-white mb-10">
          <h3 className="font-bold text-lg mb-5">📋 {lang === 'hi' ? 'बुकिंग सारांश' : 'Booking Summary'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              [lang === 'hi' ? 'कार्य प्रकार' : 'Work Type', workType ? WORK_TYPES.find(w => w.id === workType)?.label : '—'],
              [lang === 'hi' ? 'टीम का आकार' : 'Team Size', teamSize ? (teamSize.count === 999 ? 'Full Team' : `${teamSize.count} Workers`) : '—'],
              [lang === 'hi' ? 'एंगेजमेंट' : 'Engagement', BOOKING_TYPES.find(b => b.id === engageType)?.label ?? '—'],
              [lang === 'hi' ? 'अनुमानित लागत' : 'Est. Cost', cost()],
            ].map(([k, v]) => (
              <div key={String(k)}>
                <div className="text-xs text-green-300 mb-1">{k}</div>
                <div className="font-bold text-lg">{v}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-green-400 hover:bg-green-300 text-green-900 font-bold py-3 rounded-2xl text-sm transition-colors">
              {lang === 'hi' ? 'टीम का अनुरोध करें → 4 घंटे में तैनाती' : 'Request Team → Deploy in < 4 Hours'}
            </button>
            <button className="bg-green-800 hover:bg-green-700 text-green-100 font-semibold py-3 px-6 rounded-2xl text-sm border border-green-600">
              {lang === 'hi' ? 'कस्टम कोट प्राप्त करें' : 'Get Custom Quote'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManpowerPage;
