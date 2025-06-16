import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import LoginPage from './components/LoginPage';
import AdditionalInfoPage from './components/AdditionalInfoPage';
import MainScreen from './components/MainScreen';
import QuizPage from './components/QuizPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import BottomNav from './components/BottomNav';

function App() {
  const [examType, setExamType] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('exam')
          .eq('id', user.id)
          .single();
        if (profile) {
          setExamType(profile.exam);
        }
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <Router>
      <div className="pb-16">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/additional-info" element={<AdditionalInfoPage />} />
          <Route path="/" element={<MainScreen examType={examType} />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
      <BottomNav />
    </Router>
  );
}

export default App;
