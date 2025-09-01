import { motion } from 'framer-motion';

const TailoredSection = () => {
  return (
    <>
      <motion.img
        src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/prelanding//prelanding_3.webp"
        alt="News"
        className="mx-auto mb-24 w-96 h-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <h1 className="text-3xl font-bold mb-4">
        Made to measure, just for you.
      </h1>
      <p className="text-lg text-gray-600">
        We don't do one-size-fits-all. Every summary is handcrafted to fit the unique demands of your exam.
      </p>
    </>
  );
};

export default TailoredSection;
