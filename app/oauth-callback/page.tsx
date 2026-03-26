'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPb } from '../lib/pocketbase';

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
        const redirectUrl = `${window.location.origin}/oauth-callback`;
        await (pb.collection('users') as any).authWithOAuth2(
          provider.name, code, provider.codeVerifier, redirectUrl
        );
        localStorage.removeItem('pb_oauth_provider');
        router.push('/dashboard');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('Login failed. Please try again.');
      }
    };
    run();
  }, []);

  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',
      alignItems:'center',justifyContent:'center',
      background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',
      fontFamily:"'Plus Jakarta Sans',sans-serif",gap:16}}>
      <div style={{width:40,height:40,border:'3px solid #bbf7d0',
        borderTopColor:'#16a34a',borderRadius:'50%',
        animation:'spin 0.7s linear infinite'}}/>
      <p style={{color:'#15803d',fontWeight:600,fontSize:'1rem'}}>{status}</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
