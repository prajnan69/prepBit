import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Image, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useIonRouter } from '@ionic/react';
import { useHaptics } from '../hooks/useHaptics';

interface ArticleCardProps {
  article: any;
  showToast: (message: string) => void;
  isReadLaterPage?: boolean;
  onDismiss?: (id: any) => void;
}

const ArticleCard = ({ article, showToast, isReadLaterPage = false, onDismiss }: ArticleCardProps) => {
  const ionRouter = useIonRouter();
  const [isReadLater, setIsReadLater] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { triggerHaptic } = useHaptics();
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ['#3b82f6', '#ffffff']
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const checkIfReadLater = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('read_later')
          .select('*')
          .eq('user_id', userId)
          .eq('article_id', article.id);
        if (data && data.length > 0) {
          setIsReadLater(true);
        }
      }
    };
    checkIfReadLater();
  }, [userId, article.id]);

  const toggleReadLater = async () => {
    if (!userId) return;

    if (isReadLater) {
      await supabase
        .from('read_later')
        .delete()
        .eq('user_id', userId)
        .eq('article_id', article.id);
      setIsReadLater(false);
      showToast('Removed from Read Later');
    } else {
      await supabase
        .from('read_later')
        .insert({ user_id: userId, article_id: article.id });
      setIsReadLater(true);
      showToast('Added to Read Later');
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x < -100) {
      triggerHaptic();
      toggleReadLater();
      if (isReadLaterPage && onDismiss) {
        onDismiss(article.id);
      }
    }
  };

  return (
    <div className="relative my-2">
      <motion.div
        style={{ background }}
        className="absolute inset-0 rounded-2xl flex items-center justify-end pr-8"
      >
        <div className="flex items-center space-x-2 text-white">
          <Clock size={18} />
          <span>Read Later</span>
        </div>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`${isReadLater && !isReadLaterPage ? ' bg-yellow-50' : 'bg-white'} p-4 rounded-2xl shadow-sm border border-neutral-200 cursor-pointer relative`}
        onClick={(e) => {
          triggerHaptic();
          (e.currentTarget as HTMLElement).blur();
          ionRouter.push(`/article/${article.id}`);
        }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        layout
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      >
        <div className="flex gap-4 items-start">
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-20 h-20 aspect-square object-cover rounded-lg bg-gray-100"
            />
          ) : (
            <div className="w-20 h-20 aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <Image className="text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold leading-tight text-neutral-800 line-clamp-2">
                {article.title}
              </h2>
            </div>
            <div className="flex items-center text-xs text-neutral-500 mt-2">
              <span>{new Date(article.published_at).toLocaleDateString('en-GB')}</span>
              <span className="mx-1.5">•</span>
              <span>{article.source}</span>
              {article.is_important && (
                <div className="ml-2 flex items-center justify-center w-3 h-3 bg-red-400 rounded-full text-white text-[8px] font-bold">
                  i
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ArticleCard;
