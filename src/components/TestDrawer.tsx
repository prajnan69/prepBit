import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import MCQ from './MCQ';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';

interface TestDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mcqs: any[];
}

const TestDrawer = ({ isOpen, onClose, mcqs }: TestDrawerProps) => {
  const { session } = useAuth();
  const user = session?.user;

  const handleAnswer = async (isCorrect: boolean) => {
    if (!user) return;

    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found'
      console.error('Error fetching user stats:', error);
      return;
    }

    if (stats) {
      const updatedStats = {
        mcqs_solved: stats.mcqs_solved + 1,
        mcqs_correct: isCorrect ? stats.mcqs_correct + 1 : stats.mcqs_correct,
      };
      await supabase.from('user_stats').update(updatedStats).eq('user_id', user.id);
    } else {
      const newStats = {
        user_id: user.id,
        mcqs_solved: 1,
        mcqs_correct: isCorrect ? 1 : 0,
      };
      await supabase.from('user_stats').insert(newStats);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Test Your Knowledge</h2>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            {mcqs.map((mcq, index) => (
              <MCQ key={index} mcq={mcq} onAnswer={handleAnswer} />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TestDrawer;
