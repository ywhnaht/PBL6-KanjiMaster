import React from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Xác nhận', 
  message, 
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger' // danger, warning, info
}) => {
  if (!isOpen) return null;

  const getButtonColor = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-[#2F4454] hover:bg-[#1F3444]';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-[#2F4454]';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <span className={`material-symbols-outlined text-3xl ${getIconColor()}`}>
                {type === 'danger' ? 'error' : type === 'warning' ? 'warning' : 'info'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#2F4454] mb-2">{title}</h3>
              <p className="text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 px-4 py-3 ${getButtonColor()} text-white font-semibold rounded-xl transition-colors duration-200`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
