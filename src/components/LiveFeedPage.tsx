import { useState, useEffect } from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import LiveArticleCard from './LiveArticleCard';

const LiveFeedPage = ({ showToast, activeTab }: { showToast: (message: string) => void, activeTab: string }) => {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      const { data, error } = await supabase
        .from('live_feed')
        .select('title, created_at, link')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching live feed:', error);
      } else if (data) {
        setFeed(data.map(item => ({ ...item, summary: '' })));
      }
      setLoading(false);
    };

    fetchFeed();

    const channel = supabase
      .channel('public:live_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'live_feed' }, (payload) => {
        setFeed((prevFeed) => [{ ...payload.new, summary: '' }, ...prevFeed]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {activeTab === 'live-feed' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mt-6"
            >
              <p className="font-bold">A friendly heads-up!</p>
              <p>This is the raw, unfiltered firehose of news. We're talking ongoing events, not the curated, exam-ready gems you'll find in your daily feed. Don't get lost in the noise – we've got your back and will deliver the important stuff right to you!</p>
            </motion.div>
          )}
          {feed.map((item, index) => (
            <LiveArticleCard key={index} article={item} />
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default LiveFeedPage;
