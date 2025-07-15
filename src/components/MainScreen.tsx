import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import config from '../config';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter, IonRefresher, IonRefresherContent, IonButton } from '@ionic/react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiBookmark, FiFilter } from 'react-icons/fi';
import { GraduationCap, Heart, Landmark, Leaf, Scale, Cpu } from 'lucide-react';
import ArticleCard from './ArticleCard';
import LiveFeedPage from './LiveFeedPage';
import useScreenWidth from '../hooks/useScreenWidth';
import { useHaptics } from '../hooks/useHaptics';
import { useAuth } from '../hooks/useAuth';

interface MainScreenProps {
  examType: string;
  showToast: (message: string) => void;
}

const topics = [
  { name: 'Economy', icon: Landmark },
  { name: 'Health', icon: Heart },
  { name: 'Education', icon: GraduationCap },
  { name: 'Environment', icon: Leaf },
  { name: 'Law', icon: Scale },
  { name: 'Technology', icon: Cpu },
  { name: 'Polity', icon: Landmark },
];

const tabs = [
  { id: 'daily-update', label: 'Daily Update' },
  { id: 'live-feed', label: 'Live Feed' },
];

const MainScreen = ({ showToast }: MainScreenProps) => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [liveFeedTime, setLiveFeedTime] = useState(0);
  const [showImportant, setShowImportant] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [news, setNews] = useState<any[]>([]);
  const [filteredNews, setFilteredNews] = useState<any[]>([]);
  const [groupedNews, setGroupedNews] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [hidden, setHidden] = useState(false);
  const ionRouter = useIonRouter();
  const width = useScreenWidth();
  const contentRef = useRef<HTMLIonContentElement>(null);
  const { triggerHaptic, triggerRefreshHaptic, triggerArticleLoadHaptic } = useHaptics();
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.5, rootMargin: '200px' });

  const checkNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('is_read')
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (data && data.length > 0) {
        setHasUnread(true);
      } else {
        setHasUnread(false);
      }
    }
  };

  const fetchNews = useCallback(async (event?: any) => {
    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await axios.get(`${config.API_BASE_URL}/current-affairs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNews(response.data);
      setFilteredNews(response.data);
      triggerArticleLoadHaptic();
    } catch (error) {
      console.error('Error fetching news:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
    } finally {
      setLoading(false);
      if (event) {
        event.target.complete();
      }
    }
  }, []);

  useIonViewWillEnter(() => {
    checkNotifications();
  });

  useEffect(() => {
    if (activeTab === 'daily-update') {
      fetchNews();
    }
  }, [activeTab, fetchNews]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'live-feed') {
      interval = setInterval(() => {
        setLiveFeedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    const saveLiveFeedTime = async () => {
      if (session?.user && liveFeedTime > 0 && liveFeedTime % 60 === 0) {
        const { data: stats, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching user stats:', error);
          return;
        }

        if (stats) {
          await supabase.from('user_stats').update({ time_spent_live_feed: stats.time_spent_live_feed + 60 }).eq('user_id', session.user.id);
        } else {
          await supabase.from('user_stats').insert({ user_id: session.user.id, time_spent_live_feed: 60 });
        }
      }
    };
    saveLiveFeedTime();
  }, [liveFeedTime, session]);

  useEffect(() => {
    checkNotifications();

    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, checkNotifications)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (isIntersecting && hasMore && !loadingMore) {
      fetchMoreNews(null);
    }
  }, [isIntersecting]);

  useEffect(() => {
    let filtered = news;
    if (showImportant) {
      filtered = filtered.filter(article => article.is_important);
    }
    setFilteredNews(filtered);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const groups = filtered.reduce?.((acc, article) => {
  const articleDate = new Date(article.published_at).toDateString();
  let groupName;

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (articleDate === todayStr) {
    groupName = 'Today';
  } else if (articleDate === yesterdayStr) {
    groupName = 'Yesterday';
  } else {
    groupName = new Date(article.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (!acc[groupName]) {
    acc[groupName] = [];
  }
  acc[groupName].push(article);
  return acc;
}, {}) ?? {};
  

    setGroupedNews(groups);
  }, [showImportant, news]);

  const fetchMoreNews = async (event: any) => {
    setLoadingMore(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const exclude_ids = news.map(n => n.id);
      const response = await axios.post(`${config.API_BASE_URL}/read-more`, { exclude_ids }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setNews(prevNews => [...prevNews, ...response.data]);
        setFilteredNews(prevNews => [...prevNews, ...response.data]);
      }
      event.target.complete();
    } catch (error) {
      console.error('Error fetching more news:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data);
      }
    } finally {
      setLoadingMore(false);
    }
  };


  const SkeletonLoader = () => (
                  <div className="px-4 pt-4 pb-16 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-2xl shadow-md border animate-pulse">
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 bg-gray-100 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mt-2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <IonPage>
      <IonContent ref={contentRef} scrollEvents={true}>
        <IonRefresher slot="fixed" onIonRefresh={(e) => fetchNews(e)} onIonPull={() => triggerHaptic()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <header className="bg-white/80 backdrop-blur-sm z-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold text-neutral-900">PrepBit</h1>
            <div className="flex items-center space-x-4">
              {width <= 380 && (
                <button onClick={() => {
                  triggerHaptic();
                  ionRouter.push('/bookmarks');
                }}>
                  <FiBookmark className="text-2xl text-gray-500" />
                </button>
              )}
              <button className="relative" onClick={() => {
                triggerHaptic();
                ionRouter.push('/notifications');
              }}>
                <FiBell className="text-2xl text-gray-500" />
                {hasUnread && <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
              </button>
            </div>
          </div>
          <div className="px-4 pt-4">
            <div className="flex bg-gray-100 p-1 rounded-full">
              <div className="relative w-3/5">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab('daily-update');
                  }}
                  className={`w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-transform duration-300 relative z-10 ${
                    activeTab === 'daily-update' ? 'text-blue-600 scale-105' : 'text-neutral-500'
                  }`}
                >
                  <span>Daily Update</span>
                </button>
                {activeTab === 'daily-update' && (
                  <motion.div
                    layoutId="pill"
                    className="absolute inset-0 bg-white rounded-full shadow"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </div>
              <div className="relative w-2/5">
                <button
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab('live-feed');
                  }}
                  className={`w-full py-2 text-sm font-semibold flex items-center justify-center gap-2 transition-transform duration-300 relative z-10 ${
                    activeTab === 'live-feed' ? 'text-blue-600 scale-105' : 'text-neutral-500'
                  }`}
                >
                  <span>Live Feed</span>
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </button>
                {activeTab === 'live-feed' && (
                  <motion.div
                    layoutId="pill"
                    className="absolute inset-0 bg-white rounded-full shadow"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="pb-4">
          <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'daily-update' ? (
                  <div className="px-4 pt-4 pb-28 space-y-4">
                    {loading ? (
                      <SkeletonLoader />
                    ) : filteredNews.length > 0 ? (
                      <div>
                        {Object.entries(groupedNews).map(([groupName, articles]) => (
                          <div key={groupName}>
                            <h2 className="text-lg font-bold text-gray-800 my-4">{groupName}</h2>
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
                            >
                              {(articles as any[]).map((article) => (
                                <ArticleCard
                                  key={article.id}
                                  article={article}
                                  showToast={showToast}
                                />
                              ))}
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500 pt-16">
                        <p>No articles match your selected filters.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <LiveFeedPage showToast={showToast} activeTab={activeTab} />
                )}
              </motion.div>
            </AnimatePresence>
            {!loading && hasMore && (
              <div ref={ref} className="flex justify-center my-4">
                {loadingMore && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="text-gray-500 animate-pulse">PrepBit</span>
                  </div>
                )}
              </div>
            )}
          </main>
        <AnimatePresence>
          {isFilterDrawerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsFilterDrawerOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="fixed bottom-24 right-4 z-50">
          <button
            onClick={() => {
              triggerHaptic();
              setShowImportant(!showImportant);
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap shadow-lg border ${
              showImportant
                ? 'bg-blue-500/50 text-white border-blue-300'
                : 'bg-white/30 backdrop-blur-lg text-gray-800 border-white/20'
            }`}
          >
            <span>Important</span>
            <FiFilter size={16} />
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MainScreen;
