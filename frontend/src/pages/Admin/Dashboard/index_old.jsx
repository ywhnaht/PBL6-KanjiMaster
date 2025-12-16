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
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-white/80">Tổng quan hệ thống KanjiMaster</p>
        </div>

        {/* Stats Cards */}
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
            value={stats?.totalCompounds || 0}
            subtitle="Từ ghép trong hệ thống"
            color="green"
          />
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">admin_panel_settings</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quản trị viên</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl border border-rose-200">
                <span className="text-gray-700 font-medium">Số Admin</span>
                <span className="text-2xl font-bold text-rose-600">{stats?.adminUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                <span className="text-gray-700 font-medium">Số User thường</span>
                <span className="text-2xl font-bold text-blue-600">{stats?.regularUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">verified_user</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Xác thực</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span className="text-gray-700 font-medium">Đã xác thực</span>
                <span className="text-2xl font-bold text-green-600">{stats?.verifiedUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <span className="text-gray-700 font-medium">Chưa xác thực</span>
                <span className="text-2xl font-bold text-orange-600">{stats?.unverifiedUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">monitoring</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Hệ thống</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
                <span className="text-gray-700 font-medium">Trạng thái</span>
                <span className="font-bold text-green-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <span className="text-gray-700 font-medium">Phiên bản</span>
                <span className="font-bold text-slate-600">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-rose-500 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">bolt</span>
            Thao tác nhanh
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/users"
              className="block p-4 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all duration-200"
            >
              <span className="material-symbols-outlined text-5xl mb-2 text-blue-600">group</span>
              <p className="font-semibold text-rose-500">Quản lý Users</p>
            </a>
            
            <a
              href="/admin/kanji"
              className="block p-4 bg-gradient-to-br from-slate-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl transition-all duration-200"
            >
              <span className="material-symbols-outlined text-5xl mb-2 text-slate-500">translate</span>
              <p className="font-semibold text-rose-500">Quản lý Kanji</p>
            </a>
            
            <a
              href="/admin/compounds"
              className="block p-4 bg-gradient-to-br from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-200 rounded-xl transition-all duration-200"
            >
              <span className="material-symbols-outlined text-5xl mb-2 text-pink-600">menu_book</span>
              <p className="font-semibold text-rose-500">Quản lý Compounds</p>
            </a>
            
            <a
              href="/home"
              className="block p-4 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all duration-200"
            >
              <span className="material-symbols-outlined text-5xl mb-2 text-green-600">home</span>
              <p className="font-semibold text-rose-500">Về trang chính</p>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
