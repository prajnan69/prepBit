import { useEffect } from 'react';
import { useIonRouter, IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { supabase } from '../lib/supabaseClient';

const BridgeProfilePage = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("⏳ 3 seconds passed. Attempting to parse URL hash...");

      const hash = window.location.hash.substring(1); // Remove the leading '#'
      console.log("📌 Full URL:", window.location.href);
      console.log("📌 Hash:", window.location.hash);

      if (!hash) {
        console.warn("❌ No URL hash found after delay. Redirecting to login...");
        ionRouter.push('/login', 'root', 'replace');
        return;
      }

      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      console.log("🔐 Access Token:", access_token ? 'Found' : 'Missing');
      console.log("🔐 Refresh Token:", refresh_token ? 'Found' : 'Missing');

      if (access_token && refresh_token) {
        supabase.auth.setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (error) {
              console.error("❌ Supabase setSession error:", error.message);
              ionRouter.push('/login', 'root', 'replace');
            } else {
              console.log("✅ Session set. Redirecting to /profile...");
              ionRouter.push('/profile', 'root', 'replace');
            }
          });
      } else {
        console.warn("⚠️ Tokens missing from hash. Redirecting.");
        ionRouter.push('/login', 'root', 'replace');
      }
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [ionRouter]);

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
