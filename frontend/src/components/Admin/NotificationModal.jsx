import React, { useEffect } from 'react';

const NotificationModal = ({ 
  type = 'info', 
  title, 
  message, 
  isOpen, 
  onClose,
  autoClose = true,
  duration = 3000 
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'cancel';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[99999] animate-slide-in-right">
      <div className={`${getBgColor()} border rounded-2xl p-4 shadow-2xl max-w-sm`}>
        <div className="flex gap-3">
          <span className="material-symbols-outlined text-3xl flex-shrink-0">{getIcon()}</span>
          <div className="flex-1">
            <h3 className={`${getTitleColor()} font-bold mb-1`}>{title}</h3>
            <p className={`${getTextColor()} text-sm`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
