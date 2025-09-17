import { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, useIonRouter } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { supabase } from './lib/supabaseClient';
import { StatusBar } from '@capacitor/status-bar';
import { NavigationBar } from '@squareetlabs/capacitor-navigation-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { ProfileProvider } from './context/ProfileContext';
import { SearchProvider } from './context/SearchContext';
import LoginPage from './components/LoginPage';
import AdditionalInfoPage from './components/AdditionalInfoPage';
import TimeSelectionPage from './components/TimeSelectionPage';
import PlayStoreRedirectPage from './components/PlayStoreRedirectPage';
import SubscriptionPage from './components/SubscriptionPage';
import InactiveSubscriptionPage from './components/InactiveSubscriptionPage';
import TermsAndConditionsPage from './components/TermsAndConditionsPage';
import RefundPolicyPage from './components/RefundPolicyPage';
import AboutUsPage from './components/AboutUsPage';
import Toast from './components/Toast';
import Tabs from './components/Tabs';
import SupportDrawer from './components/SupportDrawer';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import DeleteAccountPage from './components/DeleteAccountPage';
import SubscriptionRoute from './components/SubscriptionRoute';
import { useAuth } from './hooks/useAuth';
import { usePWA } from './hooks/usePWA';
import { useFCM } from './hooks/useFCM';
import NotificationToast from './components/NotificationToast';
import BridgeProfilePage from './components/BridgeProfilePage';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './components/ProfilePage';
import ValuePropositionPage from './components/ValuePropositionPage';
import OnboardingPage from './components/Onboarding/OnboardingPage';
import ContactUsPage from './components/ContactUsPage';
import PaywallPage from './components/Onboarding/PaywallPage';
import AllPlansPage from './components/AllPlansPage';
import AffiliateOnboardingPage from './components/AffiliateOnboardingPage';
import AffiliateDashboardPage from './components/AffiliateDashboardPage';
import BridgePage from './components/BridgePage';
import RevisePage from './components/RevisePage';
import RatingModal from './components/RatingModal';
import AdFrameworkPage from './components/AdFrameworkPage';
import { Browser } from '@capacitor/browser';

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

setupIonicReact();

const App = () => {
  const { session } = useAuth();
  const { canInstall, promptInstall } = usePWA();
  const ionRouter = useIonRouter();
  useFCM();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'android' && !Capacitor.isNativePlatform()) {
      ionRouter.push('/install', 'root', 'replace');
    }
  }, [ionRouter]);

  useEffect(() => {
    const addListener = async () => {
      await CapacitorApp.addListener('appUrlOpen', (event: { url: string }) => {
        const slug = event.url.split('.app').pop();
        if (slug) {
          ionRouter.push(slug);
        }
      });

      const listener = await CapacitorApp.addListener('backButton', () => {
        if (ionRouter.canGoBack()) {
          ionRouter.goBack();
        } else {
          CapacitorApp.exitApp();
        }
      });

      return () => {
        listener.remove();
      };
    };
    addListener();
  }, [ionRouter]);

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
  const [notification, setNotification] = useState<any>(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  useEffect(() => {
    const checkRatingStatus = () => {
      const hasRated = localStorage.getItem('hasRated');
      if (!hasRated) {
        const lastPrompted = localStorage.getItem('lastRatingPrompt');
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;

        if (!lastPrompted || now - parseInt(lastPrompted, 10) > oneWeek) {
          if (Math.random() < 0.1) { // 10% chance
            setIsRatingModalOpen(true);
            localStorage.setItem('lastRatingPrompt', now.toString());
          }
        }
      }
    };

    const timer = setTimeout(checkRatingStatus, 5000); // Check after 5 seconds of app load
    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {
    if (session?.user) {
      const channel = supabase
        .channel(`toast-notifications:${session.user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setNotification(payload.new);
            } else if (payload.eventType === 'UPDATE') {
              setNotification((current: any) =>
                current && current.id === payload.new.id ? payload.new : current
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  return (
    <IonApp>
      {canInstall && !Capacitor.isNativePlatform() && (
        <button onClick={promptInstall} className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded">
          Install App
        </button>
      )}
      <ProfileProvider>
        <SearchProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              <Switch>
                {/* --- Public Routes --- */}
                <Route path="/privacy-policy" component={PrivacyPolicyPage} exact />
                <Route path="/delete-account" component={DeleteAccountPage} exact />
                <Route path="/login" component={LoginPage} exact />
                <Route path="/welcome" component={ValuePropositionPage} exact />
                <Route path="/onboarding" component={OnboardingPage} exact />
                <Route path="/additional-info" component={AdditionalInfoPage} exact />
                <Route path="/time-selection" component={TimeSelectionPage} exact />
                <Route path="/install" component={PlayStoreRedirectPage} exact />
                <Route path="/inactive-subscription" component={InactiveSubscriptionPage} exact />
                <Route path="/terms-and-conditions" component={TermsAndConditionsPage} exact />
                <Route path="/refund-policy" component={RefundPolicyPage} exact />
                <Route path="/about-us" component={AboutUsPage} exact />
                <Route path="/contact-us" component={ContactUsPage} exact />
                <Route path="/pricing" component={PaywallPage} exact />
                <Route path="/all-plans" component={AllPlansPage} exact />
                <Route path="/affiliate-onboarding" component={AffiliateOnboardingPage} exact />
                <Route path="/affiliate-dashboard" component={AffiliateDashboardPage} exact />
                <Route exact path="/bridge/profile" component={BridgeProfilePage} />
                <Route path="/bridge" component={BridgePage} exact />
                <Route path="/external-profile" component={ProfilePage} exact />
                <Route path="/revise" render={() => <RevisePage showToast={showToastWithMessage} />} exact />
                <Route path="/ad-framework" component={AdFrameworkPage} exact />
                
                {/* --- Private Routes --- */}
                <PrivateRoute>
                  <Switch> {/* This Switch is crucial for ordering the private routes */}
                    
                    {/* Rule 1: The Profile page is accessible to any logged-in user. */}
                    
                    {/* Rule 2: The main app (Tabs) requires an active subscription. */}
                    {/* This will catch all other private paths and check for a subscription. */}
                    <SubscriptionRoute 
                      path="/" 
                      component={() => <Tabs examType={examType} showToast={showToastWithMessage} setSupportDrawer={setSupportDrawer} />} 
                      requireActiveSubscription={true}
                      showToast={showToastWithMessage}
                    />

                  </Switch>
                </PrivateRoute>
              </Switch>
            </IonRouterOutlet>
          </IonReactRouter>
        </SearchProvider>
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
      <NotificationToast notification={notification} onClose={() => setNotification(null)} />
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => setIsRatingModalOpen(false)}
        onConfirm={() => {
          localStorage.setItem('hasRated', 'true');
          Browser.open({ url: 'https://play.google.com/store/apps/details?id=com.prepbit.app' });
        }}
      />
    </IonApp>
  );
};

export default App;
