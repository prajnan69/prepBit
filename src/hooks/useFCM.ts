import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useFCM = () => {
  const { session } = useAuth();

  useEffect(() => {
    if (Capacitor.isNativePlatform() && session) {
      register();
    }
  }, [session]);

  const register = async () => {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      if (session) {
        console.log('Push registration success, token:', token.value);
        const { error } = await supabase
          .from('profiles')
          .update({ fcm_token: token.value })
          .eq('id', session.user.id);
        if (error) {
          console.error('Error updating FCM token:', error);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Error on registration:', error);
    });
  };
};
