// src/pages/ProfilePage.tsx

import { useState, useEffect, useRef } from 'react';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter, IonSpinner } from '@ionic/react';
import { supabase } from '../lib/supabaseClient';
import { useProfile } from '../context/ProfileContext';
import {
  User,
  Package,
  ChevronRight,
  LogOut,
  HelpCircle,
  Book,
  Star
} from 'lucide-react';
import { useColor } from 'color-thief-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Browser } from '@capacitor/browser';
import config from '../config';

const getContrastColor = (hex: string) => {
  if (!hex) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

const verifyTokenWithBackend = async (token: string) => {
  try {
    const res = await fetch(`${config.API_BASE_URL}/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    return data.valid ? data.user : null;
  } catch (err) {
    console.error('Token verification error:', err);
    return null;
  }
};

const ProfilePage = () => {
  const { profile, refetchProfile } = useProfile();
  const { data: color } = useColor(profile?.avatar_url || '', 'hex', { crossOrigin: 'anonymous' });
  const [background, setBackground] = useState('linear-gradient(to bottom, #ffffff 0%, #ffffff 100%)');
  const ionRouter = useIonRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerHaptic } = useHaptics();
  const [showHoldIndicator, setShowHoldIndicator] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);
  const sessionRestored = useRef(false);

  useEffect(() => {
  const restoreSession = async () => {
    if (sessionRestored.current) return;
    sessionRestored.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    setIsLoading(true);
    if (token) {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: ''
        });

        if (!error) {
          localStorage.setItem('prepbit_token', token);
          await refetchProfile();
          window.history.replaceState(null, '', '/profile');
        }
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    } else {
      const savedToken = localStorage.getItem('prepbit_token');
      if (savedToken) {
        const { error } = await supabase.auth.setSession({
          access_token: savedToken,
          refresh_token: ''
        });
        if (!error) {
          await refetchProfile();
        }
      }
      setIsLoading(false);
    }
  };

  restoreSession();
}, []);



  useIonViewWillEnter(() => {
    setShowHoldIndicator(true);
    const timer = setTimeout(() => setShowHoldIndicator(false), 3000);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (color) {
      setBackground(`linear-gradient(to bottom, ${color} 0%, ${color}80 100%)`);
    }
  }, [color]);

  useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
  });
}, []);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    uploadAvatar(event.target.files[0]);
  };

  const uploadAvatar = async (file: File | Blob) => {
    if (!profile?.id) return;
    setIsUploading(true);
    const fileExt = file.type.split('/')[1];
    const fileName = `${profile.id}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      console.error('Upload error:', uploadError);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
    const url = `${publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
    if (!updateError) {
      refetchProfile();
    }
    setIsUploading(false);
  };

  const handleEditAvatar = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
        });

        if (image.webPath) {
          const response = await fetch(image.webPath);
          const blob = await response.blob();
          uploadAvatar(blob);
        }
      } catch {
        console.info('User cancelled photo picker');
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('prepbit_token');
    await supabase.auth.signOut();
    ionRouter.push('/login');
  };

  const handleManageAccount = async () => {
    setIsOpeningBrowser(true);
    try {
      const sessionResp = await supabase.auth.getSession();
      const session = sessionResp.data.session;

      if (session && session.access_token && session.refresh_token) {
        const { access_token, refresh_token } = session;


        const url = `${config.API_BASE_URL}/bridge/profile?token=${encodeURIComponent(access_token)}&refresh=${encodeURIComponent(refresh_token)}`;
        await Browser.open({ url });
      }
    } finally {
      setIsOpeningBrowser(false);
    }
  };

  return (
    <IonPage>
      <IonContent>
        {isLoading || !profile ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <motion.div className="min-h-screen flex flex-col overflow-hidden" animate={{ background }} transition={{ duration: 1 }}>
            <div className="flex-shrink-0 pt-28 pb-8 flex flex-col items-center">
              <motion.div className="relative w-32 h-32 rounded-full bg-white border-4 shadow-lg overflow-hidden" animate={{ borderColor: color || '#a7f3d0' }} transition={{ duration: 1 }}>
                <AnimatePresence>
                  {isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : profile?.avatar_url ? (
                    <motion.img key={profile.avatar_url} src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-gray-200">
                      <span className="text-4xl font-bold text-gray-600">{(profile?.full_name || 'A').split(' ').map(n => n[0]).join('')}</span>
                    </div>
                  )}
                </AnimatePresence>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </motion.div>

              <motion.div
                onTapStart={() => {
                  (window as any).holdTimer = setTimeout(() => handleEditAvatar(), 500);
                  (window as any).vibrationInterval = setInterval(() => triggerHaptic(), 100);
                }}
                onTapCancel={() => {
                  clearTimeout((window as any).holdTimer);
                  clearInterval((window as any).vibrationInterval);
                }}
                onTap={() => {
                  clearTimeout((window as any).holdTimer);
                  clearInterval((window as any).vibrationInterval);
                }}
                whileTap={{ scale: 0.95 }}
                className="w-32 h-32 rounded-full absolute"
              >
                <AnimatePresence>
                  {showHoldIndicator && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 rounded-full flex items-center justify-center z-10 ${profile?.avatar_url ? 'bg-black/20' : ''}`}>
                      <p className={`text-xs ${profile?.avatar_url ? 'text-white' : 'text-black'}`}>Hold to change</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <div className="text-center mt-4">
                <h1 style={{ color: getContrastColor(color || '#ffffff') }} className="text-2xl font-bold">
                  {profile?.full_name || 'Aspirant'}
                </h1>
              </div>
            </div>

            <motion.div className="flex-grow px-2 pb-8" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}>
              <div className={`bg-white/30 ${!Capacitor.isNativePlatform() && 'backdrop-hue-rotate-180'} backdrop-blur-lg rounded-3xl shadow-xl p-4 mx-4 mb-4 transition-all duration-500`}>
                {Capacitor.isNativePlatform() ? (
                  <Item
                    icon={isOpeningBrowser ? <IonSpinner /> : <Star size={20} className="text-yellow-500" />}
                    bg="bg-yellow-100"
                    label="Manage Account"
                    onClick={handleManageAccount}
                    disabled={isOpeningBrowser}
                  />
                ) : (
                  <Item
                    icon={<Star size={20} className="text-yellow-500" />}
                    bg="bg-yellow-100"
                    label="Manage Subscription"
                    onClick={() => ionRouter.push('/subscribe', 'root')}
                  />
                )}
              </div>

              <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-lg p-4 mx-4 space-y-1">
                <Item icon={<User size={20} className="text-blue-500" />} bg="bg-blue-100" label="My Profile" value={profile?.username} onClick={() => ionRouter.push('/profile/details')} />
                <Item icon={<HelpCircle size={20} className="text-purple-500" />} bg="bg-purple-100" label="Support" onClick={() => ionRouter.push('/profile/support')} />
                <Item icon={<Package size={20} className="text-green-500" />} bg="bg-green-100" label="Read Later" onClick={() => ionRouter.push('/read-later')} />
                <Item icon={<Book size={20} className="text-yellow-500" />} bg="bg-yellow-100" label="Bookmarks" onClick={() => ionRouter.push('/bookmarks')} />
                <Item icon={<HelpCircle size={20} className="text-purple-500" />} bg="bg-purple-100" label="Contact Us" onClick={() => ionRouter.push('/contact-us')} />
                <div className="pt-2">
                  <Item icon={<LogOut size={20} className="text-red-500" />} bg="bg-red-100" label="Logout" onClick={handleLogout} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </IonContent>
    </IonPage>
  );
};

const Item = ({ icon, bg, label, value, onClick, disabled }: { icon: React.ReactNode; bg: string; label: string; value?: string; onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; disabled?: boolean }) => {
  const { triggerHaptic } = useHaptics();
  return (
    <button onClick={(e) => { triggerHaptic(); onClick?.(e); }} className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-gray-100/50 active:bg-gray-100 transition-colors duration-200" disabled={disabled}>
      <div className="flex items-center space-x-4">
        <div className={`${bg} p-2 rounded-lg`}>{icon}</div>
        <span className="font-medium text-black">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && <span className="text-gray-500">@{value}</span>}
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </button>
  );
};

export default ProfilePage;
