import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import OtpInput from './OtpInput';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpStatus, setOtpStatus] = useState<'default' | 'error' | 'success'>('default');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOtpStatus('default');

    const { data, error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });

    if (error) {
      setError(error.message);
      setOtpStatus('error');
    } else if (data.user) {
      setOtpStatus('success');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        navigate('/additional-info');
      } else if (profile) {
        navigate('/summaries');
      } else if (profileError) {
        setError(profileError.message);
        setOtpStatus('error');
      }
    }
  };

  return (
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

        <div className="relative w-full overflow-hidden">
          {/* Slide Container */}
          <div
            className="flex w-[200%] transition-transform duration-500 ease-in-out"
            style={{ transform: otpSent ? 'translateX(-50%)' : 'translateX(0%)' }}
          >
            {/* Mobile Number Panel */}
            <div className="w-full pr-2">
              <form onSubmit={handleLogin} className="space-y-8">
                <div className="flex items-center border-2 rounded-2xl px-4 py-3">
                  <span className="text-gray-800 border-r-2 border-gray-300 pr-4 text-xl">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phone}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        setPhone(e.target.value);
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
                    disabled={phone.length !== 10}
                    className={`w-full py-3 rounded-xl text-white font-semibold text-xl transition-opacity duration-300 ${
                      phone.length !== 10 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    style={{ background: 'linear-gradient(to right, #8A2BE2, #FFA500)' }}
                  >
                    Send OTP
                  </button>
                </div>
              </form>
            </div>

            {/* OTP Panel */}
            <div className="w-full pl-2">
              <form onSubmit={handleOtpSubmit} className="space-y-8">
              <OtpInput
                length={6}
                onComplete={setOtp}
                status={otpStatus}
                onInputChange={() => setOtpStatus('default')}
              />
              <button
                type="submit"
                  className="w-full py-3 rounded-xl text-white font-semibold"
                  style={{ background: 'linear-gradient(to right, #8A2BE2, #FFA500)' }}
                >
                  Verify OTP
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full rounded-xl  text-gray-500 font-semibold"
                >
                  Back
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
