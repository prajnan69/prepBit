import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import debounce from 'lodash.debounce';
import { CSSTransition } from 'react-transition-group';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../context/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import './UsernamePage.css';

interface UsernamePageProps {
  name: string;
  onContinue: (username: string) => void;
}

const UsernamePage = ({ name, onContinue }: UsernamePageProps) => {
  const [username, setUsername] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [buttonText, setButtonText] = useState('Continue');
  const { profile, refetchProfile } = useProfile();
  const { triggerHaptic } = useHaptics();
  const checkingRef = useRef(null);
  const availableRef = useRef(null);
  const takenRef = useRef(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(value);
  };

  const checkUsername = useCallback(
    debounce(async (value: string) => {
      if (value.length > 2) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', value);

        if (error) {
          console.error('Error checking username:', error);
          setIsAvailable(null);
        } else {
          setIsAvailable(data.length === 0);
        }
        setLoading(false);
      } else {
        setIsAvailable(null);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (username) {
      checkUsername(username);
    }
  }, [username, checkUsername]);

  const handleContinue = async () => {
    triggerHaptic();
    if (username && isAvailable) {
      if (profile) {
        setButtonText('That sounds great...');
        const { error } = await supabase
          .from('profiles')
          .update({ username })
          .eq('id', profile.id);

        if (error) {
          console.error('Error updating username:', error);
          setButtonText('Continue');
        } else {
          refetchProfile();
          setTimeout(() => {
            onContinue(username);
          }, 1000);
        }
      } else {
        // If profile is not yet available, just continue and save later.
        onContinue(username);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 p-6 text-center overflow-hidden">
      <AnimatePresence>
        <motion.img
          src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_username.png"
          alt="Owl"
          initial={{ y: '-100vh' }}
          animate={{ y: 0 }}
          exit={{ y: '-100vh' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-0 left-0 w-1/3"
        />
      </AnimatePresence>
      <div className="flex-grow flex flex-col items-center justify-center relative">
        <h1 className="text-3xl font-bold mb-4">Hi {name} 👋</h1>
        <p className="text-lg text-gray-600 mb-8">This will be displayed on your profile.</p>

        <div className="w-full max-w-sm mb-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="username"
              className="w-full pl-8 p-4 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="h-6 mt-1 text-sm text-center">
            <CSSTransition
              in={loading}
              timeout={300}
              classNames="fade"
              unmountOnExit
              nodeRef={checkingRef}
            >
              <p className="text-gray-500" ref={checkingRef}>Checking...</p>
            </CSSTransition>
            <CSSTransition
              in={isAvailable === true}
              timeout={300}
              classNames="fade"
              unmountOnExit
              nodeRef={availableRef}
            >
              <p className="text-green-500" ref={availableRef}>Username is available!</p>
            </CSSTransition>
            <CSSTransition
              in={isAvailable === false}
              timeout={300}
              classNames="fade"
              unmountOnExit
              nodeRef={takenRef}
            >
              <p className="text-red-500" ref={takenRef}>Username is taken.</p>
            </CSSTransition>
          </div>
        </div>
      </div>
      <div className="flex-shrink-0 relative">
        <button
          onClick={handleContinue}
          disabled={!username || !isAvailable || buttonText !== 'Continue'}
          className="w-full max-w-sm bg-blue-600 text-white px-8 py-6 rounded-full shadow-lg disabled:opacity-50"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default UsernamePage;
