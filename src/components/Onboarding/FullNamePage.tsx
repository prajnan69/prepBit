import { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { motion, AnimatePresence } from 'framer-motion';

interface FullNamePageProps {
  onContinue: (name: string) => void;
}

const FullNamePage = ({ onContinue }: FullNamePageProps) => {
  const [name, setName] = useState('');
  const { triggerHaptic } = useHaptics();

  const handleContinue = () => {
    triggerHaptic();
    onContinue(name);
  };

  return (
    // Use a clean white background and add padding for spacing from screen edges.
    // Use flexbox to structure the layout with a main content area and a footer button.
    <div className="flex flex-col h-screen bg-white p-6 font-sans overflow-hidden">
      <AnimatePresence>
        <motion.img
          src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_fullname.png"
          alt="Owl"
          initial={{ x: '100vw' }}
          animate={{ x: '50%' }}
          exit={{ x: '100vw' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 1 }}
          className="absolute right-0 bottom-0 w-1/2 md:w-1/3"
        />
      </AnimatePresence>
      {/* Main content area that grows to fill available space */}
      <div className="flex-grow flex flex-col justify-center items-center">
        <div className="w-full max-w-xs text-center">
          {/* 
            The heading is split into two lines using <br /> for a precise line break.
            The font is large, bold, and uses a dark, slightly desaturated blue-gray color.
          */}
          <h1 className="text-4xl font-bold text-slate-800 leading-tight mb-3">
            Let's call you...
          </h1>
          
          {/* The sub-heading provides context with a softer, lighter text color. */}
          <p className="text-slate-500 mb-8">
            This will be displayed on your profile.
          </p>

          {/* Accessible label for the input, visually hidden but read by screen readers */}
          <label htmlFor="fullName" className="sr-only">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full p-4 border border-slate-300 rounded-xl text-lg
                       placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                       transition"
          />
        </div>
      </div>

      {/* 
        Footer area for the button. It doesn't shrink, ensuring it's always at the bottom.
        The `pb-4` adds safe area padding for devices with home bars.
      */}
      <div className="flex-shrink-0 pb-4">
        <div className="w-full max-w-xs mx-auto">
          <button
            onClick={handleContinue}
            disabled={!name.trim()}
            className="w-full bg-blue-600 text-white font-semibold py-6 rounded-full shadow-lg shadow-indigo-500/20
                       hover:bg-blue-700
                       focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullNamePage;
