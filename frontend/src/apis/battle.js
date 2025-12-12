
/**
 * Battle API calls
 */

/**
 * Get battle token for WebSocket connection
 */
export const getBattleToken = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/battle/token');
  return response.data;
};

/**
 * Revoke battle token
 */
export const revokeBattleToken = async (axiosPrivate) => {
  const response = await axiosPrivate.delete('/api/battle/token');
  return response.data;
};

/**
 * Get battle history for current user
 */
export const getBattleHistory = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/battle/history');
  return response.data;
};

/**
 * Get battle statistics
 */
export const getBattleStats = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/battle/stats');
  return response.data;
};

/**
 * Get current queue status
 */
export const getQueueStatus = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/battle/queue/status');
  return response.data;
};

/**
 * Get user battle status (in queue or in battle)
 */
export const getUserBattleStatus = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/battle/status');
  return response.data;
};

/**
 * Get battle leaderboard
 */
export const getBattleLeaderboard = async (axiosPrivate, limit = 10) => {
  const response = await axiosPrivate.get(`/api/battle/leaderboard?limit=${limit}`);
  return response.data;
};

