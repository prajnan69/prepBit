import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { useHaptics } from '../../hooks/useHaptics';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationsPageProps {
  onContinue: (settings: Record<string, boolean>) => void;
}

const notificationTypes = [
  { id: 'dailySummary', label: 'Daily Summary' },
  { id: 'importantMaterials', label: 'Important Materials' },
  { id: 'importantArticles', label: 'Important Articles' },
  { id: 'streakUpdates', label: 'Streak Updates' },
];

const NotificationsPage = ({ onContinue }: NotificationsPageProps) => {
  const [notificationSettings, setNotificationSettings] = useState<
    Record<string, boolean>
  >({
    dailySummary: true,
    importantMaterials: true,
    importantArticles: true,
    streakUpdates: true,
  });
  const { triggerHaptic } = useHaptics();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      PushNotifications.addListener('registration', async (token) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ fcm_token: token.value })
            .eq('id', user.id);
        }
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });
    }

    return () => {
      if (Capacitor.isNativePlatform()) {
        PushNotifications.removeAllListeners();
      }
    };
  }, []);

  const toggleSetting = (id: string) => {
    triggerHaptic();
    setNotificationSettings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [image, setImage] = useState('https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_notifications_off.png');

  const handleContinue = async () => {
    triggerHaptic();
    setImage('https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_notifications_on.png');
    setTimeout(async () => {
      if (Capacitor.isNativePlatform()) {
        const permStatus = await PushNotifications.requestPermissions();

        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          onContinue(notificationSettings);
        } else {
          onContinue({
            dailySummary: false,
            importantMaterials: false,
            importantArticles: false,
            streakUpdates: false,
          });
        }
      } else {
        // PWA/Web notifications
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            onContinue(notificationSettings);
          } else {
            onContinue({
              dailySummary: false,
              importantMaterials: false,
              importantArticles: false,
              streakUpdates: false,
            });
          }
        } else {
          onContinue(notificationSettings);
        }
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6 text-center">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-xs mx-auto mb-8 h-48">
          <motion.img
            key={image}
            src={image}
            alt="Notifications"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold mb-4">Stay Ahead of the Curve</h1>
        <p className="text-lg text-gray-600 mb-8">
          Commit to your goals. Let us help you stay on track with timely updates.
        </p>
        <div className="w-full max-w-sm space-y-4">
          {notificationTypes.map(({ id, label }) => (
            <div
              key={id}
              className="flex items-center justify-between bg-white p-4 rounded-lg"
            >
              <span className="text-gray-700">{label}</span>
              <button
                onClick={() => toggleSetting(id)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notificationSettings[id] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 m-1 bg-white rounded-full transform transition-transform ${
                    notificationSettings[id] ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={handleContinue}
          className="w-full max-w-sm bg-blue-600 text-white px-8 py-6 rounded-full shadow-lg"
        >
          Enable Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPage;
