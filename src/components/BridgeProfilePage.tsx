import { useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { supabase } from '../lib/supabaseClient';

const BridgeProfilePage = () => {
  const router = useIonRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      supabase.auth.setSession({ access_token: token, refresh_token: '' })
        .then(({ error }) => {
          if (!error) {
            console.log('✅ Session set from token');
            router.push('/profile'); // or router.replace('/profile');
          } else {
            console.error('❌ Failed to set session:', error);
            router.push('/login');
          }
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
      Logging you in...
    </div>
  );
};

export default BridgeProfilePage;
