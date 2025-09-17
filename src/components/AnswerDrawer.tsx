import { IonModal, IonContent } from '@ionic/react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Loader from './Loader';

interface AnswerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  answer: string;
  isLoading: boolean;
}

const AnswerDrawer = ({ isOpen, onClose, question, answer, isLoading }: AnswerDrawerProps) => {
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      initialBreakpoint={0.5}
      breakpoints={[0, 0.5, 1]}
      handleBehavior="cycle"
    >
      <IonContent className="ion-padding bg-gray-900 text-white">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{question}</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>
          <div className="mt-4">
            {isLoading ? (
              <Loader />
            ) : (
              <div className="prose prose-invert">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {answer}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default AnswerDrawer;
