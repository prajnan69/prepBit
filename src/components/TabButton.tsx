import { motion, useTransform } from 'framer-motion';
import { IonIcon } from '@ionic/react';

const TabButton = ({ tab, isActive, indicatorX, tabsRef, index, onClick }: any) => {
  const color = useTransform(
    indicatorX,
    [
      (tabsRef.current[index]?.offsetLeft || 0) - 30,
      tabsRef.current[index]?.offsetLeft || 0,
      (tabsRef.current[index]?.offsetLeft || 0) + 30,
    ],
    ['#4b5563', '#ffffff', '#4b5563']
  );

  return (
    <div
      key={tab.id}
      ref={(el: HTMLDivElement | null) => {
        if (el) {
          tabsRef.current[index] = el;
        }
      }}
      role="button"
      onClick={onClick}
      className="relative z-10 flex flex-col items-center text-xs bg-transparent"
    >
      <motion.div
        animate={{ scale: isActive ? 1 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative flex flex-col items-center justify-center px-4 py-1"
      >
        <motion.div style={{ color }}>
          <IonIcon icon={tab.icon} className="text-xl sm:text-2xl" />
        </motion.div>
        <motion.span
          style={{ color }}
          className="text-[10px] sm:text-[11px] font-medium mt-0.5"
        >
          {tab.label}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default TabButton;
