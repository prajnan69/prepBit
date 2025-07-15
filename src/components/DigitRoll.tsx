import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const SIZES = {
  '3xl': { height: 40, class: 'text-3xl' },
  'xl': { height: 32, class: 'text-xl' },
};

const DIGIT_LIST = [...Array(10).keys()].reverse(); // [9,8,...,0]

export default function DigitRoll({
  from,
  to,
  size = '3xl',
  isAnimating,
  className,
}: {
  from: string;
  to: string;
  size?: keyof typeof SIZES;
  isAnimating: boolean;
  className?: string;
}) {
  const { height, class: textClass } = SIZES[size];
  const fromDigit = parseInt(from);
  const toDigit = parseInt(to);

  const isDigit = !isNaN(toDigit);
  if (!isDigit) {
    return (
      <span className={cn(`inline-block min-w-[1ch] font-bold text-white`, textClass, className)} style={{ height, lineHeight: `${height}px` }}>
        {to}
      </span>
    );
  }

  if (!isAnimating || from === to) {
    return (
      <span className={cn(`inline-block min-w-[1ch] font-bold text-white`, textClass, className)} style={{ height, lineHeight: `${height}px` }}>
        {to}
      </span>
    );
  }

  const fromIndex = DIGIT_LIST.indexOf(fromDigit);
  const toIndex = DIGIT_LIST.indexOf(toDigit);

  return (
    <div className="w-[1.2ch] overflow-hidden inline-block align-baseline" style={{ height }}>
      <motion.div
        initial={{ y: -fromIndex * height }}
        animate={{ y: -toIndex * height }}
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
        className="flex flex-col"
      >
        {DIGIT_LIST.map((digit) => (
          <span
            key={digit}
            className={cn(
              'font-bold text-white text-center min-w-[1ch]',
              textClass,
              className
            )}
            style={{ height, lineHeight: `${height}px` }}
          >
            {digit}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
