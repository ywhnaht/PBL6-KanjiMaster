import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import Pagination from '../../../components/Admin/Pagination';
import ConfirmDialog from '../../../components/Admin/ConfirmDialog';
import NotificationModal from '../../../components/Admin/NotificationModal';
import { getAllUsers, searchUsers, banUser, unbanUser, updateUserRole, deleteUser } from '../../../apis/admin';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers(axiosPrivate, currentPage, pageSize);
      let filteredUsers = response.data.items;
      
      // Apply role filter
      if (roleFilter !== 'ALL') {
        filteredUsers = filteredUsers.filter(user => 
          user.roles && user.roles.includes(roleFilter)
        );
      }
      
      setUsers(filteredUsers);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchUsers();
      return;
    }
    
    try {
      setLoading(true);
      const response = await searchUsers(axiosPrivate, searchKeyword, 0, pageSize);
      setUsers(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalItems);
      setCurrentPage(0);
    } catch (error) {
      console.error('Error searching users:', error);
      showNotification('error', 'Lỗi', 'Không thể tìm kiếm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    try {
      await banUser(axiosPrivate, selectedUser.id, { reason: banReason });
      showNotification('success', 'Thành công', `Đã chặn người dùng ${selectedUser.username}`);
      fetchUsers();
      setBanReason('');
    } catch (error) {
      console.error('Error banning user:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể chặn người dùng');
    }
  };

  const handleUnbanUser = async () => {
    try {
      await unbanUser(axiosPrivate, selectedUser.id);
      showNotification('success', 'Thành công', `Đã bỏ chặn người dùng ${selectedUser.username}`);
      fetchUsers();
    } catch (error) {
      console.error('Error unbanning user:', error);
      showNotification('error', 'Lỗi', 'Không thể bỏ chặn người dùng');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(axiosPrivate, selectedUser.id);
      showNotification('success', 'Thành công', `Đã xóa người dùng ${selectedUser.username}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'Lỗi', 'Không thể xóa người dùng');
    }
  };

  const handleUpdateRole = async () => {
    try {
      await updateUserRole(axiosPrivate, selectedUser.id, { role: selectedRole });
      showNotification('success', 'Thành công', `Đã cập nhật role cho ${selectedUser.username}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('error', 'Lỗi', 'Không thể cập nhật role');
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const columns = [
    {
      header: 'ID',
      field: 'id',
      render: (value) => <span className="font-mono text-xs text-gray-500">#{value?.substring(0, 8)}...</span>
    },
    {
      header: 'Tên',
      field: 'username',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt={value} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-rose-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {value?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      header: 'Email',
      field: 'email',
      render: (value) => <span className="text-blue-600">{value}</span>
    },
    {
      header: 'Role',
      field: 'roles',
      render: (roles) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          roles?.includes('ADMIN') 
            ? 'bg-rose-100 text-rose-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {Array.isArray(roles) ? roles.join(', ') : 'USER'}
        </span>
      )
    },
    {
      header: 'Điểm',
      field: 'totalPoints',
      render: (value) => <span className="font-semibold text-slate-600">{value || 0}</span>
    },
    {
      header: 'Trạng thái',
      field: 'verified',
      render: (value, row) => {
        const isBanned = row.banned;
        const isVerified = value;
        
        let statusConfig = {
          text: 'Hoạt động',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          clickable: true,
          action: 'ban'
        };
        
        if (isBanned) {
          statusConfig = {
            text: 'Đã bị chặn',
            bgColor: 'bg-red-100',
            textColor: 'text-red-700',
            clickable: true,
            action: 'unban'
          };
        } else if (!isVerified) {
          statusConfig = {
            text: 'Chưa xác thực',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-700',
            clickable: false,
            action: null
          };
        }
        
        return (
          <button
            onClick={() => {
              if (statusConfig.clickable) {
                if (statusConfig.action === 'ban') {
                  setSelectedUser(row);
                  setShowBanDialog(true);
                } else if (statusConfig.action === 'unban') {
                  setSelectedUser(row);
                  setShowUnbanDialog(true);
                }
              }
            }}
            disabled={!statusConfig.clickable}
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} ${
              statusConfig.clickable ? 'cursor-pointer hover:shadow-md transition-all' : 'cursor-default'
            }`}
          >
            {statusConfig.text}
          </button>
        );
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-500 to-rose-400 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Quản lý người dùng</h1>
          <p className="text-white/80">Danh sách và quản lý tất cả người dùng trong hệ thống</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm theo tên, email..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">search</span>
              Tìm kiếm
            </button>
            <button
              onClick={() => {
                setSearchKeyword('');
                setRoleFilter('ALL');
                fetchUsers();
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Reset
            </button>
          </div>
          
          {/* Role Filter */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">Lọc theo role:</span>
            {['ALL', 'USER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setRoleFilter(role);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  roleFilter === role
                    ? 'bg-gradient-to-r from-slate-500 to-rose-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role === 'ALL' ? 'Tất cả' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          onEdit={(user) => {
            setSelectedUser(user);
            setSelectedRole(user.roles?.[0] || 'USER');
            setShowRoleDialog(true);
          }}
          onDelete={(user) => {
            setSelectedUser(user);
            setShowDeleteDialog(true);
          }}
          emptyMessage="Không tìm thấy người dùng nào"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Ban Dialog */}
        <ConfirmDialog
          isOpen={showBanDialog}
          onClose={() => {
            setShowBanDialog(false);
            setBanReason('');
          }}
          onConfirm={handleBanUser}
          title="Chặn người dùng"
          type="danger"
          confirmText="Chặn"
          message={
            <div className="space-y-3">
              <p>Bạn có chắc muốn chặn người dùng <strong>{selectedUser?.username}</strong>?</p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Lý do chặn (không bắt buộc)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows="3"
              />
            </div>
          }
        />

        {/* Unban Dialog */}
        <ConfirmDialog
          isOpen={showUnbanDialog}
          onClose={() => setShowUnbanDialog(false)}
          onConfirm={handleUnbanUser}
          title="Bỏ chặn người dùng"
          type="info"
          confirmText="Bỏ chặn"
          message={`Bạn có chắc muốn bỏ chặn người dùng ${selectedUser?.username}?`}
        />

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteUser}
          title="Xóa người dùng"
          type="danger"
          confirmText="Xóa"
          message={`Bạn có chắc muốn xóa người dùng ${selectedUser?.username}? Hành động này không thể hoàn tác.`}
        />

        {/* Role Update Dialog */}
        {showRoleDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fade-in">
              <div className="p-6">
                <h3 className="text-xl font-bold text-[#2F4454] mb-4">Cập nhật Role</h3>
                <p className="text-gray-600 mb-4">
                  Chọn role cho người dùng: <strong>{selectedUser?.fullName}</strong>
                </p>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
                >
                  <option value="USER">USER - Người dùng thường</option>
                  <option value="ADMIN">ADMIN - Quản trị viên</option>
                </select>
              </div>
              
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => setShowRoleDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    handleUpdateRole();
                    setShowRoleDialog(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl transition-all duration-200"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        <NotificationModal
          isOpen={notification.isOpen}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => setNotification({ ...notification, isOpen: false })}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
