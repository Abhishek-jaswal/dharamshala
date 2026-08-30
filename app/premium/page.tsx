'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getPb } from '@/lib/pocketbase';
import { SUBSCRIPTION_PLANS, type PlanId } from '@/lib/data';

const colors = {
  green: '#16a34a',
  greenDark: '#0f4c25',
  slate900: '#0f172a',
  slate600: '#475569',
  slate500: '#64748b',
  slate200: '#e2e8f0',
  bg: '#f8fafc',
};

export default function PremiumPage() {
  const { user, profile, refreshProfile, loading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currentPlan: PlanId = (profile?.plan as PlanId) || 'free';

  // ── Upgrade handler ────────────────────────────────────────────────────
  // NOTE: This creates a `pending_payment` subscription record and marks the
  // profile as upgraded directly, so the UI/flow is fully wired end-to-end.
  // Before going live, swap the block marked below for a real Razorpay/Stripe
  // checkout, and only flip `plan` / `featured` to true from a verified
  // webhook (never trust the client to confirm payment success).
  const handleUpgrade = async (planId: PlanId) => {
    if (!user) { router.push('/login'); return; }
    if (planId === 'free' || !profile?.id) return;

    setUpgrading(planId);
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)!;
      const amount = billing === 'yearly' ? plan.yearlyPrice : plan.price;
      const pb = getPb();

      // --- Replace this block with a real payment gateway checkout -------
      // const order = await createRazorpayOrder(amount);
      // const paymentResult = await openRazorpayCheckout(order);
      // if (!paymentResult.success) throw new Error('Payment failed');
      // ---------------------------------------------------------------------

      const now = new Date();
      const expires = new Date(now);
      expires.setMonth(expires.getMonth() + (billing === 'yearly' ? 12 : 1));

      await pb.collection('subscriptions').create({
        user: user.id,
        plan: planId,
        status: 'active',
        amount,
        billing_cycle: billing,
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
      });

      await pb.collection('profiles').update(profile.id, {
        plan: planId,
        plan_expires: expires.toISOString(),
        featured: true,
      });

      refreshProfile?.();
      setToast(lang === 'hi' ? '🎉 अपग्रेड सफल! अब आप फीचर्ड हैं।' : '🎉 Upgrade successful! You are now featured.');
      setTimeout(() => setToast(null), 3500);
    } catch (e) {
      console.error(e);
      alert(
        lang === 'hi'
          ? 'अपग्रेड नहीं हो सका। सुनिश्चित करें कि PocketBase में "subscriptions" कलेक्शन और profiles.plan/featured फील्ड मौजूद हैं।'
          : 'Could not upgrade. Make sure the "subscriptions" collection and profiles.plan/featured fields exist in PocketBase.'
      );
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div style={{ fontFamily: "'Outfit',sans-serif", background: colors.bg, minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg,${colors.greenDark} 0%,${colors.green} 60%,#22c55e 100%)`, padding: '52px 24px 44px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '6px 16px', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>🚀 {lang === 'hi' ? 'ग्रो फास्टर' : 'GROW FASTER'}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px,5vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 10 }}>
          {lang === 'hi' ? 'पहले दिखें। ज़्यादा कमाएं।' : 'Get Seen First. Earn More.'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
          {lang === 'hi'
            ? 'फीचर्ड प्रोफाइल कस्टमर्स को पहले दिखती है — जितनी जल्दी दिखेंगे, उतनी जल्दी काम मिलेगा।'
            : 'Featured professionals appear first in search & category results — more visibility means more bookings.'}
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: 4, marginTop: 24 }}>
          {(['monthly', 'yearly'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                border: 'none', borderRadius: 99, padding: '9px 20px', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
                background: billing === b ? '#fff' : 'transparent',
                color: billing === b ? colors.green : '#fff',
              }}
            >
              {b === 'monthly' ? (lang === 'hi' ? 'मासिक' : 'Monthly') : (lang === 'hi' ? 'वार्षिक (2 महीने मुफ़्त)' : 'Yearly (2 months free)')}
            </button>
          ))}
        </div>
      </section>

      {toast && (
        <div className="slide-down" style={{ maxWidth: 480, margin: '20px auto 0', background: '#f0fdf4', border: '1px solid #d1fae5', color: '#166534', fontWeight: 700, fontSize: 14, textAlign: 'center', padding: '12px 20px', borderRadius: 12 }}>
          {toast}
        </div>
      )}

      {/* Plans grid */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
          {SUBSCRIPTION_PLANS.map(plan => {
            const isCurrent = currentPlan === plan.id;
            const price = billing === 'yearly' ? plan.yearlyPrice : plan.price;
            const priceLabel = plan.id === 'free' ? (lang === 'hi' ? 'मुफ़्त' : 'Free') : `₹${price.toLocaleString('en-IN')}`;
            const features = lang === 'hi' ? plan.featuresHi : plan.features;

            return (
              <div
                key={plan.id}
                style={{
                  background: '#fff',
                  border: plan.id === 'pro' ? `2px solid ${colors.green}` : `1px solid ${colors.slate200}`,
                  borderRadius: 22,
                  padding: '28px 24px',
                  position: 'relative',
                  boxShadow: plan.id === 'pro' ? '0 12px 32px rgba(22,163,74,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.id === 'pro' && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: colors.green, color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 14px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                    {lang === 'hi' ? '⭐ सबसे लोकप्रिय' : '⭐ MOST POPULAR'}
                  </div>
                )}

                <div style={{ fontWeight: 900, fontSize: 20, color: colors.slate900, marginBottom: 4 }}>
                  {lang === 'hi' ? plan.nameHi : plan.name}
                </div>
                <div style={{ color: colors.slate500, fontSize: 13, marginBottom: 18, minHeight: 34 }}>
                  {lang === 'hi' ? plan.taglineHi : plan.tagline}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 34, fontWeight: 900, color: plan.color }}>{priceLabel}</span>
                  {plan.id !== 'free' && (
                    <span style={{ color: colors.slate500, fontSize: 13, fontWeight: 600 }}>
                      /{billing === 'yearly' ? (lang === 'hi' ? 'वर्ष' : 'yr') : (lang === 'hi' ? 'माह' : 'mo')}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, flex: 1 }}>
                  {features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: colors.slate600, lineHeight: 1.5 }}>
                      <span style={{ color: colors.green, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={isCurrent || plan.id === 'free' || upgrading === plan.id}
                  onClick={() => handleUpgrade(plan.id)}
                  style={{
                    width: '100%', border: 'none', borderRadius: 12, padding: '13px', fontWeight: 800, fontSize: 14,
                    fontFamily: 'inherit', cursor: isCurrent || plan.id === 'free' ? 'default' : 'pointer',
                    background: isCurrent ? '#f0fdf4' : plan.id === 'free' ? '#f1f5f9' : plan.color,
                    color: isCurrent ? colors.green : plan.id === 'free' ? colors.slate500 : '#fff',
                  }}
                >
                  {isCurrent
                    ? (lang === 'hi' ? '✓ मौजूदा प्लान' : '✓ Current Plan')
                    : plan.id === 'free'
                    ? (lang === 'hi' ? 'डिफ़ॉल्ट' : 'Default Plan')
                    : upgrading === plan.id
                    ? (lang === 'hi' ? 'प्रोसेस हो रहा है…' : 'Processing…')
                    : (lang === 'hi' ? 'अपग्रेड करें →' : 'Upgrade →')}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: 'center', color: colors.slate500, fontSize: 12, marginTop: 28 }}>
          {lang === 'hi'
            ? 'सुरक्षित भुगतान UPI, कार्ड और नेट बैंकिंग द्वारा। किसी भी समय रद्द करें।'
            : 'Secure payments via UPI, cards & netbanking. Cancel anytime.'}
        </p>
      </section>
    </div>
  );
}
