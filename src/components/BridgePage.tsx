import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useIonRouter } from '@ionic/react';

const BridgePage = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const refresh = urlParams.get('refresh');

    if (token && refresh) {
      supabase.auth.setSession({ access_token: token, refresh_token: refresh }).then(() => {
        ionRouter.push('/affiliate-dashboard', 'root', 'replace');
      });
    } else {
      ionRouter.push('/login', 'root', 'replace');
    }
  }, [ionRouter]);

  return null;
};

export default BridgePage;
