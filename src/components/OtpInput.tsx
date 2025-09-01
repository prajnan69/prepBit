import { useState, type ChangeEvent, type KeyboardEvent, type ClipboardEvent } from 'react';
import { useHaptics } from '../hooks/useHaptics';

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  status?: 'error' | 'success' | 'default';
  onInputChange?: () => void;
  disabled?: boolean;
}

const OtpInput = ({ length, onComplete, status = 'default', onInputChange, disabled = false }: OtpInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const { triggerHaptic } = useHaptics();

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

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);
    if (newOtp.every((digit) => digit !== '')) {
      onComplete(newOtp.join(''));
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
              disabled={disabled}
              onChange={(e) => handleChange(e.currentTarget, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={index === 0 ? handlePaste : undefined}
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
