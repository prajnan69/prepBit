import { motion } from "framer-motion";
import { FiX } from "react-icons/fi";

interface HistorySidebarProps {
  history: string[];
  onClose: () => void;
  onClearHistory: () => void;
}

const HistorySidebar = ({
  history,
  onClose,
  onClearHistory,
}: HistorySidebarProps) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-4 z-40"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Search History</h2>
        <button onClick={onClose}>
          <FiX className="text-2xl" />
        </button>
      </div>
      {history.length > 0 ? (
        <>
          <button
            onClick={onClearHistory}
            className="w-full py-2 bg-red-500 text-white rounded-lg mb-4"
          >
            Clear History
          </button>
          <ul className="space-y-2">
            {history.map((item, index) => (
              <li key={index} className="p-2 border-b">
                {item}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <p>Hey there!! why dont we make some history first.</p>
        </div>
      )}
    </motion.div>
  );
};

export default HistorySidebar;
