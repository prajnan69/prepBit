import { motion } from 'framer-motion';

const UpiPaymentPage = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
      <div className="flex-grow overflow-y-auto">
        <div className="flex flex-col justify-center items-center min-h-full w-full max-w-md md:max-w-4xl mx-auto px-6 pt-6 pb-36">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Verifying Payment</h1>
            <p className="text-slate-300 mt-1 text-base md:text-lg">
              Give us a few minutes to verify and activate the account. We will notify you.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UpiPaymentPage;
