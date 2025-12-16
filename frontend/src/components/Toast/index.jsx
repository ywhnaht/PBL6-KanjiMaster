import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Delay to trigger animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Match animation duration
  };

  const colorSchemes = {
    success: {
      bg: 'from-green-500 to-emerald-500',
      icon: 'check_circle',
      iconColor: 'text-white'
    },
    error: {
      bg: 'from-red-500 to-rose-500',
      icon: 'error',
      iconColor: 'text-white'
    },
    warning: {
      bg: 'from-yellow-500 to-orange-500',
      icon: 'warning',
      iconColor: 'text-white'
    },
    info: {
      bg: 'from-blue-500 to-indigo-500',
      icon: 'info',
      iconColor: 'text-white'
    }
  };

  const scheme = colorSchemes[type] || colorSchemes.info;

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
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-sm ${scheme.bg}`}>
            <span className={`material-symbols-outlined ${scheme.iconColor} text-lg`}>
              {scheme.icon}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#2F4454]">{message}</p>
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

