'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { getPb } from '@/lib/pocketbase';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const pb = getPb();
      const rec = await pb.collection('profiles').getFirstListItem(`user="${userId}"`);
      setProfile(rec);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const pb = getPb();
    const cur = pb.authStore.model;
    setUser(cur);
    if (cur?.id) {
      fetchProfile(cur.id).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    const unsub = pb.authStore.onChange(async () => {
      const u = pb.authStore.model;
      setUser(u);
      if (u?.id) await fetchProfile(u.id);
      else { setProfile(null); }
    });
    return () => unsub();
  }, []);

  const loginWithOAuth = async (provider: 'google') => {
    const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
    const res = await fetch(`${pbUrl}/api/collections/users/auth-methods`);
    const data = await res.json();
    const p = (data.authProviders ?? []).find((x: any) => x.name === provider);
    if (!p) { alert(`${provider} OAuth not enabled in PocketBase.`); return; }
    localStorage.setItem('pb_oauth_provider', JSON.stringify(p));
    window.location.href = p.authUrl + encodeURIComponent(`${window.location.origin}/oauth-callback`);
  };

  const loginWithGoogle = () => loginWithOAuth('google');
  const logout = () => { getPb().authStore.clear(); setProfile(null); };
  const refreshProfile = () => { if (user?.id) fetchProfile(user.id); };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, profileLoading,
      isNewUser: !!(user && !profile && !profileLoading),
      loginWithGoogle, logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
