import { useState } from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useHaptics } from '../hooks/useHaptics';
import { ArrowRight } from 'lucide-react';

const TimeSelectionPage = () => {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState('AM');
  const [isLoading, setIsLoading] = useState(false);
  const ionRouter = useIonRouter();
  const { session } = useAuth();
  const user = session?.user;
  const { triggerHaptic } = useHaptics();

  const handleSaveTime = async () => {
    if (!user) return;
    setIsLoading(true);
    triggerHaptic();

    const formattedHour = ampm === 'PM' && hour !== 12 ? hour + 12 : hour;
    const time = `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;

    const { error } = await supabase
      .from('profiles')
      .update({ daily_update_time: time })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating time:', error);
    } else {
      ionRouter.push('/home', 'root', 'replace');
    }
    setIsLoading(false);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800">One last question</h1>
            <p className="text-lg text-gray-500 mt-2">
              What time do you like the daily news summary to be served?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-2"
          >
            <TimeInput value={hour} setValue={setHour} max={12} />
            <span className="text-4xl font-bold">:</span>
            <TimeInput value={minute} setValue={setMinute} max={59} />
            <AmPmSwitch value={ampm} setValue={setAmpm} />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={handleSaveTime}
            disabled={isLoading}
            className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            {isLoading ? 'Saving...' : 'Finish'}
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </IonContent>
    </IonPage>
  );
};

const TimeInput = ({ value, setValue, max }: { value: number, setValue: (value: number) => void, max: number }) => {
  const { triggerHaptic } = useHaptics();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= max) {
      setValue(newValue);
      triggerHaptic();
    }
  };

  return (
    <input
      type="number"
      value={String(value).padStart(2, '0')}
      onChange={handleChange}
      className="w-24 h-24 text-5xl font-bold text-center bg-white border-2 border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

const AmPmSwitch = ({ value, setValue }: { value: string, setValue: (value: string) => void }) => {
  const { triggerHaptic } = useHaptics();

  const toggle = () => {
    setValue(value === 'AM' ? 'PM' : 'AM');
    triggerHaptic();
  };

  return (
    <div
      onClick={toggle}
      className="w-16 h-24 bg-white border-2 border-gray-200 rounded-2xl shadow-sm flex flex-col items-center justify-center cursor-pointer"
    >
      <span className={`text-lg font-semibold ${value === 'AM' ? 'text-blue-600' : 'text-gray-400'}`}>AM</span>
      <span className={`text-lg font-semibold ${value === 'PM' ? 'text-blue-600' : 'text-gray-400'}`}>PM</span>
    </div>
  );
};

export default TimeSelectionPage;
