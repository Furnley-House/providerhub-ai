import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: { full_name: string | null; role: string } | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  profile: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ full_name: string | null; role: string } | null>(null);

  useEffect(() => {
    // Clear any stale/corrupt session tokens on mount to prevent infinite refresh loops
    const clearStaleSession = () => {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const expiresAt = parsed?.expires_at;
              if (expiresAt && expiresAt * 1000 < Date.now()) {
                localStorage.removeItem(key);
                console.log('Cleared expired auth session from localStorage');
              }
            }
          } catch {
            localStorage.removeItem(key);
            console.log('Cleared corrupt auth session from localStorage');
          }
        }
      }
    };
    clearStaleSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Session is invalid — sign out to clear tokens
        console.warn('Session retrieval failed, clearing auth state:', error.message);
        supabase.auth.signOut().catch(() => {});
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("user_id", userId)
      .single();
    if (data) setProfile(data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, profile }}>
      {children}
    </AuthContext.Provider>
  );
}
