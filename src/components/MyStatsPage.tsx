import { useState, useEffect } from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useHaptics } from '../hooks/useHaptics';
import { useProfile } from '../context/ProfileContext';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

// --- Helper Components for a Cleaner Structure ---

const OverallScoreCard = ({ score, avatarUrl }: { score: number; avatarUrl?: string }) => {
  const percentage = Math.min(score / 1000, 1) * 100; // Cap at 1000 for 100%
  const [textColor, setTextColor] = useState('#18181b'); // Default to dark text (zinc-900)

  // This effect listens for changes to the <html> class list (e.g., when Tailwind's 'dark' class is added/removed)
  // and updates the progress bar's text color for perfect theme synchronization.
  useEffect(() => {
    const updateTextColor = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTextColor(isDark ? '#f4f4f5' : '#18181b'); // zinc-100 for dark, zinc-900 for light
    };
    
    updateTextColor(); // Set initial color

    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', damping: 15, stiffness: 100, delay: 0.2 }}
      className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-zinc-100 dark:bg-zinc-800 rounded-[28px]"
    >
      <img
        src={avatarUrl}
        alt="avatar"
        className="w-20 h-20 rounded-full border-4 border-white dark:border-zinc-700 shadow-lg mb-4"
      />
      <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Overall Score</h2>
      <p className="text-md text-zinc-500 dark:text-zinc-400 mb-6">Your Digital Wellbeing Score</p>
      <div className="w-48 h-48 sm:w-52 sm:h-52">
        <CircularProgressbar
          value={percentage}
          text={`${score}`}
          circleRatio={0.75}
          styles={buildStyles({
            rotation: 1 / 2 + 1 / 8,
            strokeLinecap: 'round', // Makes the progress bar path end rounded
            trailColor: 'rgba(0, 0, 0, 0.08)',
            pathColor: '#4ade80', // A vibrant, solid green (lime-400)
            textColor: textColor,
            textSize: '28px',
            pathTransitionDuration: 1.5,
          })}
        />
      </div>
    </motion.div>
  );
};

const StatRow = ({ icon, title, value, isNegative = false }: { icon: React.ReactNode; title: string; value: string | number; isNegative?: boolean }) => {
  const { triggerHaptic } = useHaptics();
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onTap={() => triggerHaptic()}
      className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800/70 rounded-2xl shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${isNegative ? 'bg-red-100 dark:bg-red-500/10' : 'bg-green-100 dark:bg-green-500/10'}`}>
          {icon}
        </div>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{title}</span>
      </div>
      <span className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">{value}</span>
    </motion.div>
  );
};


// --- Main Page Component ---

const MyStatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();
  const ionRouter = useIonRouter();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', user.id).single();
        if (error) { console.error('Error fetching stats:', error); } else { setStats(data); }
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const calculateOverallScore = (currentStats: any) => {
    if (!currentStats) return 0;
    const { mcqs_correct, mcqs_solved, time_spent_app, time_spent_live_feed, links_opened } = currentStats;
    const accuracyBonus = (mcqs_correct / (mcqs_solved || 1)) * 50;
    const timeBonus = Math.max(0, (time_spent_app / 60) - (time_spent_live_feed / 60));
    const linkPenalty = links_opened * 5;
    const score = (mcqs_correct * 5) + accuracyBonus + timeBonus - linkPenalty;
    return Math.round(Math.max(0, score));
  };

  const overallScore = stats ? calculateOverallScore(stats) : 0;

  const statItems = stats ? [
    { icon: <Clock size={20} className="text-green-600" />, title: "Time on App", value: `${Math.round(stats.time_spent_app / 60)} min` },
    { icon: <HelpCircle size={20} className="text-green-600" />, title: "MCQs Solved", value: stats.mcqs_solved },
    { icon: <CheckCircle2 size={20} className="text-green-600" />, title: "MCQs Correct", value: stats.mcqs_correct },
    { icon: <Flame size={20} className="text-red-500" />, title: "Live Feed Time", value: `${Math.round(stats.time_spent_live_feed / 60)} min`, isNegative: true },
    { icon: <ExternalLink size={20} className="text-red-500" />, title: "Links Opened", value: stats.links_opened, isNegative: true },
  ] : [];

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
  };

  return (
    <IonPage>
      <IonContent fullscreen className="ion-padding bg-gray-50 dark:bg-black">
        <div className="flex items-center justify-between -mx-4 -mt-4 mb-2">
           <button onClick={() => ionRouter.goBack()} className="p-4">
              <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
        </div>
        
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loader" className="flex justify-center items-center h-[calc(100vh-150px)]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-700 dark:border-gray-300"></div>
            </motion.div>
          ) : !stats ? (
            <motion.div key="no-stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-center">
              <TrendingUp size={64} className="text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">No stats to show yet!</p>
              <p className="text-gray-500 dark:text-gray-400">Keep using the app to see your progress.</p>
            </motion.div>
          ) : (
            <motion.div key="stats-content" className="flex flex-col gap-8">
               <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl font-bold text-center text-zinc-800 dark:text-zinc-100">
                  My Stats
                </motion.h1>

              <OverallScoreCard score={overallScore} avatarUrl={profile?.avatar_url} />

              <motion.div className="flex flex-col gap-3" variants={listVariants} initial="hidden" animate="visible">
                <h3 className="font-bold text-xl text-zinc-800 dark:text-zinc-100 px-2 mt-2">Detailed Stats</h3>
                {statItems.map((item, index) => (
                  <StatRow key={index} {...item} />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </IonContent>
    </IonPage>
  );
};

export default MyStatsPage;