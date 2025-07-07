import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-white flex flex-col text-left",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
