import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { getLeaderboard, getBattleStats } from '../../services/battleService';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import Toast from '../../components/Toast';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const axiosPrivate = useAxiosPrivate();
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedLimit, setSelectedLimit] = useState(50);

  useEffect(() => {
    fetchData();
  }, [selectedLimit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leaderboardRes, statsRes] = await Promise.all([
        getLeaderboard(axiosPrivate, selectedLimit),
        user ? getBattleStats(axiosPrivate) : Promise.resolve(null)
      ]);
      
      setLeaderboard(leaderboardRes.data.data);
      if (statsRes) {
        setMyStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setToast({ message: 'Không thể tải bảng xếp hạng', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-600 bg-yellow-50' };
    if (rank === 2) return { icon: '🥈', color: 'text-gray-600 bg-gray-50' };
    if (rank === 3) return { icon: '🥉', color: 'text-orange-600 bg-orange-50' };
    return { icon: `#${rank}`, color: 'text-gray-700 bg-gray-100' };
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block p-6 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] rounded-3xl shadow-2xl mb-6">
                <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>
                  emoji_events
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                Bảng Xếp Hạng
              </h1>
              <p className="text-lg text-gray-600">
                Top chiến binh xuất sắc nhất trong Battle Mode
              </p>
            </div>

            {/* My Stats Card */}
            {user && myStats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] rounded-2xl shadow-xl p-6 mb-6 text-white"
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined">person</span>
                  Thống Kê Của Bạn
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <p className="text-sm opacity-80">Tổng trận</p>
                    <p className="text-2xl font-bold">{myStats.totalBattles}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <p className="text-sm opacity-80">Thắng</p>
                    <p className="text-2xl font-bold text-green-300">{myStats.totalWins}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <p className="text-sm opacity-80">Tỉ lệ thắng</p>
                    <p className="text-2xl font-bold">{myStats.winRate}%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                    <p className="text-sm opacity-80">Điểm cao nhất</p>
                    <p className="text-2xl font-bold text-yellow-300">{myStats.highestScore}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Filter */}
            <div className="flex justify-end mb-4">
              <select
                value={selectedLimit}
                onChange={(e) => setSelectedLimit(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA7B93]"
              >
                <option value={10}>Top 10</option>
                <option value={25}>Top 25</option>
                <option value={50}>Top 50</option>
                <option value={100}>Top 100</option>
              </select>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-[#DA7B93] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                    emoji_events
                  </span>
                  <p className="text-gray-600">Chưa có dữ liệu xếp hạng</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Hạng</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Người chơi</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Tổng trận</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Thắng</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Tỉ lệ thắng</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">Tổng điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaderboard.map((entry) => {
                        const badge = getRankBadge(entry.rank || 0);
                        const isCurrentUser = user && entry.userId === user.id;
                        
                        return (
                          <motion.tr
                            key={entry.userId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (entry.rank || 0) * 0.02 }}
                            className={`hover:bg-gray-50 transition-colors ${
                              isCurrentUser ? 'bg-blue-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${badge.color}`}>
                                {badge.icon}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-[#2F4454]">
                                  {entry.userName}
                                  {isCurrentUser && (
                                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">Bạn</span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">{entry.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-medium">{entry.totalBattles}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                {entry.totalWins}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`font-semibold ${
                                entry.winRate >= 70 ? 'text-green-600' :
                                entry.winRate >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {entry.winRate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-[#DA7B93]">
                              {(entry.totalScore || 0).toLocaleString()}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
