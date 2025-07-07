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
    // This is the image from your screenshot
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  ];

  const handleManageAccount = async () => {
    console.log('handleManageAccount called');
    console.log('Current session:', session);
    if (session) {
      const url = `http://prepbit.academy/profile?token=${session.access_token}`;
      console.log('Opening URL:', url);
      await Browser.open({ url });
    } else {
      console.log('No session found');
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="font-poppins bg-gray-50">
        {/* Main container with the top gradient */}
        <div className="relative w-full min-h-screen bg-gradient-to-b from-purple-100 via-gray-50 to-gray-50">
          <div className="flex flex-col items-center justify-center p-6 pt-16 h-full">

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900">Account Status</h1>
              {/* --- FIX: Increased text contrast for readability --- */}
              <p className="text-gray-500 mt-2">No active plan found for this account.</p>
            </motion.div>

            {/* Phone Mock-up with a cleaner, lighter glassmorphism */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full max-w-xs mx-auto bg-white/50 backdrop-blur-xl border border-gray-200/80 rounded-[2.5rem] shadow-2xl shadow-gray-300/50"
            >
              <div className="rounded-[2.2rem] overflow-hidden p-2">
                <Swiper
                  modules={[Pagination]} // Removed Autoplay/Fade for a cleaner feel like the screenshot
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
              className="text-center mt-12 mb-24" // Space for sticky button
            >
               {/* --- FIX: Matching the icon style from screenshot --- */}
               <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mx-auto mb-4">
                 <Info size={24} className="text-blue-600" />
               </div>
               <h2 className="text-xl font-semibold text-gray-900">Plan Management</h2>
               {/* --- FIX: Increased text contrast for readability --- */}
               <p className="text-gray-500 mt-2 max-w-sm">
                  For your security, subscription and plan details are handled on our website.
               </p>
            </motion.div>
          </div>
        </div>

        {/* Sticky Manage Account Button */}
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
