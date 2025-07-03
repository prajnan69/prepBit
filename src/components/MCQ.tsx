import { useState } from 'react';
import { motion } from 'framer-motion';

interface MCQProps {
  mcq: {
    question: string;
    options: string[];
    answer: string;
  };
}

const MCQ = ({ mcq }: MCQProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const options = Array.isArray(mcq.options) ? mcq.options : Object.values(mcq.options);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-gray-100 hover:bg-gray-200';
    }
    if (option === mcq.answer) {
      return 'bg-green-200';
    }
    if (option === selectedOption) {
      return 'bg-red-200';
    }
    return 'bg-gray-100';
  };

  return (
    <div className="p-4 my-4 border rounded-lg">
      <p className="font-semibold">{mcq.question}</p>
      <div className="grid grid-cols-1 gap-2 mt-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleOptionClick(option as string)}
            className={`p-2 rounded-lg text-left ${getButtonClass(option as string)}`}
            whileTap={{ scale: 0.95 }}
          >
            {option as string}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MCQ;
