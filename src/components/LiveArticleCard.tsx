import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Image, Clock } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useIonRouter } from '@ionic/react';
import { useHaptics } from '../hooks/useHaptics';

interface LiveArticleCardProps {
  article: any;
}

import { Browser } from '@capacitor/browser';
import { useAuth } from '../hooks/useAuth';

const LiveArticleCard = ({ article }: LiveArticleCardProps) => {
  const { triggerHaptic } = useHaptics();
  const { session } = useAuth();
  const user = session?.user;

  const timeAgo = (date: string) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="relative my-2">
      <motion.div
        className={'bg-white p-4 rounded-2xl shadow-sm border border-neutral-200 cursor-pointer'}
        onClick={async () => {
          triggerHaptic();
          if (user) {
            const { data: stats, error } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', user.id)
              .single();

            if (error && error.code !== 'PGRST116') {
              console.error('Error fetching user stats:', error);
            } else if (stats) {
              await supabase.from('user_stats').update({ links_opened: stats.links_opened + 1 }).eq('user_id', user.id);
            } else {
              await supabase.from('user_stats').insert({ user_id: user.id, links_opened: 1 });
            }
          }
          Browser.open({ url: article.link });
        }}
        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.99 }}
        layout
        variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold leading-tight text-neutral-800 line-clamp-2">
              {article.title}
            </h2>
          </div>
          <div className="flex items-center text-xs text-neutral-500 mt-2">
            <span>{timeAgo(article.created_at)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LiveArticleCard;
