import { useState, useEffect } from 'react';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { ArrowLeft } from 'lucide-react';
import config from '../config';

interface Plan {
  id: string;
  title: string;
  price: string;
  period: string;
  subtitle: string;
  description: string[];
  savings?: string;
}

const AllPlansPage = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const ionRouter = useIonRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${config.API_BASE_URL}/get-plans`);
        const data = await response.json();
        const formattedPlans: Plan[] = [];
        data.subscriptions.forEach((sub: any) => {
          sub.basePlans.forEach((plan: any) => {
            if (plan.state === 'ACTIVE' && !plan.basePlanId.includes('-promo-base')) {
              const price = plan.regionalConfigs[0].price;
              const isYearly = plan.autoRenewingBasePlanType?.billingPeriodDuration === 'P1Y';
              const isTrial = plan.prepaidBasePlanType?.billingPeriodDuration === 'P1D';
              let subtitle;
              let description: string[] = [];
              let savings;

              const baseFeatures = [
                'Access to all premium articles and news analysis.',
                'Unlimited MCQs to test your knowledge.',
                'Powerful A-Z search for any topic.',
                'BackTrack feature to trace topics to past questions.',
              ];

              if (isTrial) {
                subtitle = `One-time access for 24 hours`;
                description = [
                  ...baseFeatures,
                  "A perfect way to see if we\'re the right fit for you. Access for a day would not be sufficient for referring the old topics and understanding the current affairs.",
                ];
              } else if (isYearly) {
                subtitle = `Billed as ₹${price.units} per year`;
                description = [
                  ...baseFeatures,
                  'Full year of uninterrupted learning.',
                ];
                savings = 'Includes 2 months free!';
              } else {
                subtitle = `Billed as ₹${price.units} per month`;
                description = [
                  ...baseFeatures,
                  'Cancel anytime.',
                ];
              }

              formattedPlans.push({
                id: plan.basePlanId,
                title: plan.basePlanId.replace('prepbit-', '').replace('-', ' '),
                price: `₹${price.units}`,
                period: isTrial ? '' : (isYearly ? '/year' : '/month'),
                subtitle: subtitle,
                description: description,
                savings: savings,
              });
            }
          });
        });
        setPlans(formattedPlans);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (isLoading) {
    return (
      <IonPage>
        <IonContent fullscreen>
          <div className="flex justify-center items-center h-screen bg-slate-900">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="bg-white text-black font-sans">
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button onClick={() => ionRouter.goBack()} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold ml-4">All Plans</h1>
          </div>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold capitalize text-black">{plan.title}</h2>
                    <p className="text-gray-600">{plan.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>
                <ul className="mt-2 text-gray-700 list-disc list-inside space-y-1">
                  {plan.description.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                {plan.savings && (
                  <p className="mt-2 text-green-600 font-bold text-center bg-green-100 py-2 rounded-lg">{plan.savings}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AllPlansPage;
