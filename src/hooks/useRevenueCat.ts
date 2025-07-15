import { useEffect, useState } from 'react';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { useAuth } from './useAuth';

const API_KEY = 'goog_xpXGSziRNNDHcpIaczpVHVYYHkq';

export const useRevenueCat = () => {
  const { session } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (session?.user.id) {
        try {
          await Purchases.configure({
            apiKey: API_KEY,
            appUserID: session.user.id,
          });
          setIsConfigured(true);
        } catch (e) {
          console.error('Error configuring RevenueCat', e);
        }
      }
    };
    init();
  }, [session]);

  return { isConfigured };
};
