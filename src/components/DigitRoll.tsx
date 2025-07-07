import { motion } from 'framer-motion';

const DigitRoll = ({ digit }: { digit: string }) => {
  if (digit === '.') {
    return <span className="h-8 w-6 text-3xl font-bold text-white">.</span>;
  }

  return (
    <div className="h-8 w-6 overflow-hidden">
      <motion.div
        animate={{ y: -parseInt(digit) * 2 + 'rem' }}
        transition={{ duration: 2, ease: 'easeInOut' }}
        className="flex flex-col"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-8 w-6 text-3xl font-bold text-white">
            {i}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default DigitRoll;
