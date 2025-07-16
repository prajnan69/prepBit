import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { useHaptics } from '../../hooks/useHaptics';
import { CustomStateSelector } from './CustomStateSelector'; // Adjust path

// --- Mock Hook for demonstration ---
const useHaptics = () => ({ triggerHaptic: () => console.log('Haptic Triggered') });
const CheckIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

interface ExamSelectionPageProps {
  onContinue: (exam: string, state?: string) => void;
}

const exams = ['UPSC', 'SSC CGL', 'Banking', 'Other state level exam'];
const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands',
  'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ExamSelectionPage = ({ onContinue }: ExamSelectionPageProps) => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const { triggerHaptic } = useHaptics();

  const handleExamSelect = (exam: string) => {
    triggerHaptic();
    setSelectedExam(exam);
    if (exam !== 'Other state level exam') {
      setSelectedState('');
    }
  };

  const handleContinue = () => {
    triggerHaptic();
    onContinue(selectedExam, selectedState);
  };

  const isContinueDisabled = !selectedExam || (selectedExam === 'Other state level exam' && !selectedState);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 p-6 font-sans">
      <motion.div
        className="flex-grow flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Which exam are you preparing for?
        </motion.h1>
        
        <div className="w-full max-w-md">
          <motion.div variants={containerVariants}>
            {exams.map((exam) => (
              <motion.button
                key={exam}
                onClick={() => handleExamSelect(exam)}
                variants={itemVariants}
                className={`relative w-full p-5 mb-4 rounded-xl text-left text-lg font-medium transition-all duration-300
                            border-2  ${
                              selectedExam === exam
                                ? 'bg-blue-400 border-indigo-500 text-white'
                                : 'bg-slate-100 border-slate-200 hover:border-slate-500'
                            }`}
              >
                {exam}
                {selectedExam === exam && (
                  <motion.img
                    layoutId="selected-exam-owl"
                    src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_examselection.png"
                    alt="Selected"
                    transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.5 }}
                    className="absolute right-4 top-1/3 -translate-y-1/2 w-12 h-12"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence>
            {selectedExam === 'Other state level exam' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <CustomStateSelector 
                  states={states}
                  selectedState={selectedState}
                  onSelectState={(state) => {
                    triggerHaptic();
                    setSelectedState(state);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="flex-shrink-0 w-full max-w-md mx-auto pb-4">
        <button
          onClick={handleContinue}
          disabled={isContinueDisabled}
          className="w-full bg-blue-600 text-white font-semibold py-6 rounded-full shadow-lg shadow-indigo-500/30
                     hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed
                     focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
                     transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ExamSelectionPage;
