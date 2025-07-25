import { useEffect, useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { topics } from '../../lib/topics';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface DifficultiesPageProps {
  interests: string[];
  onContinue: (difficulties: string[]) => void;
}

const DifficultiesPage = ({ interests, onContinue }: DifficultiesPageProps) => {
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const { triggerHaptic } = useHaptics();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      x: '50%',
      transition: { duration: 0.5, ease: 'easeOut' },
    });
  }, [controls]);

  const toggleDifficulty = (difficulty: string) => {
    triggerHaptic();
    if (interests.includes(difficulty)) {
      controls.start({
        x: '25%',
        transition: { duration: 0.5, ease: 'easeOut' },
      }).then(() => {
        setTimeout(() => {
          controls.start({
            x: '50%',
            transition: { duration: 0.5, ease: 'easeOut' },
          });
        }, 2000);
      });
      return;
    }
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((i) => i !== difficulty)
        : [...prev, difficulty]
    );
  };

  const handleContinue = () => {
    triggerHaptic();
    onContinue(selectedDifficulties);
  };

  const handleSkip = () => {
    triggerHaptic();
    onContinue([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      <div className="flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-4">What do you find difficult?</h1>
        <p className="text-md text-gray-600 text-center mb-6">Select topics you find challenging, unlike, or absolutely hate.</p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleDifficulty(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulties.includes(topic)
                  ? 'bg-red-600 text-white'
                  : interests.includes(topic)
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 pt-4 text-center bg-transparent">
        <button
          onClick={handleContinue}
          className="w-full max-w-sm mx-auto bg-blue-600 backdrop-blur-xl text-white px-8 py-6 rounded-full shadow-lg border border-white/20"
        >
          Continue
        </button>
        <button
          onClick={handleSkip}
          className="mt-4 text-gray-600"
        >
          I don't find anything difficult
        </button>
        <AnimatePresence>
          <motion.img
            id="difficulty-owl"
            src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_difficulties.png"
            alt="Owl"
            initial={{ x: '100vw' }}
            animate={controls}
            exit={{ x: '100vw' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute right-0 bottom-20 w-1/2 md:w-1/3"
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DifficultiesPage;
