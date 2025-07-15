import { useState } from 'react';
import { useHaptics } from '../../hooks/useHaptics';
import { topics } from '../../lib/topics';

interface InterestsPageProps {
  onContinue: (interests: string[]) => void;
}

const InterestsPage = ({ onContinue }: InterestsPageProps) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const { triggerHaptic } = useHaptics();

  const toggleInterest = (interest: string) => {
    triggerHaptic();
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleContinue = () => {
    triggerHaptic();
    onContinue(selectedInterests);
  };

  const handleSkip = () => {
    triggerHaptic();
    onContinue([]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6">
      <div className="flex-grow overflow-y-auto">
        <h1 className="text-2xl font-bold text-center mb-4">Let's understand your interests</h1>
        <p className="text-md text-gray-600 text-center mb-6">What topics do you like in your exam?</p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => toggleInterest(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedInterests.includes(topic)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 pt-4 text-center bg-transparent">
        <button
          onClick={handleContinue}
          className="w-full max-w-sm mx-auto bg-blue-600 backdrop-blur-xl text-white px-8 py-6 rounded-full shadow-lg border border-white/20"
        >
          Continue
        </button>
        <button
          onClick={handleSkip}
          className="mt-4 text-gray-600"
        >
          I don't like any
        </button>
      </div>
    </div>
  );
};

export default InterestsPage;
