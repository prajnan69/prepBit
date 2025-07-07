import { Redirect, Route, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../context/ProfileContext';

const SubscriptionRoute = ({ component: Component, ...rest }: any) => {
  const { session, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();

  if (loading || profileLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If the user is on the inactive subscription page or profile page, don't check for subscription
  if (location.pathname === '/inactive-subscription' || location.pathname === '/profile' || location.pathname === '/subscription') {
    return <Component {...rest} />;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        session && profile?.subscription_status === 'active' ? (
          <Component {...props} />
        ) : (
          <Redirect to="/inactive-subscription" />
        )
      }
    />
  );
};

export default SubscriptionRoute;
