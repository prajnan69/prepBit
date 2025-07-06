import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

interface NotificationToastProps {
  notification: {
    id: string;
    title: string;
    message: string;
  } | null;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000); // Auto-close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 w-80 bg-white p-4 rounded-xl shadow-lg border z-50"
        >
          <div className="flex items-start">
            <div className="flex-1">
              <p className="font-bold text-gray-800">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
            <button onClick={handleClose} className="ml-2 text-gray-500 hover:text-gray-800">
              <FiX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
