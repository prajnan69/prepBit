import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';

const RefundPolicyPage = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/subscribe" />
          </IonButtons>
          <IonTitle>Refund Policy</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Refund Policy</h1>
        <p>Last updated: July 08, 2025</p>
        <p>Thank you for subscribing to PrepBit. We appreciate your business and are committed to providing you with a high-quality service. This policy outlines our terms regarding refunds for our subscription plans.</p>
        <h2>General Policy</h2>
        <p>All subscription fees are non-refundable except where required by law. We do not provide refunds or credits for any partial subscription periods or unused services.</p>
        <h2>2-Day Trial</h2>
        <p>Our 2-Day Trial is offered as a one-time, non-refundable purchase. This trial is designed to provide you with full access to our features so that you can make an informed decision before committing to a recurring subscription. As such, the fee for the 2-Day Trial is final and will not be refunded under any circumstances.</p>
        <h2>Monthly and Yearly Subscriptions</h2>
        <p>Our monthly and yearly subscriptions are recurring and will automatically renew at the end of each billing cycle. You may cancel your subscription at any time through your account settings or by contacting our support team. Upon cancellation, your subscription will remain active until the end of the current billing period, and you will not be charged for subsequent periods.</p>
        <h2>Upgrades and Downgrades</h2>
        <p>You may upgrade from a monthly to a yearly subscription at any time. When you upgrade, you will be charged the prorated difference for the remainder of your current billing cycle, and your new billing cycle will begin immediately. Please note that we do not offer downgrades from a yearly to a monthly subscription. If you wish to switch from a yearly to a monthly plan, you must first cancel your yearly subscription and then subscribe to the monthly plan at the end of your current billing period.</p>
        <h2>Exceptional Circumstances</h2>
        <p>We understand that exceptional circumstances may occur. Refund requests due to technical issues or other extenuating circumstances will be considered on a case-by-case basis and granted at the sole discretion of PrepBit. To request a refund, please contact our support team with a detailed explanation of your situation.</p>
        <h2>Contact Us</h2>
        <p>If you have any questions about our Refund Policy, please contact us:</p>
        <ul>
          <li>By email: support@prepbit.academy</li>
        </ul>
      </IonContent>
    </IonPage>
  );
};

export default RefundPolicyPage;
