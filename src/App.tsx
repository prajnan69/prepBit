import { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { supabase } from './lib/supabaseClient';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';
import { ProfileProvider } from './context/ProfileContext';
import LoginPage from './components/LoginPage';
import AdditionalInfoPage from './components/AdditionalInfoPage';
import Toast from './components/Toast';
import Tabs from './components/Tabs';
import SupportDrawer from './components/SupportDrawer';
import ArticlePage from './components/ArticlePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import { useAuth } from './hooks/useAuth';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import PrivateRoute from './components/PrivateRoute';

setupIonicReact();

const App = () => {
  const { session, loading } = useAuth();

  useEffect(() => {
    const setupBars = async () => {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.hide();
        await NavigationBar.hide();
      }
    };
    setupBars();

    const rehideNavbar = () => {
      if (Capacitor.isNativePlatform()) {
        NavigationBar.hide();
      }
    };
    window.addEventListener('touchstart', rehideNavbar);

    return () => {
      window.removeEventListener('touchstart', rehideNavbar);
    };
  }, []);

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [examType, setExamType] = useState('');
  const [supportDrawer, setSupportDrawer] = useState<{ isOpen: boolean; type: 'bug' | 'feedback' | 'urgent' | null }>({ isOpen: false, type: null });

  const showToastWithMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

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
  }, [session]);

  return (
    <IonApp>
      <ProfileProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              <Route path="/privacy-policy" component={PrivacyPolicyPage} exact />
              <Route path="/login" component={LoginPage} exact />
              <Route path="/additional-info" component={AdditionalInfoPage} exact />
              <Route path="/" render={() => (
                <PrivateRoute>
                  <Tabs examType={examType} showToast={showToastWithMessage} setSupportDrawer={setSupportDrawer} />
                </PrivateRoute>
              )} />
            </Switch>
          </IonRouterOutlet>
        </IonReactRouter>
      </ProfileProvider>
      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
      {supportDrawer.isOpen && supportDrawer.type && (
        <SupportDrawer
          isOpen={supportDrawer.isOpen}
          onClose={() => setSupportDrawer({ isOpen: false, type: null })}
          type={supportDrawer.type}
          showToast={showToastWithMessage}
        />
      )}
    </IonApp>
  );
};

export default App;
