import { IonPage, IonContent } from '@ionic/react';
import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/swiper-bundle.css';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Browser } from '@capacitor/browser';
import { supabase } from '../lib/supabaseClient';
import config from '../config';

const InactiveSubscriptionPage = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const featureImages = [
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  ];

  const verifyTokenWithBackend = async (token: string) => {
    try {
      const res = await fetch(`${config.API_BASE_URL}/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      return data.valid ? data.user : null;
    } catch (err) {
      console.error('Token verification error:', err);
      return null;
    }
  };

  const handleManageAccount = async () => {
  const sessionResp = await supabase.auth.getSession();
  const session = sessionResp.data.session;

  if (session) {
    const { access_token, refresh_token } = session;

    console.log("🧪 Access Token:", access_token?.slice(0, 10));
    console.log("🧪 Refresh Token:", refresh_token?.slice(0, 10));

    const verifiedUser = await verifyTokenWithBackend(access_token);
    if (verifiedUser) {
      const url = `${config.API_BASE_URL}/bridge/profile?token=${encodeURIComponent(access_token)}&refresh=${encodeURIComponent(refresh_token)}`;
      console.log("🔗 Opening browser with URL:", url);
      await Browser.open({ url });
    } else {
      console.warn('Invalid token. Access denied.');
    }
  } else {
    console.log('❌ No session found');
  }
};



  return (
    <IonPage>
      <IonContent fullscreen className="font-poppins bg-gray-50">
        <div className="relative w-full min-h-screen bg-gradient-to-b from-purple-100 via-gray-50 to-gray-50">
          <div className="flex flex-col items-center justify-center p-6 pt-16 h-full">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900">Account Status</h1>
              <p className="text-gray-500 mt-2">No active plan found for this account.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full max-w-xs mx-auto bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-[2.5rem] shadow-2xl shadow-gray-300/50"
            >
              <div className="rounded-[2.2rem] overflow-hidden p-2">
                <Swiper
                  modules={[Pagination]}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  className="rounded-[1.8rem]"
                >
                  {featureImages.map((src, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={src}
                        alt={`Feature screenshot ${i + 1}`}
                        className="w-full h-96 object-cover"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-12 mb-24"
            >
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-4">
                <Info size={24} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Plan Management</h2>
              <p className="text-gray-500 mt-2 max-w-sm">
                For your security, subscription and plan details are handled on our website.
              </p>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent z-20 flex justify-center"
        >
          <button
            onClick={handleManageAccount}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-full text-lg font-semibold shadow-lg shadow-blue-500/30 transition-colors duration-300"
          >
            Manage Account
          </button>
        </motion.div>
      </IonContent>
    </IonPage>
  );
};

export default InactiveSubscriptionPage;
