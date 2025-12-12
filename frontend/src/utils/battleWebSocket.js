import { getBattleToken } from '../apis/battle';
import { axiosPrivate } from '../apis/axios';

/**
 * Battle WebSocket Handler
 * Manages WebSocket connection for battle mode with automatic token refresh
 */
class BattleWebSocket {
  constructor() {
    this.ws = null;
    this.tokenRefreshTimer = null;
    this.battleToken = null;
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  /**
   * Connect to battle WebSocket server
   * Automatically fetches battle token and establishes connection
   */
  async connect() {
    try {
      // Get battle token from backend using axiosPrivate
      const response = await getBattleToken(axiosPrivate);
      this.battleToken = response.data.token;

      // Connect WebSocket with battle token
      this.ws = new WebSocket(`ws://localhost:8080/ws/battle?token=${this.battleToken}`);

      this.ws.onopen = () => {
        console.log('✅ Battle WebSocket connected');
        this.reconnectAttempts = 0;
        this.startTokenRefreshTimer();
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onerror = (error) => {
        console.error('❌ Battle WebSocket error:', error);
      };

      this.ws.onclose = (event) => {
        console.log('🔌 Battle WebSocket disconnected:', event.code, event.reason);
        this.stopTokenRefreshTimer();

        // Auto reconnect if not intentional close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          setTimeout(() => this.connect(), 2000);
        }
      };

    } catch (error) {
      console.error('Failed to connect battle WebSocket:', error);
      throw error;
    }
  }

  /**
   * Start timer to refresh battle token every 25 minutes
   * (5 minutes before expiration)
   */
  startTokenRefreshTimer() {
    this.tokenRefreshTimer = setInterval(async () => {
      await this.refreshBattleToken();
    }, 25 * 60 * 1000); // 25 minutes
  }

  /**
   * Stop token refresh timer
   */
  stopTokenRefreshTimer() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Refresh battle token and send to server
   */
  async refreshBattleToken() {
    try {
      console.log('🔄 Refreshing battle token...');

      // Get new battle token using axiosPrivate
      const response = await getBattleToken(axiosPrivate);
      this.battleToken = response.data.token;

      // Send new token to server
      this.send({
        type: 'REFRESH_TOKEN',
        payload: this.battleToken
      });

      console.log('✅ Battle token refreshed');

    } catch (error) {
      console.error('❌ Failed to refresh battle token:', error);
      // If refresh fails, disconnect and redirect to login
      this.disconnect();
      window.location.href = '/login';
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log('📤 Sent:', message.type);
    } else {
      console.warn('⚠️ WebSocket not connected. Cannot send message.');
    }
  }

  /**
   * Register message handler for specific message type
   */
  on(messageType, handler) {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Remove message handler
   */
  off(messageType) {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(message) {
    console.log('📥 Received:', message.type);

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.payload);
    } else {
      console.warn('⚠️ No handler for message type:', message.type);
    }

    // Handle errors
    if (message.type === 'ERROR') {
      console.error('❌ Server error:', message.payload);
    }
  }

  /**
   * Join matchmaking queue
   */
  joinQueue(level) {
    this.send({
      type: 'JOIN_QUEUE',
      payload: { level }
    });
  }

  /**
   * Leave matchmaking queue
   */
  leaveQueue() {
    this.send({
      type: 'LEAVE_QUEUE',
      payload: null
    });
  }

  /**
   * Mark player as ready
   */
  ready() {
    this.send({
      type: 'READY',
      payload: null
    });
  }

  /**
   * Submit answer to question
   */
  answerQuestion(questionIndex, answerIndex, answerTime) {
    this.send({
      type: 'ANSWER_QUESTION',
      payload: {
        questionIndex,
        answerIndex,
        answerTime
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.stopTokenRefreshTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.messageHandlers.clear();
    console.log('👋 Battle WebSocket disconnected');
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export default new BattleWebSocket();

