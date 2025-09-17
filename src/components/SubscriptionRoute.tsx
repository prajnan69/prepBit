import { Redirect, Route, useHistory } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonToast } from '@ionic/react';
import PaywallPage from './Onboarding/PaywallPage';
import { useRevenueCat } from '../hooks/useRevenueCat';
import { Purchases } from '@revenuecat/purchases-capacitor';
import config from '../config';
import { Capacitor } from '@capacitor/core';

const SubscriptionRoute = ({ component: Component, requireActiveSubscription = true, showToast, ...rest }: any) => {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isConfigured } = useRevenueCat();
  const history = useHistory();
  const [showPaywall, setShowPaywall] = useState(false);
  const [lastDismissedAt, setLastDismissedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (profile && requireActiveSubscription && profile.subscription_status !== 'active') {
      const createdAt = new Date(profile.created_at);
      const trialEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const isTrialActive = now < trialEndDate;

      if (isTrialActive) {
        // Initial paywall after onboarding
        const initialPaywallShown = localStorage.getItem('initialPaywallShown');
        if (profile.daily_update_time && !initialPaywallShown) {
          localStorage.setItem('initialPaywallShown', 'true');
          setTimeout(() => {
            setShowPaywall(true);
          }, 30000);
        } else {
          // Random paywall with cooldown
          const cooldownPeriod = 60 * 60 * 1000; // 1 hour
          if (!lastDismissedAt || now.getTime() - lastDismissedAt.getTime() > cooldownPeriod) {
            if (Math.random() < 0.2) { // 20% chance
              setShowPaywall(true);
            }
          }
        }
      } else {
        // Persistent paywall after trial
        setShowPaywall(true);
      }
    }
  }, [profile, requireActiveSubscription, history.location]);

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

  if (!profile || !profile.full_name || !profile.exam) {
    return <Redirect to="/onboarding" />;
  }

  const handleApplyPromoCode = async (promoCode: string) => {
    if (!session) {
      return { isValid: false, message: 'User not logged in' };
    }
    const url = `${config.API_BASE_URL}/validate-promo`;
    const body = {
      promoCode: promoCode.toUpperCase(),
      userId: session.user.id,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const rawResponse = await response.text();

      const data = JSON.parse(rawResponse);
      return data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      return { isValid: false, message: 'An unexpected error occurred.' };
    }
  };

  const handlePurchase = async (planId: string, promoCode?: string) => {
    if (!isConfigured) {
      showToast('RevenueCat not configured. Check logs for details.');
      console.error('RevenueCat not configured');
      return;
    }

    const planToOffering: { [key: string]: string } = {
      'monthly-trial': 'monthly-trial',
      'yearly-trial': 'yearly-trial',
      'monthly-nontrial': 'monthly-nontrial',
      'yearly-nontrial': 'yearly-nontrial',
      'monthly-promo-trial': 'monthly-promo-trial',
      'monthly-promo-nontrial': 'monthly-promo-nontrial',
      'yearly-promo-trial': 'yearly promo trial',
      'yearly-promo-nontrial-3': 'yearly-promo-nontrial-3',
    };

    try {
      const offerings = await Purchases.getOfferings();
      console.log('Available offerings:', offerings.all);
      const baseOfferingId = planToOffering[planId];
      if (!baseOfferingId) {
        console.error('Invalid planId:', planId);
        return;
      }
      console.log('baseOfferingId:', baseOfferingId);

      const offering = offerings.all[baseOfferingId];
      console.log('Selected offering:', offering);
      if (!offering) {
        console.error('Offering not found:', planId);
        showToast(`Offering not found: ${planId}`);
        return;
      }
      const packageToPurchase = offering.availablePackages[0];
      if (!packageToPurchase) {
        console.error('Package not found:', planId);
        return;
      }
      console.log(`Attempting to purchase plan: ${planId}`);
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToPurchase });
      console.log('RevenueCat customer info:', customerInfo);
      showToast('Purchase successful!');

      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const entitlement = Object.values(customerInfo.entitlements.active)[0];
          const subscriptionData: any = {
            user_id: user.id,
            product_identifier: entitlement.productIdentifier,
            product_plan_identifier: entitlement.productPlanIdentifier,
            latest_purchase_date: entitlement.latestPurchaseDate,
            expiration_date: entitlement.expirationDate,
            store: entitlement.store,
            is_sandbox: entitlement.isSandbox,
            will_renew: entitlement.willRenew,
            unsubscribe_detected_at: entitlement.unsubscribeDetectedAt,
            billing_issue_detected_at: entitlement.billingIssueDetectedAt,
            verification: entitlement.verification,
            original_app_user_id: customerInfo.originalAppUserId,
          };

          if (promoCode) {
            subscriptionData.promocode = promoCode;
          }
          
          const { data: subData, error: subError } = await supabase.from('user_subscriptions').upsert(subscriptionData, { onConflict: 'user_id' });

          if (subError) {
            console.error('Error inserting subscription data:', JSON.stringify(subError, null, 2));
          } else {
            console.error('Subscription data inserted:', JSON.stringify(subData, null, 2));
          }

          const { data: profileData, error: profileError } = await supabase.from('profiles').update({
            subscription_status: 'active',
            plan_id: planId,
          }).eq('id', user.id);

          if (profileError) {
            console.error('Error updating profile:', JSON.stringify(profileError, null, 2));
          } else {
            console.error('Profile updated:', JSON.stringify(profileData, null, 2));
          }
        }
        history.go(0); // Refresh the page to reflect the new subscription status
      }
    } catch (e) {
      const error = e as Error;
      console.error('Purchase error:', error);
      showToast(`Purchase failed: ${error.message}`);
    }
  };

  if (showPaywall) {
    const isFirstTime = !localStorage.getItem('initialPaywallShown');
    return (
      <PaywallPage
        onPurchase={handlePurchase}
        onRestore={() => console.log('Restore purchase')}
        onApplyPromoCode={handleApplyPromoCode}
        showToast={showToast}
        isDismissible={new Date() < new Date(new Date(profile!.created_at).getTime() + 3 * 24 * 60 * 60 * 1000)}
        onDismiss={() => {
          setShowPaywall(false);
          setLastDismissedAt(new Date());
        }}
        isFirstTime={isFirstTime}
      />
    );
  }

  return <Route {...rest} render={(props) => <Component {...props} />} />;
};

export default SubscriptionRoute;
