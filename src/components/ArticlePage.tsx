import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useHaptics } from '../hooks/useHaptics';
import {
  ArrowLeft,
  BookOpen,
  Target,
  FileText,
  Lightbulb,
  Bookmark,
  Bell,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import config from '../config';
import TestDrawer from './TestDrawer';
import ValueAddDrawer from './ValueAddDrawer';
import QuestionsDrawer from './QuestionsDrawer';
import Keyword from './Keyword';
import { IonButton } from '@ionic/react';

const ArticlePage = ({ showToast }: { showToast: (message: string) => void }) => {
  const ionRouter = useIonRouter();
  const { id } = useParams<{ id: string }>();
  const { triggerHaptic } = useHaptics();

  // All hooks called in consistent order
  const [article, setArticle] = useState<any>(null);
  const [examType, setExamType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [prelimsData, setPrelimsData] = useState<{ markdown: string; mcqs: any[] } | null>(null);
  const [mainsData, setMainsData] = useState<{ markdown: string; points: any[]; keywords: string[]; questions: string[] } | null>(null);
  const [loadingPrelims, setLoadingPrelims] = useState(false);
  const [loadingMains, setLoadingMains] = useState(false);
  const [isTestDrawerOpen, setIsTestDrawerOpen] = useState(false);
  const [isValueAddDrawerOpen, setIsValueAddDrawerOpen] = useState(false);
  const [isQuestionsDrawerOpen, setIsQuestionsDrawerOpen] = useState(false);
  const [showTestText, setShowTestText] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showNotifyButton, setShowNotifyButton] = useState(false);
  const [notificationId, setNotificationId] = useState<number | null>(null);

  useIonViewWillEnter(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('exam')
          .eq('id', user.id)
          .single();
        setExamType(profile?.exam ?? null);
      }

      const { data, error } = await supabase
        .from('daily_news')
        .select('*')
        .eq('id', id)
        .single();
      if (!error) {
        setArticle(data);
      }
    };
    fetchData();
  });

  useIonViewWillLeave(() => {
    setArticle(null);
  });

  const handleScroll = async (event: CustomEvent) => {
    const content = event.target as HTMLIonContentElement;
    const scrollElement = await content.getScrollElement();
    const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
    setShowTestText(isAtBottom);
  };


  // Bookmark check
  useEffect(() => {
    const checkIfBookmarked = async () => {
      if (userId && article) {
        const { data } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .eq('article_id', article.id);
        setIsBookmarked((data ?? []).length > 0);
      }
    };
    checkIfBookmarked();
  }, [userId, article]);

  // Fetch tab content safely (main fix)
  useEffect(() => {
    const fetchPrelimsData = async () => {
      setLoadingPrelims(true);
      setShowNotifyButton(false);
      const timer = setTimeout(() => {
        setShowNotifyButton(true);
      }, 3000);
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const res = await axios.post(
          `${config.API_BASE_URL}/prelims`,
          { topic: article?.title, summary: article?.summary },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPrelimsData(res.data);
        if (article && userId) {
          await supabase
            .from('notifications')
            .update({ status: 'done', title: 'Your article is ready' })
            .eq('article_id', article.id)
            .eq('user_id', userId)
            .eq('status', 'loading');
        }
      } catch (e) {
        console.error('Error fetching prelims:', e);
      } finally {
        setLoadingPrelims(false);
        clearTimeout(timer);
      }
    };

    const fetchMainsData = async () => {
      setLoadingMains(true);
      setShowNotifyButton(false);
      const timer = setTimeout(() => {
        setShowNotifyButton(true);
      }, 3000);
      try {
        const token = (await supabase.auth.getSession()).data.session?.access_token;
        const res = await axios.post(
          `${config.API_BASE_URL}/mains`,
          { topic: article?.title, summary: article?.summary },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMainsData(res.data);
        if (article && userId) {
          await supabase
            .from('notifications')
            .update({ status: 'done', title: 'Your article is ready' })
            .eq('article_id', article.id)
            .eq('user_id', userId)
            .eq('status', 'loading');
        }
      } catch (e) {
        console.error('Error fetching mains:', e);
      } finally {
        setLoadingMains(false);
        clearTimeout(timer);
      }
    };

    if (article) {
      fetchPrelimsData();
      fetchMainsData();
    }
  }, [article, notificationId]);

  const toggleBookmark = async () => {
    if (!userId || !article) return;
    await triggerHaptic();
    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', article.id);
      setIsBookmarked(false);
      showToast('Removed from Bookmarks');
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: userId, article_id: article.id });
      setIsBookmarked(true);
      showToast('Added to Bookmarks');
    }
  };

  const buttons = examType === 'UPSC'
    ? [
        { id: 'summary', label: 'Summary', icon: BookOpen },
        { id: 'prelims', label: 'Prelims', icon: Target },
        { id: 'mains', label: 'Mains', icon: FileText },
      ]
    : [
        { id: 'summary', label: 'Summary', icon: BookOpen },
        { id: 'mcqs', label: 'MCQs', icon: Target },
      ];

  const renderContent = () => {
    const components = {
      table: (props: any) => <table className="w-full border-collapse border border-gray-300" {...props} />,
      th: (props: any) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
      td: (props: any) => <td className="border border-gray-300 px-4 py-2" {...props} />,
    };

    const renderWithKeywords = (markdown: string, keywords: string[]) => {
      if (!keywords || keywords.length === 0) {
        return <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
      }
  
      const componentsWithKeywords = {
        ...components,
        p: ({ node, ...props }: any) => {
          const children = props.children;
          
          if (!children || !Array.isArray(children)) {
            return <p {...props}>{children}</p>;
          }
  
          const processChildren = (nodes: any[]): any[] => {
            return nodes.flatMap((child: any, index: number) => {
              if (typeof child === 'string') {
                const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
                const parts = child.split(regex);
                return parts.map((part, i) => {
                  const isKeyword = typeof part === 'string' && keywords.some(kw => kw && kw.toLowerCase() === part.toLowerCase());
                  if (isKeyword) {
                    return (
                      <Keyword key={`${index}-${i}`} keyword={part} article={article}>
                        {part}
                      </Keyword>
                    );
                  }
                  return part;
                });
              }
              if (child.props && child.props.children) {
                return {
                  ...child,
                  props: {
                    ...child.props,
                    children: processChildren(Array.isArray(child.props.children) ? child.props.children : [child.props.children])
                  }
                };
              }
              return child;
            });
          };
  
          return <p {...props}>{processChildren(children)}</p>;
        },
      };
  
      return <ReactMarkdown components={componentsWithKeywords} remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>;
    };

    if (!article) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return <div>
          <p className="text-lg leading-relaxed text-gray-800">{article.summary}</p>
        </div>;
      case 'prelims':
        return loadingPrelims
          ? <div className="flex flex-col justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              {showNotifyButton && (
                <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs text-center max-w-xs"
                  >
                    <p className="font-semibold">You're the first to see this!</p>
                    <p>We're gathering the relevant parts, which takes about a minute. This is a one-time process.</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={async () => {
                        triggerHaptic();
                        if (userId && article) {
                          const { data, error } = await supabase.from('notifications').insert([
                            { user_id: userId, title: 'Your requested article is loading', message: article.title, status: 'loading', article_id: article.id, is_read: false }
                          ]).select();
                          
                          if (data) {
                            setNotificationId(data[0].id);
                          }
                          showToast('You will be notified when the data is ready.');
                          ionRouter.push('/home', 'root');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap shadow-lg border bg-white/30 backdrop-blur-lg text-gray-800 border-white/20"
                    >
                      <Bell size={16} className="mr-2" />
                      Notify me when done
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                {prelimsData?.markdown}
              </ReactMarkdown>
            </motion.div>;
      case 'mains':
        return loadingMains
          ? <div className="flex flex-col justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              {showNotifyButton && (
                <div className="fixed bottom-20 left-0 right-0 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs text-center max-w-xs"
                  >
                    <p className="font-semibold">You're the first to see this!</p>
                    <p>We're gathering the relevant parts, which takes about a minute. This is a one-time process. You can press notify button and enjoy we will send the loaded article straight to your notification</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={async () => {
                        triggerHaptic();
                        if (userId && article) {
                          const { data, error } = await supabase.from('notifications').insert([
                            { user_id: userId, title: 'Your requested article is loading', message: article.title, status: 'loading', article_id: article.id, is_read: false }
                          ]).select();

                          if (data) {
                            setNotificationId(data[0].id);
                          }
                          showToast('You will be notified when the data is ready.');
                          ionRouter.push('/home', 'root');
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 whitespace-nowrap shadow-lg border bg-white/30 backdrop-blur-lg text-gray-800 border-white/20"
                    >
                      <Bell size={16} className="mr-2" />
                      Notify me when done
                    </button>
                  </motion.div>
                </div>
              )}
            </div>
          : <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {mainsData ? renderWithKeywords(mainsData.markdown, mainsData.keywords) : null}
            </motion.div>;
      default:
        return <p>Coming soon.</p>;
    }
  };

  if (!article) {
    return (
      <IonPage>
        <IonContent>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent scrollEvents={true} onIonScroll={handleScroll} className="bg-gray-50">
        <div className="relative">
          {/* Header Image and Buttons */}
          <div className="fixed top-0 left-0 right-0 h-96 z-0">
            <img
              src={article.image_url}
              alt={article.title}
              className={`object-cover w-full h-full ${
                article.source === 'Google' ? 'blur-sm brightness-50' : ''
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-24 left-4 right-4 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold">{article.title}</h1>
              </motion.div>
            </div>
          </div>

          {/* Back and Bookmark Buttons */}
          <div className="fixed top-6 left-4 z-20 flex gap-2">
            <button onClick={() => ionRouter.goBack()} className="bg-black/40 text-white p-2 rounded-full">
              <ArrowLeft size={20} />
            </button>
            <button onClick={toggleBookmark} className="bg-black/40 text-white p-2 rounded-full">
              <Bookmark size={20} className={isBookmarked ? 'fill-yellow-400' : ''} />
            </button>
          </div>

          {/* Main Body */}
          <div className="relative z-10 pt-80 pb-48">
            <div className="bg-white rounded-t-3xl px-6 py-2 min-h-[calc(100vh-20rem)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Floating Tab Bar */}
          <footer className="fixed bottom-4 inset-x-4 z-40">
            <motion.div className="grid grid-cols-3 bg-white/30 backdrop-blur-lg px-2 py-2 rounded-xl shadow-md">
              {buttons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={async () => {
                    setActiveTab(btn.id);
                    await triggerHaptic();
                  }}
                  className={`flex flex-col items-center text-xs ${activeTab === btn.id ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  <btn.icon size={18} />
                  <span>{btn.label}</span>
                </button>
              ))}
            </motion.div>

          </footer>

          {/* Floating Action Button for Tests */}
          <AnimatePresence>
            {showTestText && ((activeTab === 'prelims' && prelimsData) || (activeTab === 'mains' && mainsData)) && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 right-4 z-40"
              >
                <button
                  onClick={async () => {
                    if (activeTab === 'prelims') {
                      setIsTestDrawerOpen(true);
                    } else if (activeTab === 'mains') {
                      setIsValueAddDrawerOpen(true);
                    }
                    await triggerHaptic();
                  }}
                  className="bg-white/30 backdrop-blur-lg text-gray-800 border border-white/20 px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
                >
                  <Lightbulb size={18} />
                  <span>
                    {activeTab === 'prelims' ? 'Test Your Knowledge' : 'Value Added Points'}
                  </span>
                </button>
                {activeTab === 'mains' && (
                  <button
                    onClick={async () => {
                      setIsQuestionsDrawerOpen(true);
                      await triggerHaptic();
                    }}
                    className="bg-white/30 backdrop-blur-lg text-gray-800 border border-white/20 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 mt-4"
                  >
                    <FileText size={18} />
                    <span>Questions</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Test Drawers */}
          <TestDrawer
            isOpen={isTestDrawerOpen}
            onClose={() => setIsTestDrawerOpen(false)}
            mcqs={prelimsData?.mcqs || []}
          />
          <ValueAddDrawer
            isOpen={isValueAddDrawerOpen}
            onClose={() => setIsValueAddDrawerOpen(false)}
            points={mainsData?.points || []}
          />
          <QuestionsDrawer
            isOpen={isQuestionsDrawerOpen}
            onClose={() => setIsQuestionsDrawerOpen(false)}
            questions={mainsData?.questions || []}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ArticlePage;
