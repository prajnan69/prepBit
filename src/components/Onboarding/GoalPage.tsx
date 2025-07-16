import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';

interface GoalPageProps {
  onContinue: (goal: string) => void;
}

const goals = [
  {
    text: 'Analyze previous year question papers',
    feature: 'Our BackTrack feature is perfect for that!',
  },
  { text: 'Practice answer writing', feature: 'You’re in the right place!' },
  {
    text: 'Improve my MCQ-solving speed',
    feature: 'Our MCQs will get you up to speed!',
  },
  {
    text: 'Stay on top of current events',
    feature: 'Our news feed has you covered!',
  },
  {
    text: 'Master a specific subject',
    feature: 'We’ve got the resources you need!',
  },
  { text: 'Just exploring', feature: 'Happy to have you with us!' },
];

const GoalPage = ({ onContinue }: GoalPageProps) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [wittyMessage, setWittyMessage] = useState('');
  const { triggerHaptic } = useHaptics();

  const handleSelectGoal = (goal: string, feature: string) => {
    triggerHaptic();
    setSelectedGoal(goal);
    setWittyMessage(feature);
    setTimeout(() => {
      onContinue(goal);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6 text-center overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center relative">
        <motion.img
          src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_goal.png"
          alt="Goal"
          initial={{ y: '-100vh' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full"
        />
        <h1 className="text-3xl font-bold mb-8">What is your goal?</h1>
        <div className="w-full max-w-sm">
          {wittyMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-medium text-blue-600"
            >
              {wittyMessage}
            </motion.div>
          ) : (
            goals.map(({ text, feature }) => (
              <button
                key={text}
                onClick={() => handleSelectGoal(text, feature)}
                disabled={!!wittyMessage}
                className="w-full p-4 mb-4 rounded-lg text-left transition-colors bg-white disabled:opacity-50"
              >
                {text}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalPage;
