import { NavLink } from 'react-router-dom';
import { Home, BookOpen, User, Settings } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/', icon: <Home />, label: 'Home' },
    { to: '/quizzes', icon: <BookOpen />, label: 'Quizzes' },
    { to: '/profile', icon: <User />, label: 'Profile' },
    { to: '/settings', icon: <Settings />, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-transform duration-200 ease-in-out transform active:scale-90 ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`
            }
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
