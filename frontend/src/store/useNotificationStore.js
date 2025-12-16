import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  newNotification: null,
  isConnected: false,
  
  // WebSocket reference
  ws: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimeout: null,
  isIntentionalClose: false, // Track if disconnect was intentional
  pendingActions: new Map(), // Track pending actions to prevent duplicates

  // Actions
  setNotifications: (notifications) => set({ notifications }),
  
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + 1,
    newNotification: notification
  })),
  
  clearNewNotification: () => set({ newNotification: null }),
  
  markAsRead: (notificationId) => {
    const state = get();
    
    // Prevent duplicate requests
    const actionKey = `mark_read_${notificationId}`;
    if (state.pendingActions.has(actionKey)) {
      console.log('⚠️ Mark as read already pending for', notificationId);
      return;
    }
    
    // Add to pending actions
    state.pendingActions.set(actionKey, true);
    
    // Send to backend via WebSocket
    state.sendMessage('MARK_READ', notificationId);
    
    // Update local state immediately for better UX
    set((state) => ({
      notifications: state.notifications.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
    
    // Clear pending after delay
    setTimeout(() => {
      get().pendingActions.delete(actionKey);
    }, 1000);
  },
  
  markAllAsRead: () => {
    const state = get();
    
    // Prevent duplicate requests
    const actionKey = 'mark_all_read';
    if (state.pendingActions.has(actionKey)) {
      console.log('⚠️ Mark all as read already pending');
      return;
    }
    
    // Add to pending actions
    state.pendingActions.set(actionKey, true);
    
    // Send to backend via WebSocket
    state.sendMessage('MARK_ALL_READ', {});
    
    // Update local state immediately
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
    
    // Clear pending after delay
    setTimeout(() => {
      get().pendingActions.delete(actionKey);
    }, 1000);
  },
  
  deleteNotification: (notificationId) => {
    const state = get();
    
    // Prevent duplicate requests
    const actionKey = `delete_${notificationId}`;
    if (state.pendingActions.has(actionKey)) {
      console.log('⚠️ Delete already pending for', notificationId);
      return;
    }
    
    // Add to pending actions
    state.pendingActions.set(actionKey, true);
    
    // Send to backend via WebSocket
    state.sendMessage('DELETE', notificationId);
    
    // Update local state immediately
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    });
    
    // Clear pending after delay
    setTimeout(() => {
      get().pendingActions.delete(actionKey);
    }, 1000);
  },

  setConnected: (connected) => set({ isConnected: connected }),

  // WebSocket Methods
  connect: (token) => {
    const state = get();
    
    if (state.ws?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    const wsUrl = `ws://localhost:8080/ws/notifications?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('✅ Notification WebSocket connected');
      set({ 
        isConnected: true, 
        reconnectAttempts: 0,
        ws 
      });
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('📨 Received:', message);

        switch (message.type) {
          case 'CONNECTED':
            console.log('🎉 Welcome message received');
            break;

          case 'INITIAL_NOTIFICATIONS':
            // Only update if we don't have notifications yet or if data is different
            const currentState = get();
            const newNotifications = message.payload.notifications || [];
            const newUnreadCount = message.payload.unreadCount || 0;
            
            // Prevent unnecessary updates that cause reconnections
            if (currentState.notifications.length === 0 || 
                currentState.unreadCount !== newUnreadCount) {
              set({
                notifications: newNotifications,
                unreadCount: newUnreadCount
              });
            }
            break;

          case 'NEW_NOTIFICATION':
            get().addNotification(message.payload);
            break;

          case 'UNREAD_COUNT':
            // Only update if count actually changed
            if (get().unreadCount !== message.payload.count) {
              set({ unreadCount: message.payload.count });
            }
            break;

          case 'ERROR':
            console.error('❌ WebSocket error:', message.payload.error);
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      set({ isConnected: false });
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason);
      set({ isConnected: false, ws: null });
      
      const state = get();
      
      // Don't reconnect if it was an intentional close
      if (state.isIntentionalClose) {
        console.log('⚠️ Intentional close, not reconnecting');
        set({ isIntentionalClose: false, reconnectAttempts: 0 });
        return;
      }
      
      // Only reconnect for unexpected disconnections
      if (state.reconnectAttempts < state.maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, state.reconnectAttempts), 30000);
        console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${state.reconnectAttempts + 1})`);
        
        const timeout = setTimeout(() => {
          set({ reconnectAttempts: state.reconnectAttempts + 1 });
          get().connect(token);
        }, delay);
        
        set({ reconnectTimeout: timeout });
      } else {
        console.error('❌ Max reconnection attempts reached');
      }
    };
  },

  disconnect: () => {
    const state = get();
    
    // Mark as intentional close to prevent reconnection
    set({ isIntentionalClose: true });
    
    if (state.reconnectTimeout) {
      clearTimeout(state.reconnectTimeout);
    }
    
    if (state.ws) {
      state.ws.close();
      set({ 
        ws: null, 
        isConnected: false, 
        reconnectAttempts: 0,
        reconnectTimeout: null 
      });
    }
  },

  // Send WebSocket messages
  sendMessage: (type, payload) => {
    const ws = get().ws;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('⚠️ WebSocket not connected');
    }
  }
}));

export default useNotificationStore;
