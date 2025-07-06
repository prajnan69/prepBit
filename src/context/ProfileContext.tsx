import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  exam: string;
  state: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  refetchProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, avatar_url')
          .eq('id', user.id)
          .single();
        if (error) {
          throw error;
        }
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  return (
    <ProfileContext.Provider value={{ profile, loading, refetchProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
