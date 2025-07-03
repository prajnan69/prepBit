import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter, IonRefresher, IonRefresherContent } from '@ionic/react';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkCard from './BookmarkCard';
import { X } from 'lucide-react';
import useScreenWidth from '../hooks/useScreenWidth';
import { useHaptics } from '../hooks/useHaptics';

const BookmarksPage = ({ showToast }: { showToast: (message: string) => void }) => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ionRouter = useIonRouter();
  const width = useScreenWidth();
  const { triggerHaptic } = useHaptics();

  const fetchBookmarkedArticles = async (event?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: bookmarks, error } = await supabase
          .from('bookmarks')
          .select('article_id')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching bookmarks:', error);
          setLoading(false);
          return;
        }

        if (bookmarks && bookmarks.length > 0) {
          const articleIds = bookmarks.map((b) => b.article_id);
          const { data: articles, error: articlesError } = await supabase
            .from('daily_news')
            .select('*')
            .in('id', articleIds);

          if (articlesError) {
            console.error('Error fetching bookmarked articles:', articlesError);
          } else {
            setBookmarkedArticles(articles);
          }
        }
      }
      setLoading(false);
      if (event) {
        event.target.complete();
      }
    };

  useEffect(() => {
    fetchBookmarkedArticles();
  }, []);

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={fetchBookmarkedArticles}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {width <= 380 && (
          <div className="flex justify-end p-4">
            <button onClick={() => {
              triggerHaptic();
              ionRouter.goBack();
            }}>
              <X size={24} />
            </button>
          </div>
        )}
        <div className="p-4">
          <h1 className="text-3xl font-bold mb-4">Bookmarks</h1>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : bookmarkedArticles.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.07,
                  },
                },
              }}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {bookmarkedArticles.map((article) => (
                <BookmarkCard
                  key={article.id}
                  article={article}
                />
              ))}
            </motion.div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No bookmarks yet.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookmarksPage;
