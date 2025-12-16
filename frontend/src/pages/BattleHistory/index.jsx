import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import useDarkModeStore from '../../store/useDarkModeStore';
import { getBattleHistory, getBattleStats } from '../../services/battleService';
import Sidebar from '../../layouts/Sidebar';
import Header from '../../layouts/Header';
import Toast from '../../components/Toast';
import LoginModal from '../../components/Login';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function BattleHistoryPage() {
  const { user } = useAuthStore();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const isDark = useDarkModeStore((state) => state.isDark);
  
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
      return { 
        text: 'Hòa', 
        color: isDark 
          ? 'bg-slate-700 text-slate-200' 
          : 'bg-gray-100 text-gray-700' 
      };
    }
    // Check winner flag from backend (this is the source of truth)
    if (battle.winner) {
      return { 
        text: 'Thắng', 
        color: isDark 
          ? 'bg-green-900/30 text-green-300' 
          : 'bg-green-100 text-green-700' 
      };
    }
    // If not draw and not winner, then it's a loss
    return { 
      text: 'Thua', 
      color: isDark 
        ? 'bg-red-900/30 text-red-300' 
        : 'bg-red-100 text-red-700' 
    };
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
        <div className={`flex h-screen transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
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

                <div className={`rounded-2xl shadow-2xl p-8 md:p-12 text-center transition-colors duration-300 ${
                  isDark
                    ? 'bg-slate-800 border border-slate-700'
                    : 'bg-white'
                }`}>
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-colors duration-300 ${
                    isDark
                      ? 'bg-rose-900/30'
                      : 'bg-gradient-to-br from-[#2F4454]/10 to-[#DA7B93]/10'
                  }`}>
                    <span className={`material-symbols-outlined text-5xl transition-colors duration-300 ${
                      isDark ? 'text-rose-400' : 'text-[#DA7B93]'
                    }`}>
                      lock
                    </span>
                  </div>
                  <h2 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                    isDark ? 'text-slate-100' : 'text-[#2F4454]'
                  }`}>
                    Đăng Nhập Để Xem Lịch Sử
                  </h2>
                  <p className={`mb-6 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Đăng nhập để xem lịch sử các trận đấu của bạn!
                  </p>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-8 py-3 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
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
    <div className={`flex h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
        : 'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header with Back Button */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/battle')}
                className={`flex items-center gap-2 transition-colors duration-300 mb-4 ${
                  isDark
                    ? 'text-rose-400 hover:text-rose-300'
                    : 'text-[#2F4454] hover:text-[#DA7B93]'
                }`}
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
                <p className={`text-lg transition-colors duration-300 ${
                  isDark ? 'text-slate-400' : 'text-gray-600'
                }`}>
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
                <div className={`rounded-xl shadow-md p-4 border-l-4 transition-colors duration-300 ${
                  isDark
                    ? 'bg-slate-800 border-l-rose-400'
                    : 'bg-white border-l-[#2F4454]'
                }`}>
                  <p className={`text-sm mb-1 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Tổng trận
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-rose-400' : 'text-[#2F4454]'
                  }`}>
                    {stats.totalBattles}
                  </p>
                </div>
                <div className={`rounded-xl shadow-md p-4 border-l-4 transition-colors duration-300 ${
                  isDark
                    ? 'bg-slate-800 border-l-green-400'
                    : 'bg-white border-l-green-500'
                }`}>
                  <p className={`text-sm mb-1 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Thắng
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    {stats.totalWins}
                  </p>
                </div>
                <div className={`rounded-xl shadow-md p-4 border-l-4 transition-colors duration-300 ${
                  isDark
                    ? 'bg-slate-800 border-l-red-400'
                    : 'bg-white border-l-red-500'
                }`}>
                  <p className={`text-sm mb-1 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Thua
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-red-400' : 'text-red-600'
                  }`}>
                    {stats.totalLosses}
                  </p>
                </div>
                <div className={`rounded-xl shadow-md p-4 border-l-4 transition-colors duration-300 ${
                  isDark
                    ? 'bg-slate-800 border-l-rose-500'
                    : 'bg-white border-l-[#DA7B93]'
                }`}>
                  <p className={`text-sm mb-1 transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Tỉ lệ thắng
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-rose-400' : 'text-[#DA7B93]'
                  }`}>
                    {stats.winRate}%
                  </p>
                </div>
              </motion.div>
            )}

            {/* History List */}
            <div className={`rounded-2xl shadow-xl overflow-hidden transition-colors duration-300 ${
              isDark
                ? 'bg-slate-800 border border-slate-700'
                : 'bg-white'
            }`}>
              {loading ? (
                <div className="p-12 text-center">
                  <div className={`animate-spin w-12 h-12 border-4 border-[#DA7B93] border-t-transparent rounded-full mx-auto mb-4 transition-colors duration-300 ${
                    isDark ? 'border-slate-600' : 'border-gray-200'
                  }`}></div>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Đang tải...
                  </p>
                </div>
              ) : !history || history.length === 0 ? (
                <div className="p-12 text-center">
                  <span className={`material-symbols-outlined text-6xl mb-4 transition-colors duration-300 ${
                    isDark ? 'text-slate-600' : 'text-gray-400'
                  }`}>
                    history
                  </span>
                  <p className={`transition-colors duration-300 ${
                    isDark ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    Chưa có lịch sử đấu
                  </p>
                  <p className={`text-sm mt-2 transition-colors duration-300 ${
                    isDark ? 'text-slate-500' : 'text-gray-500'
                  }`}>
                    Tham gia Battle Mode để bắt đầu!
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white transition-colors duration-300">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Kết quả</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Đối thủ</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Level</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Điểm số</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Thời gian</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y transition-colors duration-300 ${
                      isDark ? 'divide-slate-700' : 'divide-gray-200'
                    }`}>
                      {currentHistory.map((battle, index) => {
                        const badge = getResultBadge(battle);
                        
                        return (
                          <motion.tr
                            key={battle.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={`transition-colors duration-300 ${
                              isDark
                                ? 'hover:bg-slate-700'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className="px-4 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${badge.color}`}>
                                {badge.text}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className={`font-semibold transition-colors duration-300 ${
                                isDark ? 'text-rose-400' : 'text-[#2F4454]'
                              }`}>
                                {battle.opponentName}
                              </p>
                              <p className={`text-xs transition-colors duration-300 ${
                                isDark ? 'text-slate-500' : 'text-gray-500'
                              }`}>
                                {battle.opponentEmail}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-lg text-sm font-bold transition-colors duration-300">
                                {battle.level}
                              </span>
                            </td>
                            <td className={`px-4 py-4 text-center transition-colors duration-300 ${
                              isDark ? 'text-slate-100' : 'text-gray-900'
                            }`}>
                              <span className={`font-bold transition-colors duration-300 ${
                                isDark ? 'text-rose-400' : 'text-[#2F4454]'
                              }`}>
                                {battle.myScore}
                              </span>
                              <span className={`mx-1 transition-colors duration-300 ${
                                isDark ? 'text-slate-500' : 'text-gray-400'
                              }`}>
                                -
                              </span>
                              <span className={`font-bold transition-colors duration-300 ${
                                isDark ? 'text-slate-400' : 'text-gray-600'
                              }`}>
                                {battle.opponentScore}
                              </span>
                            </td>
                            <td className={`px-4 py-4 text-center text-sm transition-colors duration-300 ${
                              isDark ? 'text-slate-400' : 'text-gray-600'
                            }`}>
                              {formatDate(battle.completedAt)}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={`flex items-center justify-between px-6 py-4 border-t transition-colors duration-300 ${
                      isDark
                        ? 'border-slate-700'
                        : 'border-gray-200'
                    }`}>
                      <div className={`text-sm transition-colors duration-300 ${
                        isDark ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        Hiển thị {startIndex + 1}-{Math.min(endIndex, history.length)} / {history.length} trận đấu
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-slate-600 hover:bg-slate-700 text-slate-100'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
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
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white'
                                    : isDark
                                    ? 'border border-slate-600 hover:bg-slate-700 text-slate-100'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span 
                                key={page} 
                                className={`px-2 transition-colors duration-300 ${
                                  isDark ? 'text-slate-500' : 'text-gray-400'
                                }`}
                              >
                                ...
                              </span>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-slate-600 hover:bg-slate-700 text-slate-100'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
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