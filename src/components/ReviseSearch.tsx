import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ChevronDown } from 'lucide-react';

interface ReviseSearchProps {
  item: {
    id: any;
    content: {
      question: string;
      answer: string;
    };
  };
}

const ReviseSearch = ({ item }: ReviseSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 my-2 border rounded-lg">
      <motion.div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="font-semibold">{item.content.question}</p>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <ReactMarkdown>{item.content.answer}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviseSearch;
