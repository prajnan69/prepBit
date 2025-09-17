import React from 'react';
import { IonPage, IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

const AdFrameworkPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Prepbit for Creators</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Prepbit Ad Framework for Creators</h1>
          <p>
            Prepbit is the smartest way for UPSC & competitive exam aspirants to use their free time — whether to quickly glance at daily news or to instantly dive deeper into any topic.
          </p>

          <h2>Key Points to Highlight in Your Ad</h2>

          <section style={{ marginBottom: '2rem' }}>
            <h3>Main Screen (Quick Glance)</h3>
            <ul>
              <li>Show the clean, no-nonsense news feed.</li>
              <li>Highlight how news is summarized for Prelims & Mains, making it exam-focused.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3>MCQs & Mains Questions</h3>
            <ul>
              <li>Every news item comes with MCQs (Prelims) and answer-writing prompts (Mains).</li>
              <li>Emphasize quick practice in free time.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3>Prepbit Search (Instant Deep Dive)</h3>
            <ul>
              <li>Show a student searching a topic.</li>
              <li>App instantly summarizes it → user understands it in minutes.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h3>PYQs (Previous Year Questions)</h3>
            <ul>
              <li>App fetches questions from past UPSC papers based on the topic.</li>
              <li>Connects current affairs to real exam patterns.</li>
            </ul>
          </section>

          <h2>Tone & Style</h2>
          <p>
            Minimal, exam-focused, modern. Should feel effortless, like something students can use during short breaks.
            Screen recordings + clean captions, no clutter.
          </p>

          <h2>Note for Creators</h2>
          <p>
            You’ll also have a referral code in your dashboard → you get 10% of every subscription made using your code.
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdFrameworkPage;
