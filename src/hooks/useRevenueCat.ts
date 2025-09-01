import { useEffect, useState } from 'react';
import { Purchases as CapacitorPurchases } from '@revenuecat/purchases-capacitor';
import { Purchases as JSPurchases } from '@revenuecat/purchases-js';
import { useAuth } from './useAuth';
import { useDeviceType } from './useDeviceType';

const GOOGLE_API_KEY = 'goog_xpXGSziRNNDHcpIaczpVHVYYHkq';
const PADDLE_API_KEY = 'pdl_BYITiAAQMxvlynulGoFjHrMFggtO';

export const useRevenueCat = () => {
  const { session } = useAuth();
  const [isConfigured, setIsConfigured] = useState(false);
  const platform = useDeviceType();

  useEffect(() => {
    const init = async () => {
      if (session?.user.id) {
        try {
          if (platform === 'web') {
            JSPurchases.configure({
              apiKey: PADDLE_API_KEY,
              appUserId: session.user.id,
            });
          } else {
            await CapacitorPurchases.configure({
              apiKey: GOOGLE_API_KEY,
              appUserID: session.user.id,
            });
          }
          setIsConfigured(true);
        } catch (e) {
          console.error('Error configuring RevenueCat', e);
        }
      }
    };
    init();
  }, [session, platform]);

  return { isConfigured };
};
