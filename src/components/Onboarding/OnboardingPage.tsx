import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIonRouter } from '@ionic/react';
import { supabase } from '../../lib/supabaseClient';
import FullNamePage from './FullNamePage';
import UsernamePage from './UsernamePage';
import ExamSelectionPage from './ExamSelectionPage';
import InterestsPage from './InterestsPage';
import DifficultiesPage from './DifficultiesPage';
import LoaderPage from './LoaderPage';
import GoalPage from './GoalPage';
import NotificationsPage from './NotificationsPage';
import TimeSelectionPage from './TimeSelectionPage';
import { useProfile } from '../../context/ProfileContext';

interface UserData {
  name: string;
  username: string;
  exam: string;
  language: string;
  interests: string[];
  difficulties: string[];
  goal: string;
  notifications: boolean;
  dailyGoal: string;
  updateTime: string;
}

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    username: '',
    exam: '',
    language: '',
    interests: [],
    difficulties: [],
    goal: '',
    notifications: false,
    dailyGoal: '',
    updateTime: '09:00',
  });
  const ionRouter = useIonRouter();
  const { refetchProfile } = useProfile();

  useEffect(() => {
    const imageUrls = [
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_fullname.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_username.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_examselection.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_interests.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_difficulties.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_goal.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_notifications_on.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_notifications_off.png',
      'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_time.png',
    ];

    const preloadImages = async () => {
      const promises = imageUrls.map((src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = reject;
        });
      });

      try {
        await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Failed to preload images', error);
      }
    };

    preloadImages();
  }, []);

  const nextStep = () => setStep(step + 1);

  const handleFullNameContinue = async (name: string) => {
    setUserData({ ...userData, name });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').insert({ id: user.id, full_name: name });
    }
    nextStep();
  };

  const handleUsernameContinue = (username: string) => {
    setUserData({ ...userData, username });
    nextStep();
  };

  const handleExamSelectionContinue = (exam: string, state?: string) => {
    const examData = state ? `${exam} - ${state}` : exam;
    setUserData({ ...userData, exam: examData });
    nextStep();
  };

  const handleInterestsContinue = (interests: string[]) => {
    setUserData({ ...userData, interests });
    nextStep();
  };

  const handleDifficultiesContinue = async (difficulties: string[]) => {
    setUserData({ ...userData, difficulties });
    nextStep();
  };

  const handleGoalContinue = (goal: string) => {
    setUserData({ ...userData, goal });
    nextStep();
  };

  const handleNotificationsContinue = (settings: Record<string, boolean>) => {
    const anyNotificationEnabled = Object.values(settings).some(Boolean);
    setUserData({ ...userData, notifications: anyNotificationEnabled });
    nextStep();
  };

  const handleTimeSelectionContinue = async (time: string) => {
    const updatedUserData = { ...userData, updateTime: time };
    setUserData(updatedUserData);


    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: updatedUserData.username,
          exam: updatedUserData.exam,
          interests: updatedUserData.interests,
          difficulties: updatedUserData.difficulties,
          goal: updatedUserData.goal,
          daily_update_time: updatedUserData.updateTime,//notificatinos is not requried to be stored in the database
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        refetchProfile();
      }
    }
    handleFinish();
  };

  const handleFinish = () => {
    // Save user data and navigate to the main app
    ionRouter.push('/home', 'root');
  };

  const steps = [
    <FullNamePage onContinue={handleFullNameContinue} />,
    <UsernamePage name={userData.name} onContinue={handleUsernameContinue} />,
    <ExamSelectionPage onContinue={handleExamSelectionContinue} />,
    <InterestsPage onContinue={handleInterestsContinue} />,
    <LoaderPage onComplete={nextStep} />,
    <DifficultiesPage
      interests={userData.interests}
      onContinue={handleDifficultiesContinue}
    />,
    <GoalPage onContinue={handleGoalContinue} />,
    <NotificationsPage onContinue={handleNotificationsContinue} />,
    <TimeSelectionPage onContinue={handleTimeSelectionContinue} />,
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {steps[step - 1]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingPage;
