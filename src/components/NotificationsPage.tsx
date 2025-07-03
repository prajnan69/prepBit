import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { motion } from 'framer-motion';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
        } else {
          setNotifications(data);
        }
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <IonPage>
      <IonContent>
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Notifications</h1>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  className={`p-4 rounded-lg shadow-sm ${notification.is_read ? 'bg-gray-100' : 'bg-white'}`}
                  onClick={() => !notification.is_read && markAsRead(notification.id)}
                >
                  <p className={notification.is_read ? 'text-gray-500' : 'text-gray-800'}>{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No notifications yet.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationsPage;
