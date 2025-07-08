import { Redirect, Route } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../context/ProfileContext';
import { IonPage, IonContent } from '@ionic/react';

const SubscriptionRoute = ({ component: Component, requireActiveSubscription = true, ...rest }: any) => {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="flex items-center justify-center h-screen">
            <div className="w-8 h-8 border-b-2 border-gray-900 rounded-full animate-spin"></div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!session) {
    return <Redirect to="/login" />;
  }

  if (requireActiveSubscription && profile?.subscription_status !== 'active') {
    return <Redirect to="/inactive-subscription" />;
  }

  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default SubscriptionRoute;
