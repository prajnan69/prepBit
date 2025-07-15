import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonRouterOutlet,
  IonTabs,
  IonIcon,
  useIonRouter,
} from '@ionic/react';
import {
  searchOutline,
  bookmarkOutline,
  personOutline,
  home,
  timerOutline,
} from 'ionicons/icons';
import { motion, useMotionValue, animate, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import useScreenWidth from '../hooks/useScreenWidth';
import { useHaptics } from '../hooks/useHaptics';

import MainScreen from './MainScreen';
import ProfilePage from './ProfilePage';
import BookmarksPage from './BookmarksPage';
import ReadLaterPage from './ReadLaterPage';
import SearchPage from './SearchPage';
import BacktrackPage from './BacktrackPage';
import ArticlePage from './ArticlePage';
import NotificationsPage from './NotificationsPage';
import MyProfileDetailsPage from './MyProfileDetailsPage';
import SupportPage from './SupportPage';
import TabButton from './TabButton';
import PrivacyPolicyPage from './PrivacyPolicyPage';

const Tabs = ({
  examType,
  showToast,
  setSupportDrawer,
}: {
  examType: string;
  showToast: (message: string) => void;
  setSupportDrawer: (drawerState: { isOpen: boolean; type: 'bug' | 'feedback' | 'urgent' | null }) => void;
}) => {
  const location = useLocation();
  const screenWidth = useScreenWidth();
  const ionRouter = useIonRouter();
  const [activeTab, setActiveTab] = useState<string>('/home');
  const tabsRef = useRef<(HTMLDivElement | null)[]>([]);
  const { triggerHaptic } = useHaptics();
  const [initialLoad, setInitialLoad] = useState(true);

  const tabs = [
    { id: 'home', path: '/home', icon: home, label: 'Home' },
    { id: 'search', path: '/search', icon: searchOutline, label: 'Search' },
    { id: 'backtrack', path: '/backtrack', icon: timerOutline, label: 'Backtrack' },
    { id: 'profile', path: '/profile', icon: personOutline, label: 'Profile' },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const currentTab = tabs.find(tab => currentPath.startsWith(tab.path));
    if (currentTab) {
      setActiveTab(currentTab.path);
    }
    setTimeout(() => setInitialLoad(false), 500);
  }, [location.pathname, tabs]);

  const indicatorX = useMotionValue(0);
  const indicatorWidth = 85; // Increased width for the pill

  useEffect(() => {
    if (initialLoad) return;
    const activeTabIndex = tabs.findIndex(tab => tab.path === activeTab);
    const activeTabNode = tabsRef.current[activeTabIndex];

    if (activeTabNode) {
      const newX = activeTabNode.offsetLeft + (activeTabNode.offsetWidth / 2) - (indicatorWidth / 2);
      animate(indicatorX, newX, { type: 'spring', stiffness: 150, damping: 20 });
    }
  }, [activeTab, tabs, indicatorX, initialLoad]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/home" render={() => <MainScreen examType={examType} showToast={showToast} />} exact />
        <Route path="/search" render={() => <SearchPage />} exact />
        <Route path="/backtrack" render={() => <BacktrackPage />} exact />
        <Route path="/bookmarks" render={() => <BookmarksPage showToast={showToast} />} exact />
        <Route path="/read-later" render={() => <ReadLaterPage showToast={showToast} />} exact />
        <Route path="/profile" render={() => <ProfilePage />} exact />
        <Route path="/profile/details" render={() => <MyProfileDetailsPage />} exact />
        <Route path="/profile/support" render={() => <SupportPage setSupportDrawer={setSupportDrawer} />} exact />
        <Route path="/notifications" render={() => <NotificationsPage />} exact />
        <Route path="/article/:id" render={() => <ArticlePage showToast={showToast} />} exact />
        <Route exact path="/" render={() => <Redirect to="/home" />} />
      </IonRouterOutlet>

      {!location.pathname.startsWith('/article/') && (
        <div className="fixed bottom-4 inset-x-4 z-50">
          <div className="relative flex items-center justify-around bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-full p-1">
            <motion.div
              className="absolute left-0 top-1 bg-blue-600 rounded-full"
              style={{ x: indicatorX, width: indicatorWidth, height: 'calc(100% - 8px)' }}
              initial={{ x: -100 }}
              transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            />
            {tabs.map((tab, index) => {
              return (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.path}
                  indicatorX={indicatorX}
                  tabsRef={tabsRef}
                  index={index}
                  onClick={() => {
                    triggerHaptic();
                    setActiveTab(tab.path);
                    ionRouter.push(tab.path, 'none', 'replace');
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </IonTabs>
  );
};

export default Tabs;