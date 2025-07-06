import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { debounce } from 'lodash';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const exams = [
  'UPSC',
  'SSC CGL',
  'KAS (Karnataka)',
  'Other State Level Exam',
];

const states = ['Karnataka'];

const AdditionalInfoPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [exam, setExam] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const ionRouter = useIonRouter();

  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameError('Username must be at least 3 characters long.');
      return;
    }

    setIsCheckingUsername(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username);

    if (error) {
      setUsernameError('Error checking username.');
    } else if (data.length > 0) {
      setUsernameError('Username is already taken.');
    } else {
      setUsernameError(null);
    }
    setIsCheckingUsername(false);
  };

  const debouncedCheckUsername = useCallback(debounce(checkUsername, 500), []);

  useEffect(() => {
    if (username) {
      debouncedCheckUsername(username);
    }
  }, [username, debouncedCheckUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (usernameError) {
      setError('Please fix the errors before submitting.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const profileData: {
        id: string;
        full_name: string;
        username: string;
        exam: string;
        state?: string;
      } = {
        id: user.id,
        full_name: fullName,
        username,
        exam,
      };

      if (exam === 'Other State Level Exam') {
        profileData.state = state;
      }

      const { error } = await supabase.from('profiles').insert(profileData);

      if (error) {
        setError(error.message);
      } else {
        ionRouter.push('/time-selection');
      }
    } else {
      setError('You must be logged in to complete your profile.');
      ionRouter.push('/login');
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen flex items-center justify-center bg-white animate-fade-in">
          <div className="w-full max-w-sm p-8 space-y-8">
            <div className="text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500">
            Almost there!
          </h1>
          <p className="text-gray-500 mt-4">Please provide a few more details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            required
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border focus:outline-none"
          />

          <div>
            <div className="flex items-center border rounded-xl">
              <span className="px-4 text-gray-500">@</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3 rounded-r-xl focus:outline-none"
              />
            </div>
            {isCheckingUsername && <p className="text-sm text-gray-500">Checking...</p>}
            {usernameError && <p className="text-sm text-red-500">{usernameError}</p>}
          </div>

          {/* Exam Dropdown */}
          <div className="w-full">
            <Listbox value={exam} onChange={setExam}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded-xl border bg-white py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                  <span className="block truncate">{exam || 'Select Exam'}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {exams.map((e, i) => (
                    <Listbox.Option
                      key={i}
                      value={e}
                      className={({ active }) =>
                        `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                          active ? 'bg-purple-100 text-purple-900' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{e}</span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>

          {/* State Dropdown (only if Other State Level Exam) */}
          {exam === 'Other State Level Exam' && (
            <div className="w-full">
              <Listbox value={state} onChange={setState}>
                <div className="relative mt-1">
                  <Listbox.Button className="relative w-full cursor-default rounded-xl border bg-white py-3 pl-4 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800">
                    <span className="block truncate">{state || 'Select State'}</span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
                    </span>
                  </Listbox.Button>
                  <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                    {states.map((s, i) => (
                      <Listbox.Option
                        key={i}
                        value={s}
                        className={({ active }) =>
                          `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                            active ? 'bg-purple-100 text-purple-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{s}</span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>
          )}

          {error && (
            <p className="text-center text-red-500 text-sm animate-shake">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-semibold"
            style={{ background: 'linear-gradient(to right, #8A2BE2, #FFA500)' }}
          >
            Complete Profile
          </button>
        </form>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdditionalInfoPage;
