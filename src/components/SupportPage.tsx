import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { Mail, Bug, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { useHaptics } from '../hooks/useHaptics';

const SupportPage = ({ setSupportDrawer }: { setSupportDrawer: (drawerState: { isOpen: boolean; type: 'bug' | 'feedback' | 'urgent' | null }) => void }) => {
  const ionRouter = useIonRouter();
  const { triggerHaptic } = useHaptics();
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
          <h1 className="text-3xl font-bold">Support</h1>
        </div>
        <div className="p-4 space-y-4">
          <button className="w-full flex items-center space-x-4 text-gray-600 p-4 rounded-lg bg-gray-100" onClick={() => {
            triggerHaptic();
            window.location.href = 'mailto:support@prepbit.com';
          }}>
            <Mail size={24} />
            <span>Email us</span>
          </button>
          <button className="w-full flex items-center space-x-4 text-gray-600 p-4 rounded-lg bg-gray-100" onClick={() => {
            triggerHaptic();
            setSupportDrawer({ isOpen: true, type: 'bug' });
          }}>
            <Bug size={24} />
            <span>Report a bug</span>
          </button>
          <button className="w-full flex items-center space-x-4 text-gray-600 p-4 rounded-lg bg-gray-100" onClick={() => {
            triggerHaptic();
            setSupportDrawer({ isOpen: true, type: 'feedback' });
          }}>
            <MessageSquare size={24} />
            <span>Feedback</span>
          </button>
          <button className="w-full flex items-center space-x-4 text-gray-600 p-4 rounded-lg bg-gray-100" onClick={() => {
            triggerHaptic();
            setSupportDrawer({ isOpen: true, type: 'urgent' });
          }}>
            <AlertTriangle size={24} />
            <span>Need urgent resolution</span>
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SupportPage;
