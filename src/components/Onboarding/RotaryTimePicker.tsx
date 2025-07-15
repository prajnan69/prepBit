// components/RotaryTimePicker.tsx
import { useRef, useState, useEffect } from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface RotaryTimePickerProps {
  time: string;
  setTime: (time: string) => void;
  triggerHaptic: () => void;
}

const RotaryTimePicker = ({ time, setTime, triggerHaptic }: RotaryTimePickerProps) => {
  const [hour, minute] = time.split(':').map(Number);
  const [activeDial, setActiveDial] = useState<'hour' | 'minute'>('hour');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to track the previous snapped value to trigger haptics only on change
  const prevSnappedHour = useRef<number>(hour);
  const prevSnappedMinute = useRef<number>(minute);

  // Convert time to angles for the dial hands
  const hourAngle = hour * (360 / 24);
  const minuteAngle = minute * (360 / 60);

  const handlePan = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!containerRef.current) return;

    const { x, y } = containerRef.current.getBoundingClientRect();
    const center = { x: x + 128, y: y + 128 }; // 128 is half of width/height 256px
    
    const dx = info.point.x - center.x;
    const dy = info.point.y - center.y;
    
    // Calculate angle from center to pointer, convert to degrees, and offset by 90deg
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const finalAngle = angle < 0 ? 360 + angle : angle; // Normalize to 0-360

    if (activeDial === 'hour') {
      const hourSnapAngle = 360 / 24; // 15 degrees per hour
      const snappedHour = Math.round(finalAngle / hourSnapAngle) % 24;
      if (snappedHour !== prevSnappedHour.current) {
        setTime(`${String(snappedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
        triggerHaptic();
        prevSnappedHour.current = snappedHour;
      }
    } else {
      const minuteSnapAngle = 360 / 60; // 6 degrees per minute
      const snappedMinute = Math.round(finalAngle / minuteSnapAngle) % 60;
      if (snappedMinute !== prevSnappedMinute.current) {
        setTime(`${String(hour).padStart(2, '0')}:${String(snappedMinute).padStart(2, '0')}`);
        triggerHaptic();
        prevSnappedMinute.current = snappedMinute;
      }
    }
  };
  
  // Update refs when time changes externally
  useEffect(() => {
    prevSnappedHour.current = hour;
    prevSnappedMinute.current = minute;
  }, [hour, minute]);

  return (
    <motion.div
      ref={containerRef}
      onPan={handlePan}
      onPanStart={handlePan}
      className="relative w-64 h-64 touch-none cursor-grab active:cursor-grabbing"
    >
      {/* Dial background with tick marks */}
      <div className="absolute inset-0 rounded-full bg-white shadow-lg border border-slate-200">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-0 h-full w-px -ml-px"
            style={{ transform: `rotate(${i * 30}deg)` }}
          >
            <div className={`h-4 ${i % 3 === 0 ? 'w-1 bg-slate-400' : 'w-0.5 bg-slate-300'}`} />
          </div>
        ))}
      </div>

      {/* Hour Hand */}
      <motion.div
        className="absolute bottom-1/2 left-1/2 w-1 h-20 -ml-0.5 bg-slate-700 rounded-t-full"
        style={{ transformOrigin: 'center bottom' }}
        animate={{ rotate: hourAngle }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      {/* Minute Hand (thinner and longer) */}
      <motion.div
        className="absolute bottom-1/2 left-1/2 w-0.5 h-24 -ml-px bg-slate-500 rounded-t-full"
        style={{ transformOrigin: 'center bottom' }}
        animate={{ rotate: minuteAngle }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      
      {/* Center circle and time display */}
      <div className="absolute inset-10 rounded-full bg-white flex items-center justify-center shadow-inner">
        <div className="flex items-baseline font-mono text-3xl font-bold">
          <span
            onClick={() => {
              setActiveDial('hour');
              triggerHaptic();
            }}
            className={`cursor-pointer p-2 rounded-lg transition ${activeDial === 'hour' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-700'}`}
          >
            {String(hour).padStart(2, '0')}
          </span>
          <span className="text-slate-300 mx-1">:</span>
          <span
            onClick={() => {
              setActiveDial('minute');
              triggerHaptic();
            }}
            className={`cursor-pointer p-2 rounded-lg transition ${activeDial === 'minute' ? 'text-indigo-600 bg-indigo-100' : 'text-slate-700'}`}
          >
            {String(minute).padStart(2, '0')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RotaryTimePicker;
