import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { getBattleHistory, getBattleStats } from '../../services/battleService';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import Toast from '../../components/Toast';
import LoginModal from '../../components/Login';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { motion } from 'framer-motion';

export default function BattleHistoryPage() {
  const { user } = useAuthStore();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [historyRes, statsRes] = await Promise.all([
        getBattleHistory(axiosPrivate),
        getBattleStats(axiosPrivate)
      ]);
      
      setHistory(historyRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error fetching battle history:', error);
      setToast({ message: 'Không thể tải lịch sử đấu', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  const getResultBadge = (battle) => {
    // Check draw first (winner is null)
    if (battle.draw) {
      return { text: 'Hòa', color: 'bg-gray-100 text-gray-700' };
    }
    // Check winner flag from backend (this is the source of truth)
    if (battle.winner) {
      return { text: 'Thắng', color: 'bg-green-100 text-green-700' };
    }
    // If not draw and not winner, then it's a loss
    return { text: 'Thua', color: 'bg-red-100 text-red-700' };
  };
  
  // Pagination calculations
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Login required screen
  if (!user) {
    return (
      <>
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <div className="inline-block p-6 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] rounded-3xl shadow-2xl mb-6">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>
                      history
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                    Lịch Sử Đấu
                  </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#2F4454]/10 to-[#DA7B93]/10 mb-4">
                    <span className="material-symbols-outlined text-[#DA7B93] text-5xl">lock</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-[#2F4454]">Đăng Nhập Để Xem Lịch Sử</h2>
                  <p className="text-gray-600 mb-6">Đăng nhập để xem lịch sử các trận đấu của bạn!</p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold hover:shadow-xl transition-all"
                  >
                    Đăng Nhập
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>

        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header with Back Button */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/battle')}
                className="flex items-center gap-2 text-[#2F4454] hover:text-[#DA7B93] transition-colors mb-4"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span className="font-semibold">Trở lại Battle</span>
              </button>
              
              <div className="text-center">
                <div className="inline-block p-6 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] rounded-3xl shadow-2xl mb-6">
                  <span className="material-symbols-outlined text-white" style={{ fontSize: '64px' }}>
                    history
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent">
                  Lịch Sử Đấu
                </h1>
                <p className="text-lg text-gray-600">
                  Xem lại các trận đấu của bạn
                </p>
              </div>
            </div>

            {/* Stats Overview */}
            {stats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
              >
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-[#2F4454]">
                  <p className="text-sm text-gray-600 mb-1">Tổng trận</p>
                  <p className="text-2xl font-bold text-[#2F4454]">{stats.totalBattles}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Thắng</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalWins}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-600 mb-1">Thua</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalLosses}</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-[#DA7B93]">
                  <p className="text-sm text-gray-600 mb-1">Tỉ lệ thắng</p>
                  <p className="text-2xl font-bold text-[#DA7B93]">{stats.winRate}%</p>
                </div>
              </motion.div>
            )}

            {/* History List */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-12 h-12 border-4 border-[#DA7B93] border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải...</p>
                </div>
              ) : !history || history.length === 0 ? (
                <div className="p-12 text-center">
                  <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">
                    history
                  </span>
                  <p className="text-gray-600">Chưa có lịch sử đấu</p>
                  <p className="text-sm text-gray-500 mt-2">Tham gia Battle Mode để bắt đầu!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Kết quả</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Đối thủ</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Level</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Điểm số</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentHistory.map((battle, index) => {
                        const badge = getResultBadge(battle);
                        
                        return (
                          <motion.tr
                            key={battle.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                                {badge.text}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-[#2F4454]">{battle.opponentName}</p>
                              <p className="text-xs text-gray-500">{battle.opponentEmail}</p>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-lg text-sm font-bold">
                                {battle.level}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="font-bold text-[#2F4454]">
                                {battle.myScore}
                              </span>
                              <span className="text-gray-400 mx-1">-</span>
                              <span className="font-bold text-gray-600">
                                {battle.opponentScore}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center text-sm text-gray-600">
                              {formatDate(battle.completedAt)}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, history.length)} / {history.length} trận đấu
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        
                        {[...Array(totalPages)].map((_, idx) => {
                          const page = idx + 1;
                          // Show first, last, current, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => goToPage(page)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}
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
