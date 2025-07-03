import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { useProfile } from '../context/ProfileContext';
import {
  User,
  Package,
  ChevronRight,
  LogOut,
  HelpCircle,
  ChevronDown,
  Book,
  MapPin,
  Mail,
  Bug,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useColor } from 'color-thief-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const getContrastColor = (hex: string) => {
  if (!hex) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

const ProfilePage = ({ setSupportDrawer }: { setSupportDrawer: (drawerState: { isOpen: boolean; type: 'bug' | 'feedback' | 'urgent' | null }) => void }) => {
  const { profile, loading, refetchProfile } = useProfile();
  const { data: color } = useColor(profile?.avatar_url || '', 'hex', { crossOrigin: 'anonymous' });
  const [background, setBackground] = useState('linear-gradient(to bottom, #ffffff 0%, #ffffff 100%)');
  const ionRouter = useIonRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerHaptic } = useHaptics();
  const [showHoldIndicator, setShowHoldIndicator] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHoldIndicator(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (color) {
      setBackground(`linear-gradient(to bottom, ${color} 0%, ${color}80 100%)`);
    }
  }, [color]);

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File | Blob) => {
    if (!profile || !profile.id) return;
    setIsUploading(true);
    const fileExt = file.type.split('/')[1];
    const fileName = `${profile.id}.${fileExt}`;
    const filePath = `${fileName}`;

    let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
      upsert: true,
    });

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    const url = `${publicUrl}?t=${new Date().getTime()}`;
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', profile.id);

    if (updateError) {
      console.error('Error updating avatar url:', updateError);
    } else {
      refetchProfile();
    }
    setIsUploading(false);
  };

  const handleEditAvatar = async () => {
    if (Capacitor.isNativePlatform()) {
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
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <IonPage>
      <IonContent>
        <motion.div
          className="min-h-screen flex flex-col overflow-hidden"
          animate={{ background }}
          transition={{ duration: 1 }}
        >
          <div className="flex-shrink-0 pt-28 pb-8 flex flex-col items-center">
            <motion.div
              className="relative w-32 h-32 rounded-full bg-white border-4 shadow-lg overflow-hidden"
              animate={{ borderColor: color || '#a7f3d0' }}
              transition={{ duration: 1 }}
            >
              <AnimatePresence>
                {isUploading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : profile?.avatar_url ? (
                  <motion.img
                    key={profile.avatar_url}
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <User size={60} className="text-green-900" />
                  </div>
                )}
              </AnimatePresence>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </motion.div>
            <motion.div
              onTapStart={() => {
                const timer = setTimeout(() => {
                  handleEditAvatar();
                }, 500);
                (window as any).holdTimer = timer;

                const interval = setInterval(() => {
                  triggerHaptic();
                }, 100);
                (window as any).vibrationInterval = interval;
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1 } }}
                    className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center"
                  >
                    <p className="text-white text-xs">Hold to change</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="text-center">
              <h1 style={{ color: getContrastColor(color || '#ffffff') }} className="text-2xl font-bold">{profile?.full_name || 'Aspirant'}</h1>
            </div>
          </div>

          <motion.div
            className="flex-grow px-2 pb-8"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
          >
            <div className="bg-white/30 backdrop-blur-lg rounded-3xl shadow-lg p-6 space-y-3">
              <Item
                icon={<User size={20} className="text-blue-500" />}
                bg="bg-blue-100" 
                label="My Profile"
                value={profile?.username}
                onClick={() => ionRouter.push('/profile/details')}
              />
              <Item 
                icon={<HelpCircle size={20} className="text-purple-500" />} 
                bg="bg-purple-100" 
                label="Support" 
                onClick={() => ionRouter.push('/profile/support')}
              />
              <Item 
                icon={<Package size={20} className="text-green-500" />} 
                bg="bg-green-100" 
                label="Read Later" 
                onClick={() => ionRouter.push('/read-later', 'forward', 'push')}
              />
              <div className="pt-2">
                <Item 
                  icon={<LogOut size={20} className="text-red-500" />} 
                  bg="bg-red-100" 
                  label="Logout" 
                  onClick={handleLogout}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </IonContent>
    </IonPage>
  );
};

// Reusable item component
const Item = ({ icon, bg, label, value, onClick }: { icon: React.ReactNode, bg: string, label: string, value?: string, onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void }) => {
  const { triggerHaptic } = useHaptics();
  const { data: color } = useColor(bg, 'hex', { crossOrigin: 'anonymous' });
  return (
    <button 
      onClick={(e) => {
        triggerHaptic();
        if (onClick) {
          onClick(e);
        }
      }}
      className="w-full flex justify-between items-center p-3 rounded-xl hover:bg-gray-100 transition-colors duration-200"
    >
    <div className="flex items-center space-x-4">
      <div className={`${bg} p-2 rounded-lg`}>
        {icon}
      </div>
      <span className="font-medium text-black">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {value && <span style={{ color: getContrastColor(color || '#ffffff') }} className="text-gray-500">@{value}</span>}
      <ChevronRight size={20} style={{ color: getContrastColor(color || '#ffffff') }} />
    </div>
  </button>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center justify-between text-sm px-2 py-1">
    <div className="flex items-center space-x-2 text-gray-600">
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-gray-800 font-medium">{value}</span>
  </div>
);

export default ProfilePage;
