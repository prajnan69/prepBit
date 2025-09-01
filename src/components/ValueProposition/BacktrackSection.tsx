import { motion } from 'framer-motion';

const BacktrackSection = () => {
  return (
    <>
      <motion.img
        src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/prelanding//prelanding_2.webp"
        alt="News"
        className="mx-auto mb-24 w-96 h-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <h1 className="text-3xl font-bold mb-4">
        Your personal time-traveling tutor.
      </h1>
      <p className="text-lg text-gray-600">
        Our Backtrack feature zaps you to every past question on a topic. It's like having a secret weapon for your exams.
      </p>
    </>
  );
};

export default BacktrackSection;
