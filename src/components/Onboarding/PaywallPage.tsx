import { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import { motion, AnimatePresence, type Variants, useMotionValue, useTransform, animate } from 'framer-motion';
import config from '../../config';
import { Hourglass } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';
import { useProfile } from '../../context/ProfileContext';
import { Capacitor } from '@capacitor/core';
import UpiPaymentPage from './UpiPaymentPage';
const useIsMobile = () => typeof window !== 'undefined' ? window.innerWidth < 768 : false;


const CheckCircleIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CloseIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Plan {
  id: string;
  title: string;
  price: string;
  period: string;
  subtitle: string;
  description: string;
  save?: string;
  extra?: string;
}

interface PaywallPageProps {
  onPurchase: (planId: string, promoCode?: string) => void;
  onRestore?: () => void;
  onApplyPromoCode: (promoCode: string) => Promise<{ isValid: boolean; message?: string; timeLeft?: number }>;
  showToast: (message: string) => void;
  isDismissible?: boolean;
  onDismiss?: () => void;
  isFirstTime?: boolean;
}

const AnimatedPrice = ({ from, to }: { from: number, to: number }) => {
  const motionValue = useMotionValue(from);
  const price = useTransform(motionValue, (value) => `₹${value.toFixed(2)}`);

  useEffect(() => {
    const controls = animate(motionValue, to, {
      duration: 10,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [from, to]);

  return <motion.span>{price}</motion.span>;
};

const PaywallPage = ({ onPurchase, onRestore, onApplyPromoCode, showToast, isDismissible, onDismiss, isFirstTime }: PaywallPageProps) => {
  const ionRouter = useIonRouter();
  const { profile } = useProfile();
  const { triggerHaptic, triggerErrorHaptic, triggerPriceAnimationHaptic } = useHaptics();
  const [trialTimeLeft, setTrialTimeLeft] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly-trial');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [isTrial, setIsTrial] = useState(true);
  const [promoPlans, setPromoPlans] = useState<Record<string, Plan>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ isValid: boolean | null; message?: string }>({ isValid: null });
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTrialAnimating, setIsTrialAnimating] = useState(false);
  const [hasSeenDiscount, setHasSeenDiscount] = useState(false);
  const [showOriginalPrice, setShowOriginalPrice] = useState(false);
  const [countdown, setCountdown] = useState(180);
  const [showTimer, setShowTimer] = useState(false);
  const isMobile = useIsMobile();
  const isNative = Capacitor.isNativePlatform();
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'verifying'>('idle');

  const getPlanId = (planType: 'monthly' | 'yearly') => {
    const trialOrNontrial = isTrial ? 'trial' : 'nontrial';
    const promoOrNot = promoStatus.isValid ? '-promo' : '';
    let suffix = '';
    if (planType === 'yearly' && promoStatus.isValid && !isTrial) {
      suffix = '-3';
    }
    return `${planType}${promoOrNot}-${trialOrNontrial}${suffix}`;
  };

  useEffect(() => {
    const planType = selectedPlan.startsWith('monthly') ? 'monthly' : 'yearly';
    setSelectedPlan(getPlanId(planType));
  }, [isTrial, promoStatus.isValid]);

  useEffect(() => {
    if (isDrawerOpen) {
      setIsTrialAnimating(true);
      triggerPriceAnimationHaptic(3000);
      if (!isTrial) {
        setHasSeenDiscount(true);
      } else {
        if (!showTimer) {
          setPromoStatus({ isValid: null });
        }
      }
      const timer = setTimeout(() => setIsTrialAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isTrial, isDrawerOpen, showTimer]);

  useEffect(() => {
    if (profile?.created_at) {
      const interval = setInterval(() => {
        const createdAt = new Date(profile.created_at);
        const trialEndDate = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = trialEndDate.getTime() - now.getTime();

        if (diff <= 0) {
          setTrialTimeLeft('0 days');
          clearInterval(interval);
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTrialTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s `);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [profile]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/get-plans`);
        const data = await response.json();
        console.log('API Response:', data);
        const formattedPlans: Record<string, Plan> = {};
        const formattedPromoPlans: Record<string, Plan> = {};
        data.subscriptions.forEach((sub: any) => {
          sub.basePlans.forEach((plan: any) => {
            if (plan.state === 'ACTIVE' || plan.state === 'DRAFT') {
              const price = plan.regionalConfigs[0].price;
              const isYearly = plan.autoRenewingBasePlanType?.billingPeriodDuration === 'P1Y';
              let perDayPrice;
              let subtitle;
              let description;

              if (isYearly) {
                perDayPrice = (price.units / 365).toFixed(2);
                subtitle = `Billed as ₹${price.units} per year`;
                description = 'Commit to your success and save big. Get a full year of uninterrupted access to all our premium features.';
              } else {
                perDayPrice = (price.units / 30).toFixed(2);
                subtitle = `Billed as ₹${price.units} per month`;
                description = 'Stay flexible with our monthly plan. Get full access to all premium features with the ability to cancel anytime.';
              }

              const planData = {
                id: plan.basePlanId,
                title: plan.basePlanId.replace(/-promo-base$/, '').replace('-trial', '').replace('-nontrial', '').replace('-', ' ').replace(/\d/g, ''),
                price: `₹${perDayPrice}`,
                period: '/ day',
                subtitle: subtitle,
                description: description,
              };

              if (plan.basePlanId.includes('-promo')) {
                const originalPlanId = plan.basePlanId.replace('-promo', '');
                formattedPromoPlans[originalPlanId] = planData;
              } else {
                formattedPlans[plan.basePlanId] = planData;
              }
            }
          });
        });
        setPlans(formattedPlans);
        setPromoPlans(formattedPromoPlans);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const renderPrice = (planId: string, size: '3xl' | 'xl') => {
    if (planId === 'free-trial') {
      return (
        <div className={`font-bold text-${size} ${trialTimeLeft === '0 days' ? 'text-red-500' : 'text-white'}`}>
          <span>{trialTimeLeft}</span>
        </div>
      );
    }

    const planType = planId.split('-')[0] as 'monthly' | 'yearly';

    const toTrialState = isTrial ? 'trial' : 'nontrial';
    let toSuffix = '';
    if (planType === 'yearly' && !promoStatus.isValid) {
      toSuffix = '-3';
    }
    let toBasePlanId = `${planType}-${toTrialState}${toSuffix}`;
    if (planType === 'yearly' && promoStatus.isValid && isTrial) {
      toBasePlanId = 'yearly-trial-2';
    }
    const toPlan = (promoStatus.isValid && promoPlans[toBasePlanId]) || plans[toBasePlanId];
    const toPrice = parseFloat(toPlan?.price.slice(1) || '0');

    const fromTrialState = !isTrial ? 'trial' : 'nontrial';
    let fromSuffix = '';
    if (planType === 'yearly' && !promoStatus.isValid) {
      fromSuffix = '-3';
    }
    const fromBasePlanId = `${planType}-${fromTrialState}${fromSuffix}`;
    const fromPlan = (promoStatus.isValid && promoPlans[fromBasePlanId]) || plans[fromBasePlanId];
    const fromPrice = parseFloat(fromPlan?.price.slice(1) || '0');

    const isPromoAnimating = isAnimating && promoStatus.isValid;
    if (isPromoAnimating) {
        const currentTrialState = isTrial ? 'trial' : 'nontrial';
        const nonPromoSuffix = planType === 'yearly' ? '-3' : '';
        const nonPromoPlanId = `${planType}-${currentTrialState}${nonPromoSuffix}`;
        const nonPromoPlan = plans[nonPromoPlanId];
        const nonPromoPrice = parseFloat(nonPromoPlan?.price.slice(1) || '0');
        
        return (
            <div className={`font-bold text-${size} text-white`}>
                <AnimatedPrice from={nonPromoPrice} to={toPrice} />
            </div>
        );
    }

    if (isTrialAnimating && fromPrice !== toPrice) {
      return (
        <div className={`font-bold text-${size} text-white`}>
          <AnimatedPrice from={fromPrice} to={toPrice} />
        </div>
      );
    }

    return (
      <div className={`font-bold text-${size} text-white`}>
        <span>{toPlan?.price || ''}</span>
      </div>
    );
  };

  const handleApplyPromoCode = async () => {
    triggerHaptic();
    setIsApplyingPromo(true);
    const result = await onApplyPromoCode(promoCode);
    setPromoStatus(result);
    if (result.isValid) {
      setShowOriginalPrice(true);
      setIsAnimating(true);
      triggerPriceAnimationHaptic(3000);
      setShowTimer(true);
      setCountdown(result.timeLeft || 180);
      setTimeout(() => setIsAnimating(false), 3000);
    } else {
      triggerErrorHaptic();
    }
    setIsApplyingPromo(false);
  };

  const getPlanForDrawer = (type: 'monthly' | 'yearly') => {
    if (type === 'yearly' && promoStatus.isValid && isTrial) {
      return promoPlans['yearly-trial-2'];
    }
    const trialOrNontrial = isTrial ? 'trial' : 'nontrial';
    let suffix = '';
    if (type === 'yearly' && !promoStatus.isValid) {
      suffix = '-3';
    }
    const basePlanId = `${type}-${trialOrNontrial}${suffix}`;
    if (promoStatus.isValid && promoPlans[basePlanId]) {
      return promoPlans[basePlanId];
    }
    return plans[basePlanId];
  };
  const monthlyPlanForDrawer = getPlanForDrawer('monthly');
  const yearlyPlanForDrawer = getPlanForDrawer('yearly');
  const drawerPlans = [
    {
      id: 'free-trial',
      title: 'Free Trial',
      price: '3 days',
      period: 'left',
      subtitle: 'Full access to all features',
      description: 'Explore all premium features for a week, absolutely free.',
    },
  ];
  if (monthlyPlanForDrawer) drawerPlans.push(monthlyPlanForDrawer);
  if (yearlyPlanForDrawer) drawerPlans.push(yearlyPlanForDrawer);

  if (!isNative) {
    if (showUpiModal) {
      const plan = promoStatus.isValid && promoPlans[selectedPlan] ? promoPlans[selectedPlan] : plans[selectedPlan];
      const price = plan?.subtitle.split('₹')[1].split(' ')[0];

      return (
        <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
          <div className="flex-grow overflow-y-auto">
            <div className="flex flex-col justify-center items-center min-h-full w-full max-w-md md:max-w-4xl mx-auto px-6 pt-6 pb-36">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-slate-800 p-8 rounded-2xl shadow-lg w-full">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Make Payment</h1>
                <p className="text-slate-300 mt-2 text-base md:text-lg">
                  Please make a payment of <span className="font-bold text-green-400">₹{price}</span> to the following UPI ID:
                </p>
                <div className="mt-6 bg-slate-700 p-4 rounded-lg flex items-center justify-center gap-4">
                  <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/upi-payment-icon.png" alt="UPI" className="w-12 h-12" />
                  <p className="text-2xl font-bold text-green-400">prepbit@ptaxis</p>
                </div>
                <button onClick={() => {
                  setShowUpiModal(false);
                  setPaymentStatus('verifying');
                }} className="w-full mt-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-all animate-pulse">
                  I have paid
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      );
    }

    if (paymentStatus === 'verifying') {
      return <UpiPaymentPage />;
    }

    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col justify-start min-h-full w-full max-w-md md:max-w-4xl mx-auto px-6 pt-6 pb-36">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Unlock Your Potential🎉</h1>
              <p className="text-slate-300 mt-1 text-base md:text-lg">Join thousands of successful students</p>
            </motion.div>
            <div className="mt-8 text-center">
              <p className="text-slate-300">We are currently working on our iOS application. In the meantime, we are only able to offer our yearly subscription through the browser. We apologize for any inconvenience.</p>
            </div>
            {plans['monthly-trial'] && (
              <motion.div
                onClick={() => handleSelectPlan('monthly')}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                className={`relative p-5 mt-8 md:mt-4 rounded-2xl cursor-pointer transition-all border-2 bg-slate-800 
                  ${selectedPlan.startsWith('monthly') ? 'border-indigo-500' : 'border-slate-700'}`}
              >
                <div className="absolute -top-4 left-6 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Best Value
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <p className="font-bold text-green-400">{plans[selectedPlan]?.save}</p>
                    <h2 className="text-2xl font-bold mt-1">{plans[selectedPlan]?.title}</h2>
                        <p className="text-slate-400 text-sm">{plans[selectedPlan]?.subtitle}</p>
                        {isTrial && (
                          <p className="text-xs text-yellow-300 mt-1">3 days free trial</p>
                        )}
                        <p className="text-green-400 text-xs font-medium mt-1">{plans[selectedPlan]?.extra}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      {showOriginalPrice && (
                        <p className="text-base text-slate-400 line-through mr-1">{plans[selectedPlan]?.price}</p>
                      )}
                      {renderPrice(selectedPlan, '3xl')}
                      <p className="text-sm text-slate-400">{plans[selectedPlan]?.period}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div className="flex items-center gap-2 pt-4">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setPromoCode(value);
                }}
                placeholder="Enter promo code"
                className="flex-grow p-2 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleApplyPromoCode}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all"
                disabled={isApplyingPromo}
              >
                {isApplyingPromo ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Apply'
                )}
              </button>
            </div>
            <AnimatePresence>
              {promoStatus.isValid === true && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-green-400"
                >
                  Promo code applied!
r                </motion.p>
              )}
              {promoStatus.isValid === false && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-400"
                >
                  {promoStatus.message === 'Promo code has already been used.' ? 'You have already used this promo code.' : promoStatus.message || 'Invalid promo code.'}
                </motion.p>
              )}
            </AnimatePresence>
            <div className="text-center mt-4">
              <button onClick={() => ionRouter.push('/affiliate-onboarding')} className="text-xs text-slate-500 hover:underline">Apply for Affiliate Partnership</button>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-lg border-t border-slate-700/50">
          <div className="w-full max-w-md md:max-w-xl mx-auto">
            <button onClick={() => {
              triggerHaptic();
              setShowUpiModal(true);
            }} className="w-full py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-all animate-pulse">
              Continue with {(promoStatus.isValid && promoPlans[selectedPlan]) ? promoPlans[selectedPlan].title : plans[selectedPlan]?.title}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showUpiModal) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
        <div className="flex-grow overflow-y-auto">
          <div className="flex flex-col justify-center items-center min-h-full w-full max-w-md md:max-w-4xl mx-auto px-6 pt-6 pb-36">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Make Payment</h1>
              <p className="text-slate-300 mt-1 text-base md:text-lg">
                Please make the payment to the following UPI ID:
              </p>
              <p className="text-2xl font-bold mt-4 text-green-400">prepbit@ptaxis</p>
              <button onClick={() => {
                setPaymentStatus('verifying');
              }} className="w-full mt-8 py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-all animate-pulse">
                Done
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'verifying') {
    return <UpiPaymentPage />;
  }

  const handleSelectPlan = (planId: string) => {
    triggerHaptic();
    const planType = planId.startsWith('monthly') ? 'monthly' : 'yearly';
    setSelectedPlan(getPlanId(planType));
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const drawerVariants: Variants = {
    hidden: { y: "100%" },
    visible: { y: "0%", transition: { type: "tween", ease: "easeOut", duration: 0.3 } },
    exit: { y: "100%", transition: { type: "tween", ease: "easeIn", duration: 0.25 } },
  };

  useEffect(() => {
    if (showTimer) {
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            setShowTimer(false);
            setPromoStatus({ isValid: null });
            setPromoCode('');
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <div className="flex-grow overflow-y-auto">
        {/*
          FIX: Increased bottom padding from pb-10 to pb-36.
          The fixed footer is ~8-9rem tall. The previous padding (pb-10, 2.5rem) was insufficient,
          causing the footer to overlap the last content item (the yearly plan card) on viewports
          with limited height, such as tablets. The new padding (pb-36, 9rem) ensures there is
          enough space at the bottom of the scrollable area for all content to be visible.
        */}
        <div className="flex flex-col justify-start min-h-full w-full max-w-md md:max-w-4xl mx-auto px-6 pt-6 pb-36">

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center relative pt-8">
            {isDismissible && (
              <button onClick={onDismiss} className="absolute top-0 right-0 p-2 text-slate-400 hover:text-white">
                <CloseIcon className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {isFirstTime ? 'Unlock Your Potential' : 'You\'re Missing Out!'}
            </h1>
            <p className="text-slate-300 mt-1 text-base md:text-lg">
              {isFirstTime ? 'Join thousands of successful students' : 'Subscribe now to get unlimited access.'}
            </p>
          </motion.div>

          <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.15 }}} className="mt-8 md:mt-4">
              <h3 className="text-lg font-bold mb-4 text-center text-indigo-300 tracking-wide md:text-left">FEATURES</h3>
              <div className="grid grid-cols-2 gap-4 text-center md:text-left">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-base text-white">Noise-Free News</h4>
                  <p className="text-slate-400 text-xs mt-1">Curated current affairs for your exam.</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-base text-white">Instant MCQs</h4>
                  <p className="text-slate-400 text-xs mt-1">Test your knowledge immediately.</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-base text-white">A-Z Search</h4>
                  <p className="text-slate-400 text-xs mt-1">Powerful search for any topic.</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-base text-white">PYQs</h4>
                  <p className="text-slate-400 text-xs mt-1">Trace topics to past questions.</p>
                </div>
              </div>
            </motion.div>

            {plans['monthly-trial'] && (
              <motion.div
                onClick={() => handleSelectPlan('monthly')}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
                className={`relative p-5 mt-8 md:mt-4 rounded-2xl cursor-pointer transition-all border-2 bg-slate-800 
                  ${selectedPlan.startsWith('monthly') ? 'border-indigo-500' : 'border-slate-700'}`}
              >
                <div className="absolute -top-4 left-6 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Best Value
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    {isNative && selectedPlan.includes('yearly') && hasSeenDiscount ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <h2 className="text-2xl font-bold mt-1">{plans[selectedPlan]?.title}</h2>
                        <p className="text-slate-400 text-sm">{plans[selectedPlan]?.subtitle}</p>
                        {!isTrial ? (
                          <>
                            <p className="font-bold text-green-400">Save {Math.round(((3899 - 3499) / 3899) * 100)}%</p>
                            <p className="text-green-400 text-xs font-medium mt-1">Includes 2 months free</p>
                          </>
                        ) : (
                          <p className="text-green-400 text-xs font-medium mt-1">Switch to non-trial to avail exciting offers 🎉</p>
                        )}
                      </motion.div>
                    ) : (
                      <>
                        <p className="font-bold text-green-400">{plans[selectedPlan]?.save}</p>
                        <h2 className="text-2xl font-bold mt-1">{plans[selectedPlan]?.title}</h2>
                        <p className="text-slate-400 text-sm">{plans[selectedPlan]?.subtitle}</p>
                        <p className="text-green-400 text-xs font-medium mt-1">{plans[selectedPlan]?.extra}</p>
                      </>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      {showOriginalPrice && (
                        <p className="text-base text-slate-400 line-through mr-1">{plans[selectedPlan]?.price}</p>
                      )}
                      {renderPrice(selectedPlan, '3xl')}
                      <p className="text-sm text-slate-400">{plans[selectedPlan]?.period}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 p-4 bg-slate-900/80 backdrop-blur-lg border-t border-slate-700/50">
        <div className="w-full max-w-md md:max-w-xl mx-auto">
          <button onClick={() => {
            triggerHaptic();
            const planType = selectedPlan.startsWith('monthly') ? 'monthly' : 'yearly';
            const planId = getPlanId(planType);
            onPurchase(planId, promoStatus.isValid ? promoCode : undefined);
          }} className="w-full py-3 bg-indigo-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/50 hover:bg-indigo-500 transition-all animate-pulse">
            Continue with {(promoStatus.isValid && promoPlans[selectedPlan]) ? promoPlans[selectedPlan].title : plans[selectedPlan]?.title}
          </button>
          <button onClick={() => {
            triggerHaptic();
            setIsDrawerOpen(true);
          }} className="w-full mt-3 py-1 text-slate-500 hover:text-slate-300 font-medium transition">
            View More Plans
          </button>
          <div className="text-center mt-4 flex justify-center items-center space-x-4">
            <a href="/refund-policy" className="text-xs text-slate-500 hover:underline">Refund Policy</a>
            <button onClick={onRestore} className="text-xs text-slate-500 hover:underline">Restore Purchase</button>
          </div>
          
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div onClick={() => setIsDrawerOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div variants={drawerVariants} initial="hidden" animate="visible" exit="exit" className="fixed bottom-0 left-0 right-0 p-6 bg-slate-800 rounded-t-2xl shadow-2xl z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Choose a Plan</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-slate-400 text-sm">Free Trial</span>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input type="checkbox" checked={isTrial} onChange={() => setIsTrial(!isTrial)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <button onClick={() => {
                    triggerHaptic();
                    setIsDrawerOpen(false);
                  }} className="p-1 rounded-full text-slate-400 hover:bg-slate-700">
                    <CloseIcon className="w-6 h-6"/>
                  </button>
                </div>
              </div>
              {showTimer && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Hourglass className="text-red-500 animate-spin" />
                  <div className="text-red-500 font-bold text-lg">{formatTime(countdown)}</div>
                  <p className="text-xs text-yellow-300">One-time use only. Expires with timer.</p>
                </div>
              )}
              <div className="space-y-3">
                {drawerPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => {
                      if (plan.id === 'free-trial') {
                        if (trialTimeLeft === '0 days') {
                          triggerErrorHaptic();
                          showToast('Free trial is over. Please support our work by taking a subscription.');
                        } else {
                          showToast('Enjoy your free trial!');
                          onDismiss?.();
                        }
                        return;
                      }
                      const planType = plan.id.startsWith('monthly') ? 'monthly' : 'yearly';
                      const planId = getPlanId(planType);
                      handleSelectPlan(planId);
                      onPurchase(planId, promoStatus.isValid ? promoCode : undefined);
                    }}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border-2 transition-all
                      bg-slate-700/50 ${selectedPlan === plan.id ? 'border-indigo-500' : 
                      (plan.id === 'free-trial' && trialTimeLeft === '0 days' ? 'border-red-500' : 'border-slate-600 hover:border-slate-500')} ${!isTrial && plan.id === 'free-trial' ? 'bg-slate-800' : ''}`}
                  >
                    <div>
                      <p className="font-bold text-white text-lg">{(promoStatus.isValid && promoPlans[plan.id]) ? promoPlans[plan.id].title : plan.title}</p>
                      <p className="text-sm text-slate-400">{(promoStatus.isValid && promoPlans[plan.id]) ? promoPlans[plan.id].subtitle : plan.subtitle}</p>
                      {isTrial && plan.id !== 'free-trial' && (
                        <p className="text-xs text-yellow-300 mt-1">3 days free trial</p>
                      )}
                      <AnimatePresence>
                        {isNative && plan.id.includes('yearly') && hasSeenDiscount && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            <p className="text-green-400 text-xs font-medium mt-1">
                              {isTrial ? "Switch to non-trial to avail exciting offers 🎉" : "Includes 2 months free"}
                            </p>
                            {!isTrial && <p className="text-green-400 text-xs font-medium">Save {Math.round(((3899 - 3499) / 3899) * 100)}%</p>}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        ionRouter.push('/all-plans');
                      }} className="text-xs text-indigo-400 hover:underline mt-2">
                        Read More
                      </button>
                     
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        {promoStatus.isValid && promoPlans[plan.id] && (
                          <p className="text-base text-slate-400 line-through mr-1">{plans[plan.id]?.price}</p>
                        )}
                        {renderPrice(plan.id, 'xl')}
                        <span className="text-slate-400 text-base font-normal">{plan.period}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      setPromoCode(value);
                    }}
                    placeholder="Enter promo code"
                    className="flex-grow p-2 rounded-lg bg-slate-700 text-white border-2 border-slate-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyPromoCode}
                    className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-all"
                    disabled={isApplyingPromo}
                  >
                    {isApplyingPromo ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {promoStatus.isValid === true && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-green-400"
                    >
                      Promo code applied!
                    </motion.p>
                  )}
                  {promoStatus.isValid === false && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-red-400"
                    >
                      {promoStatus.message === 'Promo code has already been used.' ? 'You have already used this promo code.' : promoStatus.message || 'Invalid promo code.'}
                    </motion.p>
                  )}
                </AnimatePresence>
                <div className="text-center mt-4">
                  <button onClick={() => ionRouter.push('/affiliate-onboarding')} className="text-xs text-slate-500 hover:underline">Apply for Affiliate Partnership</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaywallPage;
