import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '../hooks/useHaptics';
import { FiSend, FiCheckCircle } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';
import config from '../config';
import { useDeviceType } from '../hooks/useDeviceType';

const ContactUsPage = () => {
  const { triggerHaptic } = useHaptics();
  const platform = useDeviceType();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    triggerHaptic();
    try {
      const { data, error } = await supabase.from('contact_us').insert([formData]);
      if (error) throw error;
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-8"
        >
          <AnimatePresence>
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } }}
                >
                  <FiCheckCircle className="h-20 w-20 mx-auto text-green-500" />
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-800 mt-6">Thank You!</h2>
                <p className="text-gray-600 mt-2">Your message has been sent. We'll be in touch soon.</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h1
                  variants={itemVariants}
                  className="text-4xl font-bold text-gray-900 text-center mb-2"
                >
                  Contact Us
                </motion.h1>
                <motion.p
                  variants={itemVariants}
                  className="text-gray-600 text-center mb-8"
                >
                  Have a question? We'd love to hear from you.
                </motion.p>
                {config.SHOW_LEGAL_INFO && platform === 'web' && (
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <p className="text-gray-600">Legal Name: C Prajnan</p>
                    <p className="text-gray-600">Email: support@prepbit.academy</p>
                    <p className="text-gray-600">Mobile: 8660627034</p>
                  </motion.div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full px-5 py-3 rounded-xl bg-gray-100/80 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      className="w-full px-5 py-3 rounded-xl bg-gray-100/80 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label htmlFor="mobile" className="sr-only">Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      id="mobile"
                      autoComplete="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Your Mobile Number"
                      className="w-full px-5 py-3 rounded-xl bg-gray-100/80 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      className="w-full px-5 py-3 rounded-xl bg-gray-100/80 border-2 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 transition"
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiSend />
                      Send Message
                    </motion.button>
                  </motion.div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactUsPage;
