import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Props Interface ---
interface LoaderPageProps {
  onComplete: () => void;
}

// --- A simple, reusable animated icon ---
// We define it here for simplicity, but it could be in its own file.
const SparklesIcon = (props: React.ComponentProps<'svg'>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 2.75L13.11 8.24L18.75 9.25L13.11 10.26L12 15.75L10.89 10.26L5.25 9.25L10.89 8.24L12 2.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.25 18H2.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 16.75V19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.25 18H18.75"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 16.75V19.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// --- Messages to cycle through ---
const loadingMessages = [
  'Personalizing your experience...',
  'Tailoring your news feed...',
  'Curating relevant MCQs...',
  'Setting up your performance analytics...',
  'Almost there...',
];

const LoaderPage = ({ onComplete }: LoaderPageProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Total duration of the loader
  const TOTAL_DURATION = 7000; // 5 seconds
  // How often to change the message
  const MESSAGE_INTERVAL = TOTAL_DURATION / loadingMessages.length;

  useEffect(() => {
    // Timer to cycle through messages
    const messageTimer = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, MESSAGE_INTERVAL);

    // Timer to call onComplete when the full duration has passed
    const completionTimer = setTimeout(() => {
      // We clear the message interval here to stop it from running after completion
      clearInterval(messageTimer);
      onComplete();
    }, TOTAL_DURATION);

    // Cleanup function to clear timers if the component unmounts
    return () => {
      clearInterval(messageTimer);
      clearTimeout(completionTimer);
    };
  }, [onComplete, MESSAGE_INTERVAL]);

  return (
    // We use a modern, dark slate color instead of gray
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white font-sans overflow-hidden">
      {/* 
        This is the main container for the animated content.
        We'll make it fade in for a smoother entry.
      */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* The icon pulses gently to create a "breathing" effect. */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-8 text-indigo-400"
        >
          <SparklesIcon className="w-16 h-16" />
        </motion.div>

        {/* 
          AnimatePresence allows the text to have a nice fade-in/fade-out
          transition each time it changes. The `key` is crucial for this.
        */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={currentMessageIndex}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="text-xl md:text-2xl font-medium text-slate-300"
          >
            {loadingMessages[currentMessageIndex]}
          </motion.h1>
        </AnimatePresence>
      </motion.div>

      {/* 
        The progress bar at the bottom provides a clear sense of overall progress.
        It has a subtle glow for a more premium feel.
      */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: TOTAL_DURATION / 1000, ease: 'linear' }}
          className="h-full bg-indigo-500 shadow-lg shadow-indigo-500/50"
        />
      </div>
    </div>
  );
};

export default LoaderPage;
