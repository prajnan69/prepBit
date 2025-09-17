import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const RatingModal = ({ isOpen, onClose, onConfirm }: RatingModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mt-4">Enjoying PrepBit?</h2>
            <p className="text-sm text-gray-600 mt-2">
              If you love our app, please take a moment to rate us on the Play Store. Your feedback helps us grow and improve!
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Rate Now
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RatingModal;
