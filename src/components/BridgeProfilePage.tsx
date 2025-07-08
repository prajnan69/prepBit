import { useEffect } from 'react';
import { useIonRouter, IonPage, IonContent, IonSpinner, IonText } from '@ionic/react';
import { supabase } from '../lib/supabaseClient'; // Ensure this path is correct

const BridgeProfilePage = () => {
  const ionRouter = useIonRouter();

  useEffect(() => {
    console.log("Bridge page loaded. Starting auth process...");
    // 1. READ FROM THE HASH, NOT THE SEARCH
    // The hash will be "#access_token=...&refresh_token=..."
    const hash = window.location.hash.substring(1); // Remove the leading '#'
    console.log("URL Hash:", hash);

    if (!hash) {
      console.warn("Bridge page loaded without a URL hash. This is expected if navigating directly. Redirecting to login.");
      ionRouter.push('/login', 'root', 'replace');
      return;
    }

    // 2. PARSE BOTH TOKENS
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    console.log("Access Token from URL:", access_token ? 'Found' : 'Not Found');
    console.log("Refresh Token from URL:", refresh_token ? 'Found' : 'Not Found');

    // 3. VALIDATE BOTH TOKENS ARE PRESENT
    if (access_token && refresh_token) {
      console.log("🚀 Found auth tokens in URL. Setting session...");

      // 4. SET THE FULL SESSION
      supabase.auth.setSession({
        access_token,
        refresh_token, // Provide the real refresh token
      }).then(({ error }) => {
        if (error) {
          console.error("❌ Supabase setSession error:", error.message);
          ionRouter.push('/login', 'root', 'replace');
        } else {
          console.log("✅ Session set successfully. Redirecting to main app...");
          // 5. USE CORRECT NAVIGATION to clear history
          ionRouter.push('/profile', 'root', 'replace');
        }
      });
    } else {
      console.warn("⚠️ Required tokens not found in URL hash. Redirecting to login.");
      ionRouter.push('/login', 'root', 'replace');
    }
  // This effect should only run once when the component mounts.
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
