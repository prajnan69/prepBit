import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import ArticleCard from './ArticleCard';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter, IonRefresher, IonRefresherContent, IonButtons } from '@ionic/react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import ReactMarkdown from 'react-markdown';
import ReviseMCQ from './ReviseMCQ';
import ReviseSearch from './ReviseSearch';

const RevisePage = ({ showToast }: { showToast: (message: string) => void }) => {
  const [reviseArticles, setReviseArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const ionRouter = useIonRouter();
  const { triggerHaptic } = useHaptics();

  const handleDismiss = (id: any) => {
    setReviseArticles(reviseArticles.filter(article => article.id !== id));
  };

  const fetchReviseItems = async (event?: any) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: readLaterData, error: readLaterError } = await supabase
          .from('read_later')
          .select('article_id')
          .eq('user_id', user.id);

        if (readLaterError) throw readLaterError;

        const articleIds = readLaterData?.map((r) => r.article_id) || [];
        let articles: any[] = [];
        if (articleIds.length > 0) {
          const { data: articleData, error: articlesError } = await supabase
            .from('daily_news')
            .select('*')
            .in('id', articleIds);
          if (articlesError) throw articlesError;
          articles = articleData?.map(a => ({ ...a, type: 'article' })) || [];
        }

        const { data: reviseData, error: reviseError } = await supabase
          .from('revise')
          .select('*')
          .eq('user_id', user.id);

        if (reviseError) throw reviseError;

        const allItems = [...articles, ...(reviseData || [])];
        const groupedItems = allItems.reduce((acc, item) => {
          const date = new Date(item.created_at || item.published_at).toDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(item);
          return acc;
        }, {} as { [key: string]: any[] });

        setReviseArticles(Object.entries(groupedItems));
      }
    } catch (error) {
      console.error('Error fetching revise items:', error);
      showToast('Failed to load items.');
    } finally {
      setLoading(false);
      if (event) {
        event.target.complete();
      }
    }
  };

  useIonViewWillEnter(() => {
    fetchReviseItems();
  });

  return (
    <IonPage>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={fetchReviseItems}>
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
          <h1 className="text-3xl font-bold">Revise</h1>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : reviseArticles.length > 0 ? (
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
              {reviseArticles.map(([date, items]) => (
                <div key={date}>
                  <h2 className="text-xl font-bold my-4">{date}</h2>
                  {items.map((item: any) =>
                    item.type === 'article' ? (
                      <ArticleCard
                        key={item.id}
                        article={item}
                        showToast={showToast}
                        isReadLaterPage={true}
                        onDismiss={handleDismiss}
                      />
                    ) : item.type === 'mcq' ? (
                      <ReviseMCQ key={item.id} mcq={{...item.content, id: item.id}} onDismiss={handleDismiss} />
                    ) : item.type === 'search' ? (
                      <ReviseSearch key={item.id} item={item} />
                    ) : null
                  )}
                </div>
              ))}
            </motion.div>
          ) : (
            <p>You haven't saved any articles to revise.</p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RevisePage;
