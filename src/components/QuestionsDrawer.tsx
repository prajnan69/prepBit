import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface QuestionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questions: string[];
}

const QuestionsDrawer = ({ isOpen, onClose, questions }: QuestionsDrawerProps) => {
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
              <h2 className="text-xl font-bold">Questions</h2>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            <ul className="space-y-4">
              {questions.map((question, index) => (
                <li key={index} className="p-4 bg-gray-100 rounded-lg">
                  <p className="font-semibold text-gray-800">{question}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestionsDrawer;
