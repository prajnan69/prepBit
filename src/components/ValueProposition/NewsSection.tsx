import { motion } from 'framer-motion';

const NewsSection = () => {
  return (
    <>
      <motion.img
        src="https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/prelanding//prelanding_1.webp"
        alt="News"
        className="mx-auto mb-24 w-96 h-96"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      <h1 className="text-3xl font-bold mb-4">
        All killer, no <span className="line-through">filler</span>.
      </h1>
      <p className="text-lg text-gray-600">
        We cut through the clutter to bring you news that matters. Say goodbye to endless scrolling and hello to focused learning.
      </p>
    </>
  );
};

export default NewsSection;
