import { useEffect } from 'react';
import { useIonRouter, IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct

const BridgeProfilePage = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
  console.log("Bridge page loaded. Waiting before parsing hash...");

  const timer = setTimeout(() => {
    const hash = window.location.hash.substring(1);
    console.log("URL Hash:", hash);

    if (!hash) {
      console.warn("No hash found, redirecting to login...");
      ionRouter.push('/login', 'root', 'replace');
      return;
    }

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    console.log("Access Token:", access_token ? 'Found' : 'Missing');
    console.log("Refresh Token:", refresh_token ? 'Found' : 'Missing');

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            console.error("Error setting session:", error.message);
            ionRouter.push('/login', 'root', 'replace');
          } else {
            console.log("Session set, redirecting...");
            ionRouter.push('/profile', 'root', 'replace');
          }
        });
    } else {
      console.warn("Tokens not found. Redirecting...");
      ionRouter.push('/login', 'root', 'replace');
    }
  }, 200); // Wait 200ms for hydration

  return () => clearTimeout(timer);
}, [ionRouter]);


  // Provide a user-friendly loading indicator while the async logic runs
  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <IonSpinner name="crescent" color="primary" />
          <IonText color="medium" style={{ marginTop: '16px', fontFamily: 'sans-serif' }}>
            <p>Signing you in securely...</p>
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BridgeProfilePage;
