export const getLeaderboard = (axiosPrivate, limit = 50) => {
  return axiosPrivate.get(`/api/battle/leaderboard?limit=${limit}`);
};

export const getBattleHistory = (axiosPrivate) => {
  return axiosPrivate.get(`/api/battle/history`);
};

export const getBattleStats = (axiosPrivate) => {
  return axiosPrivate.get(`/api/battle/stats`);
};
