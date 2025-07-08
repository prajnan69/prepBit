import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';
import { motion } from 'framer-motion';
import { Users, Target, Eye, Search, FileText, Zap } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" className="text-gray-600" />
          </IonButtons>
          <IonTitle className="font-bold text-gray-800">About PrepBit</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="bg-gradient-to-br from-gray-50 to-purple-50 font-poppins">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 leading-tight">
              Unlock Your Potential.
            </h1>
            <p className="text-xl text-gray-600 mt-6 max-w-3xl mx-auto">
              PrepBit is your ultimate co-pilot for conquering civil service and other competitive exams. We cut through the noise, delivering precisely what you need to excel.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <FeatureCard
              icon={<Zap size={32} className="text-white" />}
              bgColor="bg-gradient-to-tr from-blue-500 to-cyan-400"
              title="Curated Current Affairs"
              description="Stay ahead with our daily digest of essential news and current events, meticulously curated to align with your exam syllabus. We filter out the fluff, so you can focus on what truly matters."
            />
            <FeatureCard
              icon={<Search size={32} className="text-white" />}
              bgColor="bg-gradient-to-tr from-purple-500 to-pink-500"
              title="Syllabus-Aware Search"
              description="Navigate the vast ocean of knowledge with ease. Our intelligent search understands the nuances of your exam's syllabus, providing you with targeted, relevant information in an instant."
            />
            <FeatureCard
              icon={<FileText size={32} className="text-white" />}
              bgColor="bg-gradient-to-tr from-green-500 to-teal-400"
              title="Historical Question Analysis"
              description="Uncover patterns and trends from past exams. Search any topic and instantly see how, when, and where it has been tested, giving you a strategic edge in your preparation."
            />
            <FeatureCard
              icon={<Users size={32} className="text-white" />}
              bgColor="bg-gradient-to-tr from-orange-500 to-yellow-400"
              title="Built for Aspirants, by Experts"
              description="PrepBit is crafted by a dedicated team of educators and successful aspirants who understand the journey. Our mission is to empower you with the tools and confidence to achieve your goals."
            />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const FeatureCard = ({ icon, bgColor, title, description }: { icon: React.ReactNode, bgColor: string, title: string, description: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
  >
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${bgColor} shadow-lg`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-gray-800 mt-6">{title}</h3>
    <p className="text-gray-600 mt-4 text-lg">{description}</p>
  </motion.div>
);

export default AboutUsPage;
