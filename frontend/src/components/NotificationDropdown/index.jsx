import React, { useState, useRef, useEffect } from 'react';
import useNotificationStore from '../../store/useNotificationStore';

export default function NotificationDropdown() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (notificationId) => {
    setDeletingIds(prev => new Set([...prev, notificationId]));
    deleteNotification(notificationId);
    
    // Remove from deleting state after animation
    setTimeout(() => {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }, 300);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      BATTLE_INVITE: 'swords',
      BATTLE_RESULT: 'emoji_events',
      ACHIEVEMENT: 'star',
      STREAK_MILESTONE: 'local_fire_department',
      INFO: 'info',
      WARNING: 'warning',
      ERROR: 'error'
    };
    return icons[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colors = {
      BATTLE_INVITE: 'text-blue-500',
      BATTLE_RESULT: 'text-yellow-500',
      ACHIEVEMENT: 'text-purple-500',
      STREAK_MILESTONE: 'text-orange-500',
      INFO: 'text-gray-500',
      WARNING: 'text-yellow-600',
      ERROR: 'text-red-500'
    };
    return colors[type] || 'text-gray-500';
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Filter notifications based on selected filter
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        <span className="material-symbols-outlined text-2xl text-[#2F4454]">
          notifications
        </span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[10001] animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-[#2F4454]/5 to-[#DA7B93]/5">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#2F4454]">
                notifications_active
              </span>
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-[#DA7B93] text-white rounded-full font-semibold">
                  {unreadCount}
                </span>
              )}
            </h3>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#2F4454] hover:text-[#DA7B93] font-medium transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-white/50"
              >
                <span className="material-symbols-outlined text-sm">
                  done_all
                </span>
                Đọc hết
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50/50">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                filter === 'all' 
                  ? 'text-[#2F4454] border-b-2 border-[#2F4454] bg-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-all ${
                filter === 'unread' 
                  ? 'text-[#2F4454] border-b-2 border-[#2F4454] bg-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-50">
                  notifications_off
                </span>
                <p className="text-sm font-medium">
                  {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                </p>
                <p className="text-xs mt-1 text-gray-400">
                  {filter === 'unread' ? 'Tất cả thông báo đã được đọc' : 'Bạn sẽ nhận được thông báo tại đây'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                    !notification.isRead ? 'bg-blue-50/50 border-l-4 border-l-blue-400' : ''
                  } ${deletingIds.has(notification.id) ? 'opacity-0 -translate-x-full' : 'opacity-100 translate-x-0'}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.isRead ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gray-200'
                    }`}>
                      <span className={`material-symbols-outlined text-xl ${
                        !notification.isRead ? 'text-white' : 'text-gray-500'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        
                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">
                            schedule
                          </span>
                          {formatTime(notification.createdAt)}
                        </span>
                        
                        {!notification.isRead && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Mới
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer (Optional) */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <button className="text-sm text-[#2F4454] hover:text-[#DA7B93] font-medium transition-colors">
                Xem tất cả thông báo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
