import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, IonButtons, useIonRouter } from '@ionic/react';
import { useProfile } from '../context/ProfileContext';
import { User, Book, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

const MyProfileDetailsPage = () => {
  const { profile, loading, refetchProfile } = useProfile();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const ionRouter = useIonRouter();
  const { triggerHaptic } = useHaptics();
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      refetchProfile();
      setIsDirty(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="flex items-center justify-center h-full">
            <p>Loading profile...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="flex justify-end p-4">
          <button onClick={() => {
            triggerHaptic();
            ionRouter.goBack();
          }}>
            <X size={24} />
          </button>
        </div>
        <div className="p-4">
          <h1 className="text-3xl font-bold">My Profile</h1>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="fullName" className="text-gray-500">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={handleNameChange}
              className="w-full p-2 border rounded-lg mt-1"
            />
          </div>
          <div className="flex items-center">
            <User size={20} className="mr-4" />
            <div>
              <p className="text-gray-500">Username</p>
              <p>{profile?.username}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Book size={20} className="mr-4" />
            <div>
              <p className="text-gray-500">Exam</p>
              <p>{profile?.exam}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="w-full p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
          >
            Save
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MyProfileDetailsPage;
