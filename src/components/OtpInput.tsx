import { useState, type ChangeEvent, type KeyboardEvent } from 'react';

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  status?: 'error' | 'success' | 'default';
  onInputChange?: () => void;
}

const OtpInput = ({ length, onComplete, status = 'default', onInputChange }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    if (onInputChange) {
      onInputChange();
    }

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== '' && index < length - 1) {
      const nextSibling = element.parentElement?.nextElementSibling?.querySelector('input');
      nextSibling?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const previousSibling = e.currentTarget.parentElement?.previousElementSibling?.querySelector('input');
      previousSibling?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {otp.map((data, index) => {
        return (
          <div
            key={index}
            className={`w-12 h-16 border rounded-lg flex items-center justify-center overflow-hidden transition-colors duration-300 ${
              status === 'error'
                ? 'border-red-500 animate-shake'
                : status === 'success'
                ? 'border-green-500'
                : 'border-gray-400'
            }`}
          >
            <input
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.currentTarget, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-full h-full border-none text-center text-2xl bg-transparent focus:outline-none ${
                data ? 'animate-slide-up-digit' : ''
              }`}
            />
          </div>
        );
      })}
    </div>
  );
};

export default OtpInput;
