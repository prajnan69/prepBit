import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import NewsSection from './ValueProposition/NewsSection';
import BacktrackSection from './ValueProposition/BacktrackSection';
import TailoredSection from './ValueProposition/TailoredSection';
import McqSection from './ValueProposition/McqSection';
import SearchSection from './ValueProposition/SearchSection';
import { useIonRouter } from '@ionic/react';

const ValuePropositionPage = () => {
  const [step, setStep] = useState(1);
  const { triggerHaptic } = useHaptics();
  const ionRouter = useIonRouter();

  const nextStep = () => {
    triggerHaptic();
    if (step < 5) {
      setStep(step + 1);
    } else {
      ionRouter.push('/onboarding', 'root', 'replace');
    }
  };

  const prevStep = () => {
    triggerHaptic();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const skip = () => {
    triggerHaptic();
    ionRouter.push('/onboarding', 'root', 'replace');
  };

  const handleDotClick = (index: number) => {
    triggerHaptic();
    setStep(index + 1);
  };

  const sections = [
    <NewsSection />,
    <BacktrackSection />,
    <TailoredSection />,
    <McqSection />,
    <SearchSection />,
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      <div className="flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;

              if (swipe < -10000) {
                nextStep();
              } else if (swipe > 10000) {
                prevStep();
              }
            }}
          >
            {sections[step - 1]}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`w-2 h-2 rounded-full mx-1 focus:outline-none ${
                step === i + 1 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-8 py-6 rounded-full shadow-lg w-full"
          >
            Continue
          </button>
          <button
            onClick={skip}
            className="text-gray-500 text-sm mt-4"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValuePropositionPage;
