'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getPb } from '../lib/pocketbase';
import type PocketBase from 'pocketbase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const pbRef = useRef<PocketBase | null>(null);
  const [user, setUser]       = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const pb = getPb();
      const rec = await pb.collection('profiles').getFirstListItem(`user_id="${userId}"`);
      setProfile(rec);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const pb = getPb();
    pbRef.current = pb;
    const currentUser = pb.authStore.model;
    setUser(currentUser);
    if (currentUser?.id) {
      fetchProfile(currentUser.id).then(() => setLoading(false));
    } else {
      setLoading(false);
    }
    const unsub = pb.authStore.onChange(async () => {
      const u = pb.authStore.model;
      setUser(u);
      if (u?.id) await fetchProfile(u.id);
      else setProfile(null);
    });
    return () => unsub();
  }, []);

  const loginWithOAuth = async (providerName: 'google' | 'github') => {
    try {
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      const res = await fetch(`${pbUrl}/api/collections/users/auth-methods`);
      const authMethods = await res.json();
      const providers: any[] = authMethods.authProviders ?? [];
      const provider = providers.find((p: any) => p.name === providerName);
      if (!provider) { alert(`${providerName} OAuth not enabled.`); return; }
      localStorage.setItem('pb_oauth_provider', JSON.stringify(provider));
      const redirectUrl = `${window.location.origin}/oauth-callback`;
      window.location.href = provider.authUrl + encodeURIComponent(redirectUrl);
    } catch (err) { console.error(err); }
  };

  const loginWithGoogle = () => loginWithOAuth('google');
  const loginWithGithub = () => loginWithOAuth('github');
  const logout = () => { getPb().authStore.clear(); setProfile(null); };
  const refreshProfile = () => { if (user?.id) fetchProfile(user.id); };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, profileLoading,
      isNewUser: !!(user && !profile && !profileLoading),
      loginWithGoogle, loginWithGithub, logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
