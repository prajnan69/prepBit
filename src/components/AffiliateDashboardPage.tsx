import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import { HelpCircle } from 'lucide-react';

interface AffiliateData {
    id: string;
    promo_code: string;
    earnings?: number;
    trial_count?: number;
    monthly_subs?: number;
    yearly_subs?: number;
}

const AffiliateDashboardPage = () => {
    const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null);
    const [loading, setLoading] = useState(true);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [tips, setTips] = useState<{ description: string }[]>([]);
    const [currentTip, setCurrentTip] = useState(0);
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutAmount, setPayoutAmount] = useState(0);
    const [upiId, setUpiId] = useState('');
    const [payoutStatus, setPayoutStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [minPayout, setMinPayout] = useState(1000);
    const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
    const [reelUrl, setReelUrl] = useState('');
    const [redeemedReels, setRedeemedReels] = useState<any[]>([]);
    const [showReelHistory, setShowReelHistory] = useState(false);
    const [showAlreadySubmitted, setShowAlreadySubmitted] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const ionRouter = useIonRouter();

    
    const fetchAffiliateData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_affiliate_earnings', { p_user_id: session.user.id });

            if (error) {
                console.error('Error fetching affiliate earnings:', error);
            } else if (data && data.length > 0) {
                const { total_earnings, trial_count, monthly_subs_count, yearly_subs_count } = data[0];
                const { data: affiliateData, error: affiliateError } = await supabase
                    .from('affiliate_participants')
                    .select('promo_code')
                    .eq('user_id', session.user.id)
                    .single();
                
                if (affiliateData) {
                    const { data: affiliateParticipant, error: affiliateParticipantError } = await supabase
                        .from('affiliate_participants')
                        .select('id, promo_code')
                        .eq('user_id', session.user.id)
                        .single();

                    if (affiliateParticipant) {
                        setAffiliateData({
                            id: affiliateParticipant.id,
                            promo_code: affiliateParticipant.promo_code,
                            earnings: total_earnings,
                            trial_count: trial_count,
                            monthly_subs: monthly_subs_count,
                            yearly_subs: yearly_subs_count,
                        });
                    }
                }
            }
            setLoading(false);
        }
    };

    useIonViewWillEnter(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                ionRouter.push('/login', 'root', 'replace');
            } else {
                fetchAffiliateData();
            }
        };

        getSession();
    });

    const handleRedeemReel = async () => {
        setShowVerification(false);
        setIsVerifying(true);

        if (affiliateData) {
            const { data: affiliate, error: affiliateError } = await supabase
                .from('affiliate_participants')
                .select('instagram_handle')
                .eq('id', affiliateData.id)
                .single();

            if (affiliateError) {
                console.error('Error fetching affiliate data:', affiliateError);
                alert('There was an error fetching your affiliate data. Please try again.');
                setIsVerifying(false);
                return;
            }

            const { error } = await supabase.from('redeemed_reels').insert([
                {
                    affiliate_id: affiliateData.id,
                    reel_url: reelUrl,
                    instagram_user_id: affiliate.instagram_handle,
                    views: 0,
                    earnings: 0,
                },
            ]);

            if (error) {
                console.error('Error redeeming reel:', error);
                alert('There was an error redeeming your reel. Please try again.');
            } else {
                fetchAffiliateData();
            }
        }
        setTimeout(() => {
            setIsVerifying(false);
            setShowSuccessMessage(true);
            setReelUrl('');
        }, 5000);
    };

    const handleVerifyReel = async () => {
        if (!reelUrl) {
            alert('Please enter a valid reel link.');
            return;
        }

        const { data, error } = await supabase
            .from('redeemed_reels')
            .select('id')
            .eq('reel_url', reelUrl)
            .single();

        if (data) {
            setShowAlreadySubmitted(true);
            return;
        }

        setShowVerification(true);
    };

    useEffect(() => {
        const fetchTips = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data, error } = await supabase
                    .from('affiliate_tips')
                    .select('description')
                    .or(`user_id.eq.${session.user.id},user_id.is.null`);
                
                if (data) {
                    setTips(data);
                }
            }
        };

        fetchTips();
    }, []);

    useEffect(() => {
        const fetchPayoutHistory = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && affiliateData?.id) {
                const { data, error } = await supabase
                    .from('affiliate_payouts')
                    .select('*')
                    .eq('affiliate_id', affiliateData.id);
                if (data) {
                    setPayoutHistory(data);
                }
            }
        };
        fetchPayoutHistory();

        const fetchRedeemedReels = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session && affiliateData?.id) {
                const { data, error } = await supabase
                    .from('redeemed_reels')
                    .select('*')
                    .eq('affiliate_id', affiliateData.id);
                if (data) {
                    setRedeemedReels(data);
                    const approvedReels = data.filter(reel => reel.is_approved && !reel.is_redeemed);
                    const reelEarnings = approvedReels.reduce((acc, reel) => acc + (reel.views / 100) * 3.8, 0);
                    setMinPayout(reelEarnings);
                    setPayoutAmount(reelEarnings);
                }
            }
        };
        fetchRedeemedReels();
    }, [affiliateData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prevTip) => (prevTip + 1) % (tips.length || 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [tips]);

    return (
        <IonPage>
            <IonContent>
                <div className="bg-gray-900 text-white min-h-screen">
                    <div className="container mx-auto px-4 py-8">
                        {loading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        ) : affiliateData ? (
                            !termsAccepted ? (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                    <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg w-full">
                                        <h2 className="text-2xl font-bold mb-4">Affiliate Program Terms & Conditions</h2>
                                        <div className="space-y-6 text-gray-300 mb-4 max-h-64 overflow-y-auto">
                                            <p>This agreement outlines the terms and conditions of your participation in the PrepBit Affiliate Program. By applying, you acknowledge and agree to these terms.</p>
                                            
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">1. Partnership and Collaboration</h3>
                                                <p>As a PrepBit Affiliate Partner, you will be eligible for compensation based on content created in collaboration with PrepBit. To qualify for views-based compensation, all content, including but not limited to Instagram Reels, must be pre-approved by the PrepBit marketing team. Content created without prior approval will not be eligible for compensation under this program.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">2. Compensation Structure</h3>
                                                <p>Our compensation model is designed to reward our partners for their valuable contributions. Payouts are structured as follows:</p>
                                                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                                                    <li>**Views-Based Compensation:** ₹3.8 per 100 views on pre-approved, collaborative Instagram Reels.</li>
                                                    <li>**Revenue Share:** A 10% commission on the net revenue generated from users who subscribe using your unique promo code.</li>
                                                </ul>
                                                <p className="mt-2">PrepBit reserves the right to modify the payout rates and compensation structure at its sole discretion. Any changes will be communicated to active affiliates in a timely manner.</p>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2">3. Program Termination</h3>
                                                <p>PrepBit reserves the right to terminate your affiliate account at any time, for any reason, including but not limited to violations of these terms or misrepresentation of the PrepBit brand. We will make a reasonable effort to provide notice of termination.</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setTermsAccepted(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                            I Agree
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <p className="text-gray-400">This Month's Earnings</p>
                                        <p className="text-5xl font-bold text-green-400">₹{affiliateData.earnings?.toFixed(2) || '0.00'}</p>
                                        <button 
                                            onClick={() => setShowPayoutModal(true)} 
                                            className="mt-4 bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                            disabled={(affiliateData.earnings || 0) < 1000}
                                        >
                                            Request Payout
                                        </button>
                                        {(affiliateData.earnings || 0) < 1000 && (
                                            <p className=" gray-500 text-sm mt-2">withdrawal amount min: ₹1000</p>
                                        )}
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex justify-between items-center">
                                            <h3 className="font-bold">Earnings Breakdown</h3>
                                            <svg className={`w-6 h-6 transition-transform transform ${showBreakdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                        {showBreakdown && (
                                            <div className="mt-4 space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Monthly Subscriptions</span>
                                                    <span>{affiliateData.monthly_subs || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Yearly Subscriptions</span>
                                                    <span>{affiliateData.yearly_subs || 0}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Trial Sign-ups</span>
                                                    <span>{affiliateData.trial_count || 0}</span>
                                                </div>
                                                {redeemedReels.map((reel) => (
                                                    <div key={reel.id} className="flex justify-between items-center">
                                                        <span className="truncate max-w-xs" title={reel.reel_url}>Reel: {reel.reel_url}</span>
                                                        <span>{reel.is_approved ? `₹${((reel.views / 100) * 3.8).toFixed(2)}` : 'Pending'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <h3 className="font-bold mb-4">Redeem Your Reel</h3>
                                        {isVerifying ? (
                                            <div className="text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                                                <p>Under verification. Give us a few minutes to add the redeemable amount to your payout.</p>
                                            </div>
                                        ) : showSuccessMessage ? (
                                            <div className="text-center">
                                                <p className="text-green-500">Reel submitted for review!</p>
                                                <button onClick={() => setShowSuccessMessage(false)} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                                                    Add more?
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {showAlreadySubmitted && (
                                                    <p className="text-red-500">This reel has already been submitted.</p>
                                                )}
                                                <div>
                                                    <label htmlFor="reel-url" className="block mb-2 text-sm font-medium text-gray-300">Reel Link</label>
                                                    <input type="text" id="reel-url" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 transition" value={reelUrl} onChange={(e) => setReelUrl(e.target.value)} required />
                                                </div>
                                                <button onClick={handleVerifyReel} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                                    Verify
                                                </button>
                                            </div>
                                        )}
                                        <div className="mt-4">
                                            <button onClick={() => setShowReelHistory(!showReelHistory)} className="w-full flex justify-between items-center">
                                                <h4 className="font-bold">Reel History</h4>
                                                <svg className={`w-6 h-6 transition-transform transform ${showReelHistory ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </button>
                                            {showReelHistory && (
                                                <div className="mt-4 space-y-2">
                                                    {redeemedReels.map((reel) => (
                                                        <div key={reel.id} className="flex justify-between items-center">
                                                            <span className="truncate max-w-xs">{reel.reel_url}</span>
                                                            <span>{reel.is_approved ? 'Approved' : 'Pending'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <h3 className="font-bold mb-4">Your Promo Code</h3>
                                        <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                                            <span className="text-2xl font-bold tracking-widest">{affiliateData.promo_code}</span>
                                            <button onClick={() => navigator.clipboard.writeText(affiliateData.promo_code)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                                                Copy
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <h3 className="font-bold mb-4">Tips for Success</h3>
                                        <div className="relative h-24">
                                            {tips.map((tip, index) => (
                                                <div
                                                    key={index}
                                                    className={`absolute w-full transition-opacity duration-500 ${index === currentTip ? 'opacity-100' : 'opacity-0'}`}
                                                >
                                                    <p className="text-gray-300">{tip.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <h3 className="font-bold mb-4">Payout History</h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full bg-gray-800 rounded-lg">
                                                <thead>
                                                    <tr>
                                                        <th className="py-3 px-4 text-left">Date</th>
                                                        <th className="py-3 px-4 text-left">Amount</th>
                                                        <th className="py-3 px-4 text-left">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {payoutHistory.map((payout) => (
                                                        <tr key={payout.id} className="border-t border-gray-700">
                                                            <td className="py-3 px-4">{new Date(payout.requested_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                                            <td className="py-3 px-4">₹{payout.amount.toFixed(2)}</td>
                                                            <td className="py-3 px-4">{payout.status}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 shadow-lg">
                                        <button onClick={() => ionRouter.push('/profile/support')} className="w-full flex justify-between items-center">
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-purple-100 p-2 rounded-lg">
                                                    <HelpCircle size={20} className="text-purple-500" />
                                                </div>
                                                <span className="font-bold">Contact Support</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                            <p className="text-center">You are not currently an affiliate.</p>
                        )}
                    </div>
                    {showVerification && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-lg flex items-center justify-center z-50">
                            <div className="bg-gray-800 bg-opacity-50 p-8 rounded-2xl shadow-lg max-w-lg w-full text-center">
                                <p className="text-yellow-500 mb-4">Only views can be redeemed once on the reel.</p>
                                <div className="flex justify-around">
                                    <button onClick={() => setShowVerification(false)} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                        Cancel
                                    </button>
                                    <button onClick={handleRedeemReel} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showPayoutModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg max-w-lg w-full">
                                {payoutStatus === 'success' ? (
                                    <div className="text-center">
                                        <h2 className="text-2xl font-bold mb-4">Payout Request Received</h2>
                                        <p>Your payout request is under review. You will receive the amount within 1 hour.</p>
                                        <button onClick={() => setShowPayoutModal(false)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                            Close
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-4">Request Payout</h2>
                                        <div className="mb-4">
                                            <label htmlFor="payout-amount" className="block mb-2 text-sm font-medium text-gray-300">Amount: ₹{payoutAmount}</label>
                                            <input
                                                type="range"
                                                id="payout-amount"
                                                min={minPayout}
                                                max={affiliateData?.earnings || 0}
                                                value={payoutAmount}
                                                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                                                className="w-full"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="upi-id" className="block mb-2 text-sm font-medium text-gray-300">UPI ID</label>
                                            <input type="text" id="upi-id" className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-indigo-500 transition" value={upiId} onChange={(e) => setUpiId(e.target.value)} required />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (affiliateData) {
                                                    setPayoutStatus('loading');
                                                    const { data, error } = await supabase.from('affiliate_payouts').insert([{ affiliate_id: affiliateData.id, amount: payoutAmount, upi_id: upiId }]);
                                                    if (error) {
                                                        console.error('Error requesting payout:', error);
                                                        alert('There was an error submitting your request. Please try again.');
                                                        setPayoutStatus('idle');
                                                    } else {
                                                        const approvedReels = redeemedReels.filter(reel => reel.is_approved && !reel.is_redeemed);
                                                        const reelIds = approvedReels.map(reel => reel.id);
                                                        await supabase.from('redeemed_reels').update({ is_redeemed: true }).in('id', reelIds);
                                                        setPayoutStatus('success');
                                                    }
                                                }
                                            }}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
                                            disabled={payoutStatus === 'loading'}
                                        >
                                            {payoutStatus === 'loading' ? (
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            ) : (
                                                'Request Payout'
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default AffiliateDashboardPage;
