import { motion } from 'framer-motion';

const SearchSection = () => {
  return (
    <>
      <motion.img
        src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/prelanding//prelanding_5.webp"
        alt="News"
        className="mx-auto mb-24 w-96 h-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <h1 className="text-3xl font-bold mb-4">
        Your wish is our command.
      </h1>
      <p className="text-lg text-gray-600">
        From complex concepts to quick queries, our search is your go-to for everything. Consider us your personal exam genie.
      </p>
    </>
  );
};

export default SearchSection;
