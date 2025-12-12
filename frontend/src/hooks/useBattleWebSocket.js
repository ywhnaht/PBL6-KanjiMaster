import { useEffect, useCallback, useRef } from 'react';
import { useBattleStore } from '../store/useBattleStore';
import { getBattleToken } from '../apis/battle';
import useAxiosPrivate from './useAxiosPrivate';

/**
 * Custom hook to manage Battle WebSocket connection
 * Uses useAxiosPrivate for automatic token management
 */
export const useBattleWebSocket = () => {
  const axiosPrivate = useAxiosPrivate();
  const tokenRefreshTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const wsRef = useRef(null);
  const maxReconnectAttempts = 3;

  const {
    ws,
    setWs,
    setIsConnected,
    setIsConnecting,
    setBattleToken,
    reset,
  } = useBattleStore();

  /**
   * Connect to battle WebSocket server
   */
  const connect = useCallback(async () => {
    // Prevent multiple connections
    if (ws && ws.readyState === WebSocket.OPEN) {
      console.log('⚠️ Already connected, skipping...');
      return ws;
    }
    
    if (ws && ws.readyState === WebSocket.CONNECTING) {
      console.log('⚠️ Already connecting, skipping...');
      return;
    }
    
    try {
      setIsConnecting(true);

      // Get battle token using axiosPrivate (with interceptors)
      const response = await getBattleToken(axiosPrivate);
      const token = response.data.token;
      setBattleToken(token);

      // Create WebSocket connection
      const websocket = new WebSocket(`ws://localhost:8080/ws/battle?token=${token}`);
      wsRef.current = websocket;

      websocket.onopen = () => {
        console.log('✅ Battle WebSocket connected');
        setWs(websocket);
        setIsConnected(true);
        setIsConnecting(false);
        reconnectAttemptsRef.current = 0;
        
        // Start refresh timer - inline to avoid circular dependency
        if (tokenRefreshTimerRef.current) {
          clearInterval(tokenRefreshTimerRef.current);
        }
        tokenRefreshTimerRef.current = setInterval(async () => {
          try {
            console.log('🔄 Refreshing battle token...');
            const res = await getBattleToken(axiosPrivate);
            const newToken = res.data.token;
            setBattleToken(newToken);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({
                type: 'REFRESH_TOKEN',
                payload: newToken
              }));
              console.log('✅ Battle token refreshed');
            }
          } catch (error) {
            console.error('❌ Failed to refresh battle token:', error);
          }
        }, 25 * 60 * 1000);
      };

      websocket.onerror = (error) => {
        console.error('❌ Battle WebSocket error:', error);
        setIsConnecting(false);
      };

      websocket.onclose = (event) => {
        console.log('🔌 Battle WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Stop refresh timer
        if (tokenRefreshTimerRef.current) {
          clearInterval(tokenRefreshTimerRef.current);
          tokenRefreshTimerRef.current = null;
        }

        // Auto reconnect if not intentional close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          setTimeout(() => connect(), 2000);
        }
      };

      return websocket;

    } catch (error) {
      console.error('Failed to connect battle WebSocket:', error);
      setIsConnecting(false);
      throw error;
    }
  }, [axiosPrivate, setBattleToken, setWs, setIsConnected, setIsConnecting]);

  /**
   * Send message to WebSocket
   */
  const send = useCallback((message) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      console.log('📤 Sent:', message.type);
    } else {
      console.warn('⚠️ WebSocket not connected');
    }
  }, [ws]);

  /**
   * Join matchmaking queue
   */
  const joinQueue = useCallback((level) => {
    send({
      type: 'JOIN_QUEUE',
      payload: { level }
    });
  }, [send]);

  /**
   * Leave matchmaking queue
   */
  const leaveQueue = useCallback(() => {
    send({
      type: 'LEAVE_QUEUE',
      payload: null
    });
  }, [send]);

  /**
   * Mark player as ready
   */
  const ready = useCallback(() => {
    send({
      type: 'READY',
      payload: null
    });
  }, [send]);

  /**
   * Submit answer
   */
  const answerQuestion = useCallback((questionIndex, answerIndex, answerTime) => {
    send({
      type: 'ANSWER_QUESTION',
      payload: {
        questionIndex,
        answerIndex,
        answerTime
      }
    });
  }, [send]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (tokenRefreshTimerRef.current) {
      clearInterval(tokenRefreshTimerRef.current);
      tokenRefreshTimerRef.current = null;
    }
    
    if (ws) {
      ws.close(1000, 'Client disconnect');
      setWs(null);
    }

    wsRef.current = null;
    setIsConnected(false);
    console.log('👋 Battle WebSocket disconnected');
  }, [ws, setWs, setIsConnected]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (tokenRefreshTimerRef.current) {
        clearInterval(tokenRefreshTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
      }
      reset();
    };
  }, []); // Empty deps - only cleanup on unmount

  return {
    // Connection
    connect,
    disconnect,
    
    // Actions
    joinQueue,
    leaveQueue,
    ready,
    answerQuestion,
    send,
    
    // WebSocket instance (for message handlers)
    ws,
  };
};

