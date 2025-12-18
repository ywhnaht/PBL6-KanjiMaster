import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import Pagination from '../../../components/Admin/Pagination';
import ConfirmDialog from '../../../components/Admin/ConfirmDialog';
import NotificationModal from '../../../components/Admin/NotificationModal';
import ImportPreview from '../../../components/Admin/ImportPreview';
import { getAllCompounds, createCompound, updateCompound, deleteCompound, importCompoundsFromCsv } from '../../../apis/adminCompound';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useDarkModeStore from '../../../store/useDarkModeStore';

const AdminCompounds = () => {
  const [compounds, setCompounds] = useState([]);
  const [allFilteredCompounds, setAllFilteredCompounds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [searchKeyword, setSearchKeyword] = useState('');
  const isDark = useDarkModeStore((state) => state.isDark);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [selectedCompound, setSelectedCompound] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    reading: '',
    frequency: '',
    hiragana: '',
    example: '',
    exampleMeaning: ''
  });
  
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchCompounds();
  }, []);

  useEffect(() => {
    // Reset filtered data when keyword is cleared
    if (!searchKeyword.trim() && allFilteredCompounds.length > 0) {
      setAllFilteredCompounds([]);
      setCurrentPage(0);
      fetchCompounds();
      return;
    }
    
    // Handle pagination for filtered data
    if (allFilteredCompounds.length > 0) {
      const start = currentPage * pageSize;
      const end = start + pageSize;
      setCompounds(allFilteredCompounds.slice(start, end));
    } else {
      fetchCompounds();
    }
  }, [currentPage, searchKeyword]);

  const fetchCompounds = async () => {
    try {
      setLoading(true);
      const response = await getAllCompounds(axiosPrivate, currentPage, pageSize);
      
      // Support both response formats
      const items = response.data.items || response.data.content;
      const total = response.data.totalItems || response.data.totalElements;
      
      setCompounds(items);
      setTotalPages(response.data.totalPages);
      setTotalElements(total);
    } catch (error) {
      console.error('Error fetching compounds:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách Compound');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createCompound(axiosPrivate, formData);
      showNotification('success', 'Thành công', 'Đã thêm Compound mới');
      fetchCompounds();
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating compound:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo Compound');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCompound(axiosPrivate, selectedCompound.id, formData);
      showNotification('success', 'Thành công', 'Đã cập nhật Compound');
      fetchCompounds();
      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error updating compound:', error);
      showNotification('error', 'Lỗi', 'Không thể cập nhật Compound');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCompound(axiosPrivate, selectedCompound.id);
      showNotification('success', 'Thành công', `Đã xóa Compound ${selectedCompound.word}`);
      fetchCompounds();
    } catch (error) {
      console.error('Error deleting compound:', error);
      showNotification('error', 'Lỗi', 'Không thể xóa Compound');
    }
  };

  const handleCsvImport = async (file) => {
    try {
      setLoading(true);
      const result = await importCompoundsFromCsv(axiosPrivate, file);
      const data = result.data;
      
      let message = `Tổng ${data.totalRows} dòng:\n`;
      message += `✓ Thêm thành công: ${data.successCount}\n`;
      if (data.skipCount > 0) {
        message += `⊘ Bỏ qua (đã tồn tại): ${data.skipCount}\n`;
      }
      if (data.errorCount > 0) {
        message += `✗ Lỗi: ${data.errorCount}\n`;
      }
      
      // Show details
      if (data.skipped && data.skipped.length > 0) {
        message += `\nBỏ qua:\n${data.skipped.slice(0, 5).join('\n')}`;
        if (data.skipped.length > 5) message += `\n... và ${data.skipped.length - 5} dòng khác`;
      }
      if (data.errors && data.errors.length > 0) {
        message += `\nLỗi:\n${data.errors.slice(0, 5).join('\n')}`;
        if (data.errors.length > 5) message += `\n... và ${data.errors.length - 5} lỗi khác`;
      }
      
      const notifType = data.errorCount > 0 ? 'warning' : 'success';
      showNotification(notifType, 'Kết quả import', message);
      fetchCompounds();
    } catch (error) {
      console.error('Error importing CSV:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setAllFilteredCompounds([]);
      fetchCompounds();
      return;
    }

    const keyword = searchKeyword.toLowerCase().trim();
    setLoading(true);
    
    getAllCompounds(axiosPrivate, 0, 1000)
      .then(response => {
        const items = response.data.items || response.data.content;
        console.log('Search keyword:', keyword);
        console.log('Total items:', items.length);
        if (items.length > 0) console.log('Sample compound:', items[0]);
        
        // Apply search filter - search in all text fields
        const filtered = items.filter(c => {
          const searchableText = [
            c.word,
            c.meaning,
            c.reading,
            c.hiragana
          ].filter(Boolean).join(' ').toLowerCase();
          
          const match = searchableText.includes(keyword);
          return match;
        });
        
        console.log('Filtered results:', filtered.length);

        // Store all filtered data
        setAllFilteredCompounds(filtered);
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
        setCurrentPage(0);
        
        // Show first page
        setCompounds(filtered.slice(0, pageSize));
      })
      .catch(error => {
        console.error('Error searching:', error);
        showNotification('error', 'Lỗi', 'Không thể tìm kiếm');
      })
      .finally(() => setLoading(false));
  };

  const resetForm = () => {
    setFormData({
      word: '',
      meaning: '',
      reading: '',
      frequency: '',
      hiragana: '',
      example: '',
      exampleMeaning: ''
    });
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const columns = [
    {
      header: 'Từ',
      field: 'word',
      render: (value) => (
        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2F4454]'}`}>{value}</span>
      )
    },
    {
      header: 'Nghĩa',
      field: 'meaning',
      render: (value) => <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{value}</span>
    },
    {
      header: 'Đọc',
      field: 'reading',
      render: (value) => <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{value}</span>
    },
    {
      header: 'Hiragana',
      field: 'hiragana',
      render: (value) => <span className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{value}</span>
    },
    {
      header: 'Tần suất',
      field: 'frequency',
      render: (value) => (
        <span className="px-3 py-1 bg-rose-100 text-purple-700 rounded-full text-xs font-semibold">
          {value}
        </span>
      )
    }
  ];

  const CompoundFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Từ ghép *</label>
        <input
          type="text"
          value={formData.word}
          onChange={(e) => setFormData({ ...formData, word: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454] text-xl text-center"
          placeholder="漢字"
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Nghĩa *</label>
        <input
          type="text"
          value={formData.meaning}
          onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="chữ Hán"
        />
      </div>
      
      <div>
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Cách đọc *</label>
        <input
          type="text"
          value={formData.reading}
          onChange={(e) => setFormData({ ...formData, reading: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="かんじ"
        />
      </div>
      
      <div>
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Hiragana</label>
        <input
          type="text"
          value={formData.hiragana}
          onChange={(e) => setFormData({ ...formData, hiragana: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="かんじ"
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tần suất</label>
        <input
          type="number"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="1000"
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Ví dụ</label>
        <input
          type="text"
          value={formData.example}
          onChange={(e) => setFormData({ ...formData, example: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="漢字を勉強する"
        />
      </div>
      
      <div className="col-span-2">
        <label className={`block text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Nghĩa ví dụ</label>
        <input
          type="text"
          value={formData.exampleMeaning}
          onChange={(e) => setFormData({ ...formData, exampleMeaning: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="học chữ Hán"
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-500 to-rose-400 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Quản lý Compound Words</h1>
          <p className="text-white/80">CRUD và Import CSV cho từ ghép</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm Compound mới
          </button>
          
          <button
            onClick={() => setShowImportPreview(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            disabled={loading}
          >
            <span className="material-symbols-outlined">upload_file</span>
            Import CSV
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-6`}>
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm theo từ, nghĩa, cách đọc, hiragana..."
              className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
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
                fetchCompounds();
              }}
              className={`px-6 py-3 font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <span className="material-symbols-outlined">refresh</span>
              Reset
            </button>
          </div>
        </div>

        {/* Compounds Table */}
        <DataTable
          columns={columns}
          data={compounds}
          loading={loading}
          onEdit={(compound) => {
            setSelectedCompound(compound);
            setFormData(compound);
            setShowEditDialog(true);
          }}
          onDelete={(compound) => {
            setSelectedCompound(compound);
            setShowDeleteDialog(true);
          }}
          emptyMessage="Chưa có Compound nào"
        />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Create Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-fade-in`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2F4454]'}`}>Thêm Compound mới</h3>
              </div>
              <div className="p-6">
                <CompoundFormFields />
              </div>
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Tạo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        {showEditDialog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-fade-in`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#2F4454]'}`}>Chỉnh sửa Compound</h3>
              </div>
              <div className="p-6">
                <CompoundFormFields />
              </div>
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                  }}
                  className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-colors ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDelete}
          title="Xóa Compound"
          type="danger"
          confirmText="Xóa"
          message={`Bạn có chắc muốn xóa Compound "${selectedCompound?.word}" (${selectedCompound?.meaning})?`}
        />

        {/* Import Preview Dialog */}
        {showImportPreview && (
          <ImportPreview
            type="compound"
            onConfirm={(file) => {
              setShowImportPreview(false);
              handleCsvImport(file);
            }}
            onCancel={() => setShowImportPreview(false)}
          />
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

export default AdminCompounds;
