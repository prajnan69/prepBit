import {
  IonPage,
  IonContent,
  IonButtons,
  IonBackButton,
} from '@ionic/react';
import { Mail, Smartphone, ShieldCheck, Trash2, ArrowLeft } from 'lucide-react';
import { useIonRouter } from '@ionic/react';

const DeleteAccountPage = () => {
  const ionRouter = useIonRouter();

  return (
    <IonPage>
      <IonContent className="ion-padding bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <button onClick={() => ionRouter.goBack()} className="mr-4">
              <ArrowLeft size={24} style={{ color: 'black !important' }} />
            </button>
            <h1 className="text-3xl font-bold" style={{ color: 'black !important' }}>
              Delete Account
            </h1>
          </div>
          <div className="text-center mb-12">
            <p className="text-lg" style={{ color: 'black !important' }}>
              We're sorry to see you go. Please follow the steps below to proceed.
            </p>
          </div>

          <div>
            <ol className="space-y-8">
              {/* Step 1 */}
              <li className="flex" style={{ alignItems: 'center !important' }}>
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white">
                    <Mail size={24} />
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'black !important' }}>
                    Step 1: Send an Email
                  </h2>
                  <p className="mt-1" style={{ color: 'black !important' }}>
                    Send an email to{' '}
                    <a
                      href="mailto:support@prepbit.academy"
                      className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      support@prepbit.academy
                    </a>{' '}
                    with the subject line "Account Deletion Request".
                  </p>
                </div>
              </li>

              {/* Step 2 */}
              <li className="flex" style={{ alignItems: 'center !important' }}>
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white">
                    <Smartphone size={24} />
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'black !important' }}>
                    Step 2: Provide Your Phone Number
                  </h2>
                  <p className="mt-1" style={{ color: 'black !important' }}>
                    Include the phone number associated with your account in the body of the email for verification.
                  </p>
                </div>
              </li>

              {/* Step 3 */}
              <li className="flex" style={{ alignItems: 'center !important' }}>
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500 text-white">
                    <ShieldCheck size={24} />
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'black !important' }}>
                    Step 3: Verification
                  </h2>
                  <p className="mt-1" style={{ color: 'black !important' }}>
                    Our support team will contact you to verify your identity by sending an OTP to your registered phone number.
                  </p>
                </div>
              </li>

              {/* Step 4 */}
              <li className="flex" style={{ alignItems: 'center !important' }}>
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-red-500 text-white">
                    <Trash2 size={24} />
                  </span>
                </div>
                <div className="ml-4">
                  <h2 className="text-lg font-semibold" style={{ color: 'black !important' }}>
                    Step 4: Deletion
                  </h2>
                  <p className="mt-1" style={{ color: 'black !important' }}>
                    Once verified, your account and all associated data will be permanently deleted within 30 days.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-12 p-4 bg-yellow-100 border-l-4 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-500 rounded-r-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  This process is irreversible. Once your account is deleted, you will not be able to recover your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DeleteAccountPage;
