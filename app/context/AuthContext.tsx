'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getPb } from '../lib/pocketbase';
import type PocketBase from 'pocketbase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pbRef = useRef<PocketBase | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pb = getPb();
    pbRef.current = pb;
    setUser(pb.authStore.model);
    setLoading(false);

    const unsub = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });
    return () => unsub();
  }, []);

  const loginWithOAuth = async (providerName: 'google' | 'github') => {
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

      const res = await fetch(`${pbUrl}/api/collections/users/auth-methods`);
      const authMethods = await res.json();

      const provider = authMethods.authProviders?.find(
        (p: any) => p.name === providerName
      );

      if (!provider) {
        alert(`${providerName} OAuth not enabled in PocketBase admin.`);
        return;
      }

      localStorage.setItem('pb_oauth_provider', JSON.stringify(provider));

      const redirectUrl = `${window.location.origin}/oauth-callback`;
      window.location.href = provider.authUrl + encodeURIComponent(redirectUrl);

    } catch (err) {
      console.error(`${providerName} login error:`, err);
    }
  };

  const loginWithGoogle = () => loginWithOAuth('google');
  const loginWithGithub = () => loginWithOAuth('github');

  const logout = () => {
    getPb().authStore.clear();
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);