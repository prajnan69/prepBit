import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ArticleCard from './ArticleCard';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter, IonRefresher, IonRefresherContent, IonButtons } from '@ionic/react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';

const ReadLaterPage = ({ showToast }: { showToast: (message: string) => void }) => {
  const [readLaterArticles, setReadLaterArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ionRouter = useIonRouter();
  const { triggerHaptic } = useHaptics();

  const handleDismiss = (id: any) => {
    setReadLaterArticles(readLaterArticles.filter(article => article.id !== id));
  };

  const fetchReadLaterArticles = async (event?: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: readLater, error } = await supabase
          .from('read_later')
          .select('article_id')
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }

        if (readLater && readLater.length > 0) {
          const articleIds = readLater.map((r) => r.article_id);
          const { data: articles, error: articlesError } = await supabase
            .from('daily_news')
            .select('*')
            .in('id', articleIds);

          if (articlesError) {
            throw articlesError;
          }
          setReadLaterArticles(articles || []);
        } else {
          setReadLaterArticles([]);
        }
      }
    } catch (error) {
      console.error('Error fetching read later articles:', error);
      showToast('Failed to load articles.');
    } finally {
      setLoading(false);
      if (event) {
        event.target.complete();
      }
    }
  };

  useIonViewWillEnter(() => {
    fetchReadLaterArticles();
  });

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={fetchReadLaterArticles}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <div className="flex justify-end p-4">
          <button onClick={() => {
            triggerHaptic();
            ionRouter.goBack();
          }}>
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <h1 className="text-3xl font-bold">Read Later</h1>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : readLaterArticles.length > 0 ? (
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
              className="grid gap-1"
            >
              {readLaterArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  showToast={showToast}
                  isReadLaterPage={true}
                  onDismiss={handleDismiss}
                />
              ))}
            </motion.div>
          ) : (
            <p>You haven't saved any articles to read later.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReadLaterPage;
