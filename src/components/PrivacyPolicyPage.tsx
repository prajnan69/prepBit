import { IonPage, IonContent, IonButtons, IonBackButton } from '@ionic/react';

const PrivacyPolicyPage = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/" />
        </IonButtons>
        <div className="p-4">
          <h1 className="text-3xl font-bold mt-8">Privacy Policy</h1>
        </div>
        <h1>Privacy Policy for PrepBit</h1>
        <p>Last Updated: July 3, 2025</p>
        <p>Welcome to PrepBit! This Privacy Policy explains how we collect, use, and disclose information about you when you use our mobile application ("App") and related services.</p>

        <h2>1. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul>
          <li><strong>Information You Provide to Us:</strong>
            <ul>
              <li><strong>Account Information:</strong> When you create an account, we collect your phone number. We may also collect your name, email address, and other profile information you choose to provide.</li>
              <li><strong>User Content:</strong> We collect the content you create within the App, such as your search queries, bookmarks, and notes.</li>
            </ul>
          </li>
          <li><strong>Information We Collect Automatically:</strong>
            <ul>
              <li><strong>Usage Information:</strong> We collect information about your activity on the App, such as the features you use, the articles you read, and the time, frequency, and duration of your activities.</li>
              <li><strong>Device Information:</strong> We collect information about your mobile device, including the hardware model, operating system and version, unique device identifiers, and mobile network information.</li>
            </ul>
          </li>
        </ul>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our App and services.</li>
          <li>Personalize your experience and provide content and features that match your interests.</li>
          <li>Communicate with you about products, services, offers, and events offered by PrepBit and others, and provide news and information we think will be of interest to you.</li>
          <li>Monitor and analyze trends, usage, and activities in connection with our App.</li>
          <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of PrepBit and others.</li>
        </ul>

        <h2>3. How We Share Your Information</h2>
        <p>We may share your information as follows:</p>
        <ul>
          <li>With your consent or at your direction.</li>
          <li>With third-party vendors and service providers that perform services on our behalf, such as hosting, analytics, and customer service.</li>
          <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process.</li>
          <li>If we believe your actions are inconsistent with our user agreements or policies, or to protect the rights, property, and safety of PrepBit or others.</li>
        </ul>

        <h2>4. Your Choices</h2>
        <ul>
          <li><strong>Account Information:</strong> You may update, correct, or delete your account information at any time by logging into your account.</li>
          <li><strong>Push Notifications:</strong> We may send push notifications or alerts to your mobile device. You can deactivate these messages at any time by changing the notification settings on your device.</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>

        <h2>6. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at: support@prepbit.academy</p>
      </IonContent>
    </IonPage>
  );
};

export default PrivacyPolicyPage;
