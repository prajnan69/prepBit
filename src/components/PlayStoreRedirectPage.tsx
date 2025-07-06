import { IonPage, IonContent } from '@ionic/react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const PlayStoreRedirectPage = () => {
  const handleRedirect = () => {
    window.location.href = 'https://play.google.com/store/apps/details?id=com.prepbit.app';
  };

  return (
    <IonPage>
      <IonContent fullscreen className="bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800">Get the best experience</h1>
            <p className="text-lg text-gray-500 mt-2">
              For the best experience, please install our app from the Google Play Store.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={handleRedirect}
            className="bg-blue-600 text-white px-8 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            Go to Play Store
            <ArrowRight size={18} />
          </motion.button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PlayStoreRedirectPage;
