import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, useIonRouter } from '@ionic/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { FiLoader, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useHaptics } from '../hooks/useHaptics';

const NotificationsPage = () => {
  const { session, loading: authLoading } = useAuth();
  const { triggerHaptic } = useHaptics();
  const user = session?.user;
  const [notifications, setNotifications] = useState<any[]>([]);
  const ionRouter = useIonRouter();
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else {
        setNotifications(data);
        if (data && data.length > 0) {
          const unreadIds = data.filter(n => !n.is_read).map(n => n.id);
          if (unreadIds.length > 0) {
            await supabase
              .from('notifications')
              .update({ is_read: true })
              .in('id', unreadIds);
          }
        }
      }
      setLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications:page:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((notification) =>
                notification.id === payload.new.id ? payload.new : notification
              )
            );
          } else {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

  const handleClearAll = async () => {
    triggerHaptic();
    setIsClearing(true);
    setTimeout(async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_cleared: true })
        .eq('user_id', user?.id);
      if (!error) {
        setNotifications(notifications.map(n => ({ ...n, is_cleared: true })));
      }
      setIsClearing(false);
    }, 500);
  };

  return (
    <IonPage>
      <IonContent>
        <div className="p-4 pb-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <IonButtons slot="start">
                <IonBackButton defaultHref="/profile" />
              </IonButtons>
              <h1 className="text-2xl font-bold">Notifications</h1>
            </div>
            {notifications.some(n => !n.is_cleared) && (
              <button onClick={handleClearAll} className="text-sm text-gray-500 flex items-center">
                <FiTrash2 className="mr-1" />
                Clear All
              </button>
            )}
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-2xl shadow-sm border animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : notifications.filter(n => !n.is_cleared).length === 0 ? (
            <div className="text-center text-gray-500 mt-16">
              <p>No notifications yet.</p>
            </div>
          ) : (
            <motion.ul
              className="space-y-4"
              animate={{ opacity: isClearing ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence>
                {notifications.filter(n => !n.is_cleared).map((notification) => (
                  <motion.li
                    key={notification.id}
                    layout
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0, transition: { duration: 0.3 } }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={async (event, info) => {
                      if (info.offset.x < -100) {
                        triggerHaptic();
                        await supabase
                          .from('notifications')
                          .update({ is_cleared: true })
                          .eq('id', notification.id);
                        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
                      }
                    }}
                    className={`p-4 rounded-2xl shadow-sm border flex items-center justify-between ${
                      notification.is_read ? 'bg-gray-100' : 'bg-white'
                    }`}
                    onClick={() => {
                      if (notification.status === 'done') {
                        ionRouter.push(`/article/${notification.article_id}`);
                      }
                    }}
                  >
                    <div className="flex-grow">
                      <p className={`font-semibold ${notification.is_read ? 'text-gray-600' : 'text-gray-800'}`}>{notification.title}</p>
                      <p className={`text-sm ${notification.is_read ? 'text-gray-500' : 'text-gray-600'}`}>{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {notification.status === 'loading' && <FiLoader className="animate-spin text-2xl text-gray-500" />}
                      {notification.status === 'done' && <FiCheck className="text-2xl text-green-500" />}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationsPage;
