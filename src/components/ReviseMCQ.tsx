import { motion, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useHaptics } from '../hooks/useHaptics';
import { Clock } from 'lucide-react';

interface ReviseMCQProps {
  mcq: {
    id: any;
    question: string;
    options: string[];
    answer: string;
  };
  onDismiss: (id: any) => void;
}

const ReviseMCQ = ({ mcq, onDismiss }: ReviseMCQProps) => {
  const { triggerHaptic } = useHaptics();
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0],
    ['#ef4444', '#ffffff']
  );

  const handleDragEnd = async (event: any, info: any) => {
    if (info.offset.x < -100) {
      triggerHaptic();
      await supabase.from('revise').delete().eq('id', mcq.id);
      onDismiss(mcq.id);
    }
  };
  const options = Array.isArray(mcq.options) ? mcq.options : Object.values(mcq.options);

  const getButtonClass = (option: string) => {
    const isCorrect = option === mcq.answer;
    if (isCorrect) {
      return 'bg-green-200';
    }
    return 'bg-gray-100';
  };

  return (
    <div className="relative my-2">
      <motion.div
        style={{ background }}
        className="absolute inset-0 rounded-2xl flex items-center justify-end pr-8"
      >
        <div className="flex items-center space-x-2 text-white">
          <Clock size={18} />
          <span>Remove</span>
        </div>
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragSnapToOrigin
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="p-4 bg-white rounded-2xl shadow-sm border border-neutral-200 cursor-pointer relative"
      >
        <p className="font-semibold">{mcq.question}</p>
        <div className="grid grid-cols-1 gap-2 mt-4">
        {options.map((option, index) => (
          <motion.div
            key={index}
            className={`p-2 rounded-lg text-left ${getButtonClass(option as string)}`}
          >
            {option as string}
          </motion.div>
        ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ReviseMCQ;
