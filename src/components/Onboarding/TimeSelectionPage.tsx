import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';
import RotaryTimePicker from './RotaryTimePicker';

// --- Component Props ---
interface TimeSelectionPageProps {
  onContinue: (time: string) => void;
}

// --- NEW: Color Themes for Different Times of Day ---
const timeThemes = {
  nightOwl: {
    background: 'bg-slate-100',
    text: 'text-slate-600',
    button: 'bg-slate-500',
    buttonHover: 'hover:bg-slate-600',
    shadow: 'shadow-slate-500/30',
  },
  earlyBird: {
    background: 'bg-amber-50',
    text: 'text-amber-700',
    button: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
    shadow: 'shadow-amber-500/30',
  },
  afternoon: {
    background: 'bg-sky-50',
    text: 'text-sky-700',
    button: 'bg-sky-500',
    buttonHover: 'hover:bg-sky-600',
    shadow: 'shadow-sky-500/30',
  },
  lateNight: {
    background: 'bg-indigo-50',
    text: 'text-indigo-700',
    button: 'bg-indigo-600',
    buttonHover: 'hover:bg-indigo-700',
    shadow: 'shadow-indigo-500/30',
  },
};

const wittyMessages: { [key: string]: string } = {
  nightOwl: 'Up before the sun! A true night owl.',
  earlyBird: 'An early bird! Ready to seize the day.',
  afternoon: 'An afternoon achiever! Let’s get it done.',
  lateNight: 'A late-night learner! Burning the midnight oil.',
};

const TimeSelectionPage = ({ onContinue }: TimeSelectionPageProps) => {
  const [time, setTime] = useState('09:00');
  const [messageKey, setMessageKey] = useState<keyof typeof timeThemes>('earlyBird');
  const { triggerHaptic } = useHaptics();

  const getMessageKeyForTime = (currentTime: string): keyof typeof timeThemes => {
    const hour = parseInt(currentTime.split(':')[0], 10);
    if (hour < 6) return 'nightOwl';
    if (hour < 12) return 'earlyBird';
    if (hour < 18) return 'afternoon';
    return 'lateNight';
  };

  useEffect(() => {
    setMessageKey(getMessageKeyForTime(time));
  }, [time]);

  // UPDATED: Get the current theme based on the messageKey, with a fallback
  const currentTheme = timeThemes[messageKey] || timeThemes.lateNight;

  return (
    // UPDATED: Dynamic background class with smooth transition
    <div
      className={`flex flex-col h-screen p-6 font-sans transition-colors duration-500 ${currentTheme.background}`}
    >
      <div className="flex-grow flex flex-col justify-center items-center text-center gap-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
            Best time to notify?
          </h1>
          <p className="text-slate-500 mt-2">
            Drag around the clock to set your daily summary time.
          </p>
        </motion.div>

        <motion.div
          className="my-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
        >
          <RotaryTimePicker time={time} setTime={setTime} triggerHaptic={triggerHaptic} />
        </motion.div>

        <div className="min-h-[50px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {messageKey && (
              <motion.p
                key={messageKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                // UPDATED: Dynamic text color
                className={`font-medium text-lg ${currentTheme.text}`}
              >
                {wittyMessages[messageKey]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-shrink-0 w-full max-w-xs mx-auto pb-4">
        <button
          onClick={() => {
            triggerHaptic();
            onContinue(time);
          }}
          // UPDATED: Dynamic button classes
          className={`w-full text-white font-semibold py-6 rounded-full shadow-lg transition-all duration-300
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                     ${currentTheme.button} 
                     ${currentTheme.buttonHover} 
                     ${currentTheme.shadow}`}
        >
          Set Time & Continue
        </button>
      </div>
    </div>
  );
};

export default TimeSelectionPage;
