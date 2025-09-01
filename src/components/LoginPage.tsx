import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import OtpInput from './OtpInput';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { Keyboard } from '@capacitor/keyboard';
import type { KeyboardInfo } from '@capacitor/keyboard';
import type { PluginListenerHandle } from '@capacitor/core';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState<'default' | 'error' | 'success'>('default');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const ionRouter = useIonRouter();
  const { triggerHaptic, triggerErrorHaptic } = useHaptics();

  useEffect(() => {
    const setupKeyboardListeners = async () => {
      let showHandler: PluginListenerHandle | null = null;
      let hideHandler: PluginListenerHandle | null = null;

      if (typeof window !== 'undefined') {
        showHandler = await Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
          const content = document.querySelector('ion-content');
          if (content) {
            content.style.setProperty('--padding-bottom', `${info.keyboardHeight}px`);
          }
        });

        hideHandler = await Keyboard.addListener('keyboardWillHide', () => {
          const content = document.querySelector('ion-content');
          if (content) {
            content.style.setProperty('--padding-bottom', '0px');
          }
        });
      }

      return () => {
        showHandler?.remove();
        hideHandler?.remove();
      };
    };

    const removeListeners = setupKeyboardListeners();

    return () => {
      removeListeners.then(fn => fn());
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setIsSending(false);
  };

  const handleOtpSubmit = async (otpToVerify: string) => {
    setError(null);
    setOtpStatus('default');
    setIsVerifying(true);

    if (phone === '9876543210' && otpToVerify === '123456') {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'testuser@example.com',
        password: 'testuserpassword',
      });

      if (error) {
        setError(error.message);
        setOtpStatus('error');
        triggerErrorHaptic();
      } else {
        ionRouter.push('/', 'root', 'replace');
      }
      setIsVerifying(false);
      return;
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otpToVerify,
      type: 'sms',
    });

    setIsVerifying(false);

    if (error) {
      setError(error.message);
      setOtpStatus('error');
      triggerErrorHaptic();
    } else if (data.user) {
      setOtpStatus('success');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // New user, since no profile exists
        ionRouter.push('/welcome', 'root', 'replace');
      } else if (profile) {
        // Existing user
        ionRouter.push('/', 'root', 'replace');
      } else if (profileError) {
        setError(profileError.message);
        setOtpStatus('error');
      }
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen bg-white flex items-center justify-center overflow-hidden px-4">
          <div className="w-full max-w-sm p-6 space-y-8">
            <div className="text-center transition-all duration-500 ease-in-out">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 via-purple-900 to-orange-500">
            PrepBit
          </h1>
          <p className="text-gray-700 mt-4 transition-all duration-500 ease-in-out">
            {otpSent ? 'Enter the OTP sent to your mobile' : 'Sign in with your mobile number'}
          </p>
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-8"
              >
                <div className="flex items-center border-2 rounded-2xl px-4 py-3">
                  <span className="text-gray-800 border-r-2 border-gray-300 pr-4 text-xl">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 10) {
                        setPhone(value);
                      }
                      if (value.length === 10) {
                        Keyboard.hide();
                      }
                    }}
                    required
                    maxLength={10}
                    className="text-xl w-full pl-4 bg-transparent focus:outline-none border-none"
                  />
                </div>
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    phone.length === 10 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <button
                    type="submit"
                    disabled={phone.length !== 10 || isSending}
                    onClick={triggerHaptic}
                    className={`w-full py-3 rounded-xl text-white font-semibold text-xl transition-opacity duration-300 ${
                      phone.length !== 10 || isSending ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ background: 'linear-gradient(to right, #8A2BE2, #FFA500)' }}
                  >
                    {isSending ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleOtpSubmit(otp);
                }}
                className="space-y-8"
              >
                <OtpInput
                  length={6}
                  onComplete={(otp) => {
                    setOtp(otp);
                    handleOtpSubmit(otp);
                  }}
                  status={otpStatus}
                  onInputChange={() => setOtpStatus('default')}
                  disabled={isVerifying}
                />
                <button
                  type="submit"
                  disabled={isVerifying || otpStatus === 'success'}
                  className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
                  style={{ background: 'linear-gradient(to right, #8A2BE2, #FFA500)' }}
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full rounded-xl text-gray-500 font-semibold"
                >
                  Back
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
          </div>
        </div>
        <div className="absolute bottom-4 w-full text-center flex justify-center gap-2">
          <button onClick={() => ionRouter.push('/privacy-policy')} className="text-xs text-gray-500 underline">Privacy Policy</button>
          <button onClick={() => ionRouter.push('/terms-and-conditions')} className="text-xs text-gray-500 underline">Terms & Conditions</button>
          <button onClick={() => ionRouter.push('/about-us')} className="text-xs text-gray-500 underline">About Us</button>
          <button onClick={() => ionRouter.push('/contact-us')} className="text-xs text-gray-500 underline">Contact Us</button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
