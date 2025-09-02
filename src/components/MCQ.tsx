import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookmark } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';

interface MCQProps {
  mcq: {
    question: string;
    options: string[];
    answer: string;
  };
  onAnswer: (isCorrect: boolean) => void;
  showToast: (message: string) => void;
}

const MCQ = ({ mcq, onAnswer, showToast }: MCQProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isRevised, setIsRevised] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const checkIfRevised = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from('revise')
          .select('*')
          .eq('user_id', userId)
          .eq('content->>question', mcq.question);
        if (data && data.length > 0) {
          setIsRevised(true);
        }
      }
    };
    checkIfRevised();
  }, [userId, mcq.question]);

  const options = Array.isArray(mcq.options) ? mcq.options : Object.values(mcq.options);

  const handleOptionClick = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    onAnswer(option === mcq.answer);
  };

  const getButtonClass = (option: string) => {
    if (!isAnswered) {
      return 'bg-gray-100 hover:bg-gray-200';
    }

    const isCorrect = option === mcq.answer;
    const isSelected = option === selectedOption;

    if (isCorrect) {
      return 'bg-green-200';
    }

    if (isSelected && !isCorrect) {
      return 'bg-red-200';
    }

    return 'bg-gray-100';
  };

  return (
    <div className="p-4 my-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <p className="font-semibold flex-1">{mcq.question}</p>
        <button
          onClick={async () => {
            if (isRevised) {
              showToast('Already in Revise');
              return;
            }
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('revise').insert({
                user_id: user.id,
                content: mcq,
                type: 'mcq',
              });
              setIsRevised(true);
              showToast('Added to Revise');
            }
          }}
          className={`ml-4 ${isRevised ? 'text-yellow-500' : 'text-blue-500'}`}
        >
          <FiBookmark fill={isRevised ? 'currentColor' : 'none'} />
        </button>
      </div>
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
