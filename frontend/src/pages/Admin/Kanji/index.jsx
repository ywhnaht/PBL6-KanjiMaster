import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import DataTable from '../../../components/Admin/DataTable';
import Pagination from '../../../components/Admin/Pagination';
import ConfirmDialog from '../../../components/Admin/ConfirmDialog';
import NotificationModal from '../../../components/Admin/NotificationModal';
import CsvUploadButton from '../../../components/Admin/CsvUploadButton';
import ImportPreview from '../../../components/Admin/ImportPreview';
import { getAllKanji, createKanji, updateKanji, deleteKanji, importKanjiFromCsv } from '../../../apis/adminKanji';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';

const AdminKanji = () => {
  const [kanjis, setKanjis] = useState([]);
  const [allFilteredKanjis, setAllFilteredKanjis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState(null);
  const [formData, setFormData] = useState({
    kanji: '',
    hanViet: '',
    joyoReading: '',
    kunyomi: '',
    onyomi: '',
    level: '',
    radical: '',
    strokes: '',
    svgLink: ''
  });
  
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (levelFilter === 'ALL' && !searchKeyword.trim()) {
      setAllFilteredKanjis([]);
      fetchKanjis();
    } else {
      handleSearch();
    }
  }, [levelFilter]);

  useEffect(() => {
    // Handle pagination for filtered data
    if (allFilteredKanjis.length > 0) {
      const start = currentPage * pageSize;
      const end = start + pageSize;
      setKanjis(allFilteredKanjis.slice(start, end));
    } else if (levelFilter === 'ALL' && !searchKeyword.trim()) {
      // Fetch from backend when no filter
      fetchKanjis();
    }
  }, [currentPage]);

  const fetchKanjis = async () => {
    try {
      setLoading(true);
      const response = await getAllKanji(axiosPrivate, currentPage, pageSize);
      const items = response.data.items || response.data.content || [];
      
      setKanjis(items);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalItems || response.data.totalElements);
    } catch (error) {
      console.error('Error fetching kanjis:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách Kanji');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createKanji(axiosPrivate, formData);
      showNotification('success', 'Thành công', 'Đã thêm Kanji mới');
      fetchKanjis();
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error creating kanji:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể tạo Kanji');
    }
  };

  const handleUpdate = async () => {
    try {
      await updateKanji(axiosPrivate, selectedKanji.id, formData);
      showNotification('success', 'Thành công', 'Đã cập nhật Kanji');
      fetchKanjis();
      setShowEditDialog(false);
      resetForm();
    } catch (error) {
      console.error('Error updating kanji:', error);
      showNotification('error', 'Lỗi', 'Không thể cập nhật Kanji');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteKanji(axiosPrivate, selectedKanji.id);
      showNotification('success', 'Thành công', `Đã xóa Kanji ${selectedKanji.kanji}`);
      fetchKanjis();
    } catch (error) {
      console.error('Error deleting kanji:', error);
      showNotification('error', 'Lỗi', 'Không thể xóa Kanji');
    }
  };

  const handleCsvImport = async (file) => {
    try {
      setLoading(true);
      const result = await importKanjiFromCsv(axiosPrivate, file);
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
      fetchKanjis();
    } catch (error) {
      console.error('Error importing CSV:', error);
      showNotification('error', 'Lỗi import', error.response?.data?.message || 'Không thể import CSV');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim() && levelFilter === 'ALL') {
      setAllFilteredKanjis([]);
      fetchKanjis();
      return;
    }
    
    try {
      setLoading(true);
      const response = await getAllKanji(axiosPrivate, 0, 1000);
      let filteredKanjis = response.data.items || response.data.content || [];
      
      // Apply search filter
      if (searchKeyword.trim()) {
        filteredKanjis = filteredKanjis.filter(kanji => 
          kanji.kanji?.includes(searchKeyword) ||
          kanji.hanViet?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          kanji.meaning?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }
      
      // Apply level filter (convert N5->5, N4->4, etc.)
      if (levelFilter !== 'ALL') {
        const levelNumber = levelFilter.replace('N', '');
        filteredKanjis = filteredKanjis.filter(kanji => kanji.level === levelNumber);
      }
      
      // Store all filtered data
      setAllFilteredKanjis(filteredKanjis);
      setTotalElements(filteredKanjis.length);
      setTotalPages(Math.ceil(filteredKanjis.length / pageSize));
      setCurrentPage(0);
      
      // Show first page
      setKanjis(filteredKanjis.slice(0, pageSize));
    } catch (error) {
      console.error('Error searching kanjis:', error);
      showNotification('error', 'Lỗi', 'Không thể tìm kiếm Kanji');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kanji: '',
      hanViet: '',
      joyoReading: '',
      kunyomi: '',
      onyomi: '',
      level: '',
      radical: '',
      strokes: '',
      svgLink: ''
    });
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const columns = [
    {
      header: 'Kanji',
      field: 'kanji',
      render: (value) => (
        <span className="text-4xl font-bold text-[#2F4454]">{value}</span>
      )
    },
    {
      header: 'Hán Việt',
      field: 'hanViet',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      header: 'Âm đọc',
      field: 'joyoReading',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      header: 'Level',
      field: 'level',
      render: (value) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
          N{value}
        </span>
      )
    },
    {
      header: 'Nét',
      field: 'strokes',
      render: (value) => <span className="font-mono text-sm">{value}</span>
    }
  ];

  const KanjiFormFields = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Kanji *</label>
        <input
          type="text"
          value={formData.kanji}
          onChange={(e) => setFormData({ ...formData, kanji: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454] text-2xl text-center"
          placeholder="漢"
          maxLength="1"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Hán Việt *</label>
        <input
          type="text"
          value={formData.hanViet}
          onChange={(e) => setFormData({ ...formData, hanViet: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="hán"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Âm đọc Joyo</label>
        <input
          type="text"
          value={formData.joyoReading}
          onChange={(e) => setFormData({ ...formData, joyoReading: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="カン"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Kunyomi</label>
        <input
          type="text"
          value={formData.kunyomi}
          onChange={(e) => setFormData({ ...formData, kunyomi: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="から"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Onyomi</label>
        <input
          type="text"
          value={formData.onyomi}
          onChange={(e) => setFormData({ ...formData, onyomi: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="カン"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Level (1-5) *</label>
        <input
          type="number"
          min="1"
          max="5"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="5"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Bộ thủ</label>
        <input
          type="text"
          value={formData.radical}
          onChange={(e) => setFormData({ ...formData, radical: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="宀"
        />
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Số nét *</label>
        <input
          type="number"
          value={formData.strokes}
          onChange={(e) => setFormData({ ...formData, strokes: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="13"
        />
      </div>
      
      <div className="col-span-2">
        <label className="block text-sm font-semibold text-gray-700 mb-2">SVG Link</label>
        <input
          type="text"
          value={formData.svgLink}
          onChange={(e) => setFormData({ ...formData, svgLink: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2F4454]"
          placeholder="https://..."
        />
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-500 to-rose-400 rounded-2xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Quản lý Kanji</h1>
          <p className="text-white/80">CRUD và Import CSV cho chữ Hán</p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-3 bg-gradient-to-r from-slate-500 to-rose-400 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Thêm Kanji mới
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm kiếm theo chữ Hán, âm Hán Việt..."
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
                setLevelFilter('ALL');
                fetchKanjis();
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              Reset
            </button>
          </div>
          
          {/* Level Filter */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">Lọc theo cấp độ:</span>
            {['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setLevelFilter(level);
                  setCurrentPage(0);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  levelFilter === level
                    ? 'bg-gradient-to-r from-slate-500 to-rose-400 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {level === 'ALL' ? 'Tất cả' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Kanji Table */}
        <DataTable
          columns={columns}
          data={kanjis}
          loading={loading}
          onEdit={(kanji) => {
            setSelectedKanji(kanji);
            setFormData(kanji);
            setShowEditDialog(true);
          }}
          onDelete={(kanji) => {
            setSelectedKanji(kanji);
            setShowDeleteDialog(true);
          }}
          emptyMessage="Chưa có Kanji nào"
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-fade-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-[#2F4454]">Thêm Kanji mới</h3>
              </div>
              <div className="p-6">
                <KanjiFormFields />
              </div>
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => {
                    setShowCreateDialog(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-fade-in">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-[#2F4454]">Chỉnh sửa Kanji</h3>
              </div>
              <div className="p-6">
                <KanjiFormFields />
              </div>
              <div className="flex gap-3 p-6 pt-0">
                <button
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
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
          title="Xóa Kanji"
          type="danger"
          confirmText="Xóa"
          message={`Bạn có chắc muốn xóa Kanji "${selectedKanji?.kanji}" (${selectedKanji?.hanViet})?`}
        />

        {/* Import Preview Dialog */}
        {showImportPreview && (
          <ImportPreview
            type="kanji"
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

export default AdminKanji;
