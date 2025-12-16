import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import useNotificationStore from '../store/useNotificationStore';

const useNotificationWebSocket = () => {
  const { accessToken, user } = useAuthStore();
  const connectAttempted = useRef(false);
  const currentToken = useRef(null);

  useEffect(() => {
    // Only connect if we have auth and haven't connected with this token yet
    if (accessToken && user && currentToken.current !== accessToken) {
      console.log('🔌 Connecting to notification WebSocket...');
      
      const { connect, disconnect, ws, updateToken } = useNotificationStore.getState();
      
      // Update token in store
      updateToken(accessToken);
      
      // Check if already connected with a valid WebSocket
      if (ws?.readyState === WebSocket.OPEN) {
        console.log('⚠️ WebSocket already connected, skipping...');
        currentToken.current = accessToken;
        return;
      }

      connectAttempted.current = true;
      currentToken.current = accessToken;
      connect(accessToken);

      return () => {
        // Only disconnect if token changed or user logged out
        if (!accessToken || !user) {
          console.log('🔌 Disconnecting notification WebSocket...');
          disconnect();
          connectAttempted.current = false;
          currentToken.current = null;
        }
      };
    }
    
    // Cleanup on logout
    if (!accessToken || !user) {
      if (connectAttempted.current) {
        console.log('🔌 User logged out, disconnecting...');
        const { disconnect } = useNotificationStore.getState();
        disconnect();
        connectAttempted.current = false;
        currentToken.current = null;
      }
    }
  }, [accessToken, user]); // Only depend on auth state
};

export default useNotificationWebSocket;
