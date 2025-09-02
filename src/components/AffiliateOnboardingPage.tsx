import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { IonPage, IonContent, useIonRouter } from '@ionic/react';
import { useProfile } from '../context/ProfileContext';

const AffiliateOnboardingPage = () => {
    const { profile } = useProfile();
    const ionRouter = useIonRouter();
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        const checkAffiliateStatusAndFetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setPhoneNumber(user.phone || '');
                const { data, error } = await supabase
                    .from('affiliate_participants')
                    .select('is_approved')
                    .eq('user_id', user.id)
                    .single();

                if (data && data.is_approved) {
                    setIsRedirecting(true);
                    setTimeout(() => {
                        ionRouter.push('/affiliate-dashboard', 'root', 'replace');
                    }, 2000);
                }
            } else {
                ionRouter.push('/login', 'root', 'replace');
            }
        };

        if (profile) {
            setFullName(profile.full_name || '');
        }
        checkAffiliateStatusAndFetchUser();
    }, [profile, ionRouter]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('You must be logged in to apply.');
            return;
        }

        const verificationCodeValue = Math.random().toString(36).substring(2, 8).toUpperCase();

        const { data, error } = await supabase
            .from('affiliate_participants')
            .insert([{ user_id: user.id, full_name: fullName, phone_number: phoneNumber, instagram_handle: instagramHandle, verification_code: verificationCodeValue }])
            .select();

        if (error) {
            console.error('Error creating affiliate:', error);
            alert('There was an error submitting your application. Please try again.');
        } else {
            setVerificationCode(verificationCodeValue);
            setIsSubmitted(true);
        }
    };

    return (
        <IonPage>
            <IonContent>
                {isRedirecting ? (
                    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                        <h1 className="text-2xl font-bold">Welcome to the Affiliate Dashboard</h1>
                        <p className="text-gray-400">Redirecting...</p>
                    </div>
                ) : (
                    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center p-4">
                        <div className="w-full max-w-4xl">
                            <div className="text-center md:text-left mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold">Join the PrepBit Affiliate Program</h1>
                        </div>
                        <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
                            {!isSubmitted ? (
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Creator Onboarding</h2>
                                    <p className="mb-6 text-gray-400">Please fill out the form below to apply for our affiliate program.</p>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="full-name" className="block mb-2 text-sm font-medium text-gray-300">Full Name</label>
                                                <input type="text" id="full-name" className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 transition" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                            </div>
                                            <div>
                                                <label htmlFor="phone-number" className="block mb-2 text-sm font-medium text-gray-300">Phone Number</label>
                                                <input type="text" id="phone-number" className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 transition" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="instagram-handle" className="block mb-2 text-sm font-medium text-gray-300">Instagram Handle</label>
                                            <input type="text" id="instagram-handle" className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-indigo-500 transition" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} required />
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" id="terms" className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required />
                                            <label htmlFor="terms" className="ml-2 text-sm text-gray-400">I agree to the <a href="/affiliate-terms" className="underline hover:text-indigo-400 transition">Affiliate Program Terms & Conditions</a></label>
                                        </div>
                                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105">
                                            Apply
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">Verification Required</h2>
                                    <p className="mb-6 text-gray-400">To complete your application, please send the following code via direct message to our Instagram page: <a href="https://www.instagram.com/prepbit.academy" target="_blank" className="underline hover:text-indigo-400 transition">prepbit.academy</a></p>
                                    <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                                        <span className="text-2xl font-bold tracking-widest">{verificationCode}</span>
                                        <button onClick={() => navigator.clipboard.writeText(verificationCode)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default AffiliateOnboardingPage;
