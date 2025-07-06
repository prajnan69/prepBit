import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session && Capacitor.isNativePlatform()) {
        registerPushNotifications(session.user.id);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const registerPushNotifications = async (userId: string) => {
    await PushNotifications.requestPermissions();
    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      await supabase
        .from('profiles')
        .update({ fcm_token: token.value })
        .eq('id', userId);
    });
  };

  return { session, loading };
};
