import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import StatsCard from '../../../components/Admin/StatsCard';
import { getDashboardStats } from '../../../apis/admin';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getDashboardStats(axiosPrivate);
      console.log('Dashboard stats response:', response);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 text-lg">Đang tải thống kê...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-red-600">error</span>
            <div>
              <h3 className="text-red-800 font-bold text-lg">Lỗi</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchDashboardStats}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">refresh</span>
            Thử lại
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-500 to-rose-400 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl">dashboard</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Dashboard Admin</h1>
              <p className="text-white/90">Tổng quan hệ thống KanjiMaster</p>
            </div>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            icon="group"
            title="Tổng người dùng"
            value={stats?.totalUsers || 0}
            subtitle={`${stats?.verifiedUsers || 0} đã xác thực`}
            color="blue"
          />
          
          <StatsCard
            icon="block"
            title="Người dùng bị chặn"
            value={stats?.bannedUsers || 0}
            subtitle="Tài khoản bị khóa"
            color="red"
          />
          
          <StatsCard
            icon="translate"
            title="Tổng Kanji"
            value={stats?.totalKanji || 0}
            subtitle="Chữ Hán trong hệ thống"
            color="purple"
          />
          
          <StatsCard
            icon="menu_book"
            title="Tổng Compounds"
            value={stats?.totalCompoundWords || 0}
            subtitle="Từ ghép trong hệ thống"
            color="green"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-orange-600">quiz</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng Quiz</p>
                <p className="text-2xl font-bold text-orange-600">{(stats?.totalQuizzes || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-pink-600">swords</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Tổng Battles</p>
                <p className="text-2xl font-bold text-pink-600">{(stats?.totalBattles || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-teal-600">trending_up</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">User tuần này</p>
                <p className="text-2xl font-bold text-teal-600">{(stats?.newUsersThisWeek || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-cyan-600">calendar_month</span>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">User tháng này</p>
                <p className="text-2xl font-bold text-cyan-600">{(stats?.newUsersThisMonth || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Phân quyền</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg border border-rose-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600">shield_person</span>
                  <span className="text-gray-700 font-medium">Quản trị viên</span>
                </div>
                <span className="text-2xl font-bold text-rose-600">{(stats?.adminUsers || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">person</span>
                  <span className="text-gray-700 font-medium">Người dùng thường</span>
                </div>
                <span className="text-2xl font-bold text-blue-600">{(stats?.regularUsers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Trạng thái xác thực</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  <span className="text-gray-700 font-medium">Đã xác thực</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{(stats?.verifiedUsers || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600">pending</span>
                  <span className="text-gray-700 font-medium">Chưa xác thực</span>
                </div>
                <span className="text-2xl font-bold text-orange-600">{(stats?.unverifiedUsers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl text-slate-500">bolt</span>
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">group</span>
              </div>
              <p className="font-semibold text-blue-700">Quản lý Users</p>
            </a>
            
            <a
              href="/admin/kanji"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">translate</span>
              </div>
              <p className="font-semibold text-purple-700">Quản lý Kanji</p>
            </a>
            
            <a
              href="/admin/compounds"
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-white">menu_book</span>
              </div>
              <p className="font-semibold text-green-700">Quản lý Compounds</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
