import { useAuth } from '../hooks/useAuth';
import { useIonRouter } from '@ionic/react';
import { useEffect } from 'react';
import React from 'react';
import LoginPage from './LoginPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const ionRouter = useIonRouter();

  useEffect(() => {
    if (!loading && !session) {
      ionRouter.push('/login', 'root', 'replace');
    }
  }, [loading, session, ionRouter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return children;
};

export default PrivateRoute;
