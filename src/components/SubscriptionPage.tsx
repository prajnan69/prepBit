import { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useHaptics } from '../hooks/useHaptics';
import { CheckCircle, Star, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import Card from './Card';
import { useIsMobile } from '../hooks/useIsMobile';
import DigitRoll from './DigitRoll';
import './PushButton.css';

const SubscriptionPage = () => {
  const [userStatus, setUserStatus] = useState<'new' | 'returning'>('new');
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();
  const user = session?.user;
  const isMobile = useIsMobile();
  const [promoCode, setPromoCode] = useState('');
  const [validPromoCodes, setValidPromoCodes] = useState<any[]>([]);
  const [promoStatus, setPromoStatus] = useState<'default' | 'valid' | 'invalid' | 'used' | 'expired'>('default');
  const [usedTimestamp, setUsedTimestamp] = useState<string | null>(null);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [offerTimeLeft, setOfferTimeLeft] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: timerData } = await supabase.from('app_settings').select('value, created_at').eq('key', 'OFFER_TIMER').single();
      if (timerData) {
        const hours = parseInt(timerData.value, 10);
        const createdAt = new Date(timerData.created_at).getTime();
        const now = new Date().getTime();
        const diff = now - createdAt;
        const hoursInMs = hours * 60 * 60 * 1000;
        const remaining = hoursInMs - diff;
        if (remaining > 0) {
          setOfferTimeLeft(remaining);
        }
      }

      const { data: promoData } = await supabase.from('promo_codes').select('*').eq('is_active', true);
      if (promoData) {
        setValidPromoCodes(promoData);
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);
      if (subData && subData.length > 0) {
        setUserStatus('returning');
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (promoCode.length === 6) {
      const code = validPromoCodes.find(c => c.code === promoCode.toUpperCase());
      if (code) {
        setPromoStatus('valid');
      } else {
        setPromoStatus('invalid');
      }
    } else {
      setPromoStatus('default');
    }
  }, [promoCode, validPromoCodes]);

  useEffect(() => {
    if (discountApplied) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setDiscountApplied(false);
            setPromoStatus('expired');
            setPromoCode('');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [discountApplied]);

  useEffect(() => {
    if (offerTimeLeft > 0) {
      const timer = setInterval(() => {
        setOfferTimeLeft((prevTime) => (prevTime > 1000 ? prevTime - 1000 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [offerTimeLeft]);

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 6) {
      setPromoCode(value);
    }
  };

  const handleApplyDiscount = async () => {
    if (!user) return;

    const code = validPromoCodes.find(c => c.code === promoCode);
    if (!code) {
      setPromoStatus('invalid');
      return;
    }

    const { data: existingUse, error } = await supabase
      .from('user_promo_codes')
      .select('*')
      .eq('user_id', user.id)
      .eq('promo_code_id', code.id)
      .single();

    if (existingUse) {
      if (existingUse.is_success) {
        setPromoStatus('used');
        setUsedTimestamp(new Date(existingUse.used_at).toLocaleString());
      } else {
        // If the user tried but payment failed, allow them to try again
        // and start the timer from when they last tried.
        const usedAt = new Date(existingUse.used_at).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((now - usedAt) / 1000);
        if (diff < 300) {
          setTimeLeft(300 - diff);
          setDiscountApplied(true);
        } else {
          setPromoStatus('used');
          setUsedTimestamp(new Date(existingUse.used_at).toLocaleString());
        }
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_promo_codes')
        .insert({ user_id: user.id, promo_code_id: code.id });

      if (!insertError) {
        setDiscountApplied(true);
        setTimeLeft(300);
      }
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const formatOfferTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const plans = (userStatus === 'new'
    ? [
        {
          title: '2-Day Trial',
          price: 89,
          features: ['2-day access', 'Full feature set'],
          perDayPrice: 44.5,
          isTrial: true,
        },
        {
          title: 'Monthly',
          price: 349,
          features: ['Billed monthly', 'Cancel anytime'],
          isUpsell: true,
          perDayPrice: 11.6,
          isPopular: true,
        },
        {
          title: 'Yearly',
          price: 3349,
          perDayPrice: 9.1,
          features: ['Billed annually', '20% off'],
        },
      ]
    : [
        {
          title: 'Quarterly',
          price: 899,
          features: ['Billed quarterly', '10% off'],
        },
        {
          title: 'Monthly',
          price: 349,
          features: ['Billed monthly', 'Cancel anytime'],
          isPopular: true,
        },
        {
          title: 'Yearly',
          price: 3349,
          features: ['Billed annually', '20% off'],
        },
      ]
  ).map((plan: any) => {
    if (discountApplied && !plan.isTrial) {
  return {
    ...plan,
    price: plan.price * 0.8,
    perDayPrice: plan.perDayPrice ? plan.perDayPrice * 0.8 : undefined,
  };
}
    return plan;
  });

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="flex-grow w-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white">Manage Subscription</h1>
            <p className="text-base md:text-lg text-white/80 mt-2">
              {userStatus === 'new'
                ? 'Welcome! Choose a plan to get started.'
                : 'Welcome back! Renew your subscription.'}
            </p>
          </motion.div>

          <div className="w-full max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={handlePromoCodeChange}
                maxLength={6}
                className="w-full text-center px-4 py-3 rounded-xl bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <AnimatePresence>
                {promoStatus === 'valid' && (
                  <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="absolute right-4 top-0 h-full flex items-center justify-center"
                    onClick={handleApplyDiscount}
                  >
                    <ChevronRight className="text-white" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {promoStatus === 'expired' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-400 mt-2 text-center"
                >
                  Promo code expired.
                </motion.p>
              )}
              {promoStatus === 'invalid' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-red-400 mt-2 text-center"
                >
                  Invalid promo code.
                </motion.p>
              )}
              {promoStatus === 'used' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-yellow-300 mt-2 text-center"
                >
                  You have already used this promo code on {usedTimestamp}.
                </motion.p>
              )}
              {discountApplied && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-xs text-yellow-300 mt-2 text-center max-w-xs mx-auto"
                >
                  You can only use this promo code once. The offer will expire when the timer runs out.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {isMobile ? (
            <div className="w-full">
              <Swiper
                initialSlide={1}
                spaceBetween={20}
                slidesPerView={1.3}
                centeredSlides={true}
                slideToClickedSlide={true}
                className="w-full h-full"
              >
                {plans.map((plan, i) => (
                  <SwiperSlide key={i} className="h-full">
                    <PlanCard
                      index={i}
                      {...plan}
                      discountApplied={discountApplied && !plan.isTrial}
                      isDiscountActive={discountApplied}
                      timeLeft={timeLeft}
                      formatTime={formatTime}
                      offerTimeLeft={offerTimeLeft}
                      formatOfferTime={formatOfferTime}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-6">
              {plans.map((plan, i) => (
                <PlanCard
                  key={i}
                  index={i}
                  {...plan}
                  discountApplied={discountApplied && !plan.isTrial}
                  isDiscountActive={discountApplied}
                  timeLeft={timeLeft}
                  formatTime={formatTime}
                  offerTimeLeft={offerTimeLeft}
                  formatOfferTime={formatOfferTime}
                />
              ))}
            </div>
          )}
          </div>
          <div className="text-center py-4">
            <a href="/refund-policy" className="text-white/80 underline">Refund Policy</a>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const PlanCard = ({
  title,
  price,
  features,
  isTrial = false,
  isPopular = false,
  perDayPrice,
  index,
  discountApplied,
  isDiscountActive,
  timeLeft,
  formatTime,
  offerTimeLeft,
  formatOfferTime,
}: {
  title: string;
  price: number;
  features: string[];
  isTrial?: boolean;
  isPopular?: boolean;
  perDayPrice?: number;
  index: number;
  discountApplied?: boolean;
  isDiscountActive?: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  offerTimeLeft: number;
  formatOfferTime: (ms: number) => string;
}) => {
  const { triggerHaptic } = useHaptics();
  const originalPrice = isTrial ? 89 : title.toLowerCase().includes('monthly') ? 349 : 3349;
  const priceString = Math.round(price).toString().split('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="cursor-pointer flex flex-col h-full"
      onClick={triggerHaptic}
    >
      <Card className={cn(isPopular && "border-yellow-400 border-2 rounded-3xl")}>
        <div className="flex flex-col items-center text-white w-full h-full">
          {isPopular && (
            <div className="mb-3 self-center bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 z-10 whitespace-nowrap border border-yellow-500 shadow-md">
              <Star size={14} className="fill-black text-black" />
              Popular
            </div>
          )}

          <div className="mt-2 text-left w-full">
            <h2 className="text-2xl font-bold">{title}</h2>
            {isTrial && (
              <p className="text-sm text-white/70 mt-1">One-time trial</p>
            )}
          </div>

          <div className="my-6 md:my-8 text-left w-full">
            <div className="flex flex-col items-start gap-1 mt-2">
  {perDayPrice && (
    <div className="flex items-baseline gap-1">
      <span className="text-4xl font-bold text-white">₹{perDayPrice.toFixed(1)}</span>
      <span className="text-base text-white/70">/day</span>
    </div>
  )}

  <div className="flex items-center gap-2">
    {discountApplied && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white/40 line-through text-base"
      >
        ₹{originalPrice}
      </motion.span>
    )}
    <div className="flex items-baseline">
      <span className="text-sm text-white/70">Billed at </span>
      <span className="text-lg font-semibold text-white ml-1">
        ₹{Math.round(price)}
      </span>
    </div>
  </div>
</div>


            {discountApplied && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
                className="text-xs text-yellow-300 mt-3"
              >
                <motion.span
                  initial={{ scale: 1 }}
                  animate={{ scale: 1.1, transition: { delay: 0.5, repeat: Infinity, repeatType: 'reverse', duration: 0.5 } }}
                  className="font-bold text-red-500 text-lg"
                >
                  Expires in:
                </motion.span>
                {' '}<span className="text-red-500 text-lg">{formatTime(timeLeft)}</span>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 1 } }}
                  className="text-xl text-white/70 mt-1"
                >
                  Just for you
                </motion.p>
              </motion.div>
            )}

            {!discountApplied && perDayPrice && (title.toLowerCase().includes('monthly') || title.toLowerCase().includes('yearly')) && offerTimeLeft > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs text-yellow-300 mt-3"
              >
                ⏳ Offer ends in <span className="font-bold">{formatOfferTime(offerTimeLeft)}</span>
              </motion.div>
            )}
          </div>

          <ul className="space-y-3 flex-grow w-full">
            {features.map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-base">
                <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 text-center w-full">
            {isTrial && isDiscountActive ? (
              <div className="flex flex-col items-center">
                <div className="text-center text-sm text-white/90 mb-4 px-2">
                  <p className="font-bold text-yellow-300">
                    Not valid!
                  </p>
                  <p className="mt-1">
                    That amazing discount is for our full plans. Choose a
                    Monthly or Yearly plan to lock in your savings!
                  </p>
                </div>
                <button
                  className="bg-transparent border-b border-white/50 hover:border-white/80 pb-1 text-sm text-white/70 transition-colors"
                >
                  Continue with Trial
                </button>
              </div>
            ) : (
              <button className="pushable">
                <span className="front">
                  Choose Plan
                </span>
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default SubscriptionPage;
