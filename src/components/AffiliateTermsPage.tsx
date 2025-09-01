import { IonPage, IonContent } from '@ionic/react';

const AffiliateTermsPage = () => {
    return (
        <IonPage>
            <IonContent>
                <div className="bg-gray-900 text-white min-h-screen p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8">Affiliate Program Terms & Conditions</h1>
                        <div className="space-y-6 text-gray-300">
                            <p>This agreement outlines the terms and conditions of your participation in the PrepBit Affiliate Program. By applying, you acknowledge and agree to these terms.</p>
                            
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">1. Partnership and Collaboration</h2>
                                <p>As a PrepBit Affiliate Partner, you will be eligible for compensation based on content created in collaboration with PrepBit. To qualify for views-based compensation, all content, including but not limited to Instagram Reels, must be pre-approved by the PrepBit marketing team. Content created without prior approval will not be eligible for compensation under this program.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">2. Compensation Structure</h2>
                                <p>Our compensation model is designed to reward our partners for their valuable contributions. Payouts are structured as follows:</p>
                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                    <li>**Views-Based Compensation:** ₹3.8 per 100 views on pre-approved, collaborative Instagram Reels.</li>
                                    <li>**Revenue Share:** A 10% commission on the net revenue generated from users who subscribe using your unique promo code.</li>
                                </ul>
                                <p className="mt-2">PrepBit reserves the right to modify the payout rates and compensation structure at its sole discretion. Any changes will be communicated to active affiliates in a timely manner.</p>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">3. Program Termination</h2>
                                <p>PrepBit reserves the right to terminate your affiliate account at any time, for any reason, including but not limited to violations of these terms or misrepresentation of the PrepBit brand. We will make a reasonable effort to provide notice of termination.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AffiliateTermsPage;
