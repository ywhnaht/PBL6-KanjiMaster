import React, { useEffect, useState } from 'react';

export default function NotificationToast({ notification, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (notification) {
      // Delay to trigger animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        setIsVisible(false);
        setIsClosing(false);
      };
    }
  }, [notification]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match animation duration
  };

  if (!notification) return null;

  const getNotificationIcon = (type) => {
    const iconMap = {
      WELCOME: 'waving_hand',
      BATTLE_INVITE: 'swords',
      BATTLE_RESULT: 'emoji_events',
      ACHIEVEMENT: 'military_tech',
      QUIZ_REMINDER: 'quiz',
      STREAK_MILESTONE: 'local_fire_department',
      NOTEBOOK_SHARED: 'folder_shared',
      SYSTEM: 'info',
      INFO: 'info',
    };
    return iconMap[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      WELCOME: 'from-blue-500 to-cyan-500',
      BATTLE_INVITE: 'from-purple-500 to-pink-500',
      BATTLE_RESULT: 'from-yellow-500 to-orange-500',
      ACHIEVEMENT: 'from-green-500 to-emerald-500',
      QUIZ_REMINDER: 'from-indigo-500 to-purple-500',
      STREAK_MILESTONE: 'from-red-500 to-orange-500',
      NOTEBOOK_SHARED: 'from-teal-500 to-green-500',
      SYSTEM: 'from-gray-500 to-gray-600',
      INFO: 'from-blue-500 to-indigo-500',
    };
    return colorMap[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div 
      className={`fixed top-20 right-4 z-[10002] transition-all duration-300 ease-out ${
        isVisible && !isClosing 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-sm min-w-[320px] backdrop-blur-sm">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm ${getNotificationColor(
              notification.type
            )}`}
          >
            <span className="material-symbols-outlined text-white text-lg">
              {getNotificationIcon(notification.type)}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-[#2F4454] truncate">
              {notification.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400 text-lg">
              close
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}