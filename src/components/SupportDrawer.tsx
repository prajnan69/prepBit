import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SupportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'bug' | 'feedback' | 'urgent';
  showToast: (message: string) => void;
}

const SupportDrawer = ({ isOpen, onClose, type, showToast }: SupportDrawerProps) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      showToast('Please enter a message.');
      return;
    }

    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('support_tickets')
        .insert({ user_id: user.id, type, message });

      if (error) {
        showToast('Error submitting your request. Please try again.');
        console.error('Error inserting support ticket:', error);
      } else {
        if (type === 'feedback') {
          showToast('Thanks for your feedback!');
        } else {
          showToast('Sorry for the inconvenience. Our team will revert within an hour.');
        }
        setMessage('');
        onClose();
      }
    }
    setIsSubmitting(false);
  };

  const getTitle = () => {
    switch (type) {
      case 'bug':
        return 'Report a Bug';
      case 'feedback':
        return 'Provide Feedback';
      case 'urgent':
        return 'Urgent Resolution';
      default:
        return 'Support';
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
            className="bg-white rounded-t-2xl p-6 w-full max-w-md"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{getTitle()}</h2>
              <button onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe the issue or your feedback..."
              className="w-full h-32 p-2 border rounded-lg mb-4"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SupportDrawer;
