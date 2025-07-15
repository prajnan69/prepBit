// ✅ KeywordDrawer.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useHaptics } from '../hooks/useHaptics';
import remarkGfm from 'remark-gfm';

interface KeywordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  content: string;
  loading: boolean;
}

const KeywordDrawer = ({ isOpen, onClose, keyword, content, loading }: KeywordDrawerProps) => {
  const { triggerHaptic } = useHaptics();
  const [timer, setTimer] = useState(20);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading && isOpen) {
      setTimer(20); // Reset timer
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading, isOpen]);

  const components = {
    p: ({ node, children, ...props }: any) => {
      const containsHeading = Array.isArray(children) && children.some(
        (child) =>
          typeof child === 'object' &&
          child?.type &&
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.type)
      );
      if (containsHeading) return <>{children}</>;
      return <p {...props}>{children}</p>;
    },
    h1: ({ node, ...props }: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-xl font-bold my-3" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-lg font-semibold my-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc ml-5 mb-2" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal ml-5 mb-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    table: ({ node, ...props }: any) => (
      <table className="table-auto border-collapse border border-gray-400 my-4" {...props} />
    ),
    th: ({ node, ...props }: any) => <th className="border border-gray-400 px-2 py-1 bg-gray-100" {...props} />,
    td: ({ node, ...props }: any) => <td className="border border-gray-400 px-2 py-1" {...props} />,
    code: ({ inline, children, ...props }: any) =>
      inline ? (
        <code className="bg-gray-100 text-red-500 px-1 rounded text-sm" {...props}>
          {children}
        </code>
      ) : (
        <pre className="bg-gray-900 text-white p-3 rounded overflow-x-auto">
          <code {...props}>{children}</code>
        </pre>
      ),
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white h-full w-full sm:max-w-md p-6 overflow-y-auto"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(event, info) => {
              if (info.offset.x > 100) {
                onClose();
              }
            }}
          >
            <div className="flex justify-between items-start mb-4 pt-8">
              <h2 className="text-2xl font-bold">{keyword}</h2>
              <button onClick={() => {
                triggerHaptic();
                onClose();
              }}>
                <X size={24} />
              </button>
            </div>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                {timer > 0 && <span className="ml-4 text-gray-500">{timer}s</span>}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="prose max-w-none"
              >
                <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KeywordDrawer;
