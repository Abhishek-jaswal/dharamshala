'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPb } from '@/lib/pocketbase';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing login…');

  useEffect(() => {
    const run = async () => {
      try {
        const params   = new URLSearchParams(window.location.search);
        const code     = params.get('code');
        const state    = params.get('state');
        const stored   = localStorage.getItem('pb_oauth_provider');
        if (!stored || !code || !state) { setStatus('Login failed — missing data.'); return; }
        const provider = JSON.parse(stored);
        if (state !== provider.state) { setStatus('Login failed — state mismatch.'); return; }
        const pb = getPb();
        await (pb.collection('users') as any).authWithOAuth2(
          provider.name, code, provider.codeVerifier,
          `${window.location.origin}/oauth-callback`
        );
        localStorage.removeItem('pb_oauth_provider');
        router.push('/dashboard');
      } catch (err) {
        console.error(err);
        setStatus('Login failed. Please try again.');
      }
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 gap-4">
      <div className="w-10 h-10 border-3 border-green-200 border-t-green-600 rounded-full animate-spin" style={{ border: '3px solid #bbf7d0', borderTopColor: '#16a34a' }} />
      <p className="text-green-700 font-semibold">{status}</p>
    </div>
  );
}
