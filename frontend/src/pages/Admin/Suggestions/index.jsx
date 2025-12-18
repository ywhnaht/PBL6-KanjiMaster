import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import Pagination from '../../../components/Admin/Pagination';
import NotificationModal from '../../../components/Admin/NotificationModal';
import { getAllSuggestions, reviewSuggestion } from '../../../apis/suggestions';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import useDarkModeStore from '../../../store/useDarkModeStore';

const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(9);
  const isDark = useDarkModeStore((state) => state.isDark);
  
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [adminNote, setAdminNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchSuggestions();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const status = statusFilter !== 'ALL' ? statusFilter : null;
      const type = typeFilter !== 'ALL' ? typeFilter : null;
      
      const response = await getAllSuggestions(axiosPrivate, status, type, currentPage, pageSize);
      const items = response.data.items || [];
      
      setSuggestions(items);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalItems);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    try {
      setReviewLoading(true);
      await reviewSuggestion(axiosPrivate, selectedSuggestion.id, {
        status: reviewStatus,
        adminNote: adminNote
      });
      
      showNotification('success', 'Thành công', 
        `Đã ${reviewStatus === 'APPROVED' ? 'chấp nhận' : 'từ chối'} yêu cầu`
      );
      setShowReviewDialog(false);
      setSelectedSuggestion(null);
      setAdminNote('');
      fetchSuggestions();
    } catch (error) {
      console.error('Error reviewing suggestion:', error);
      showNotification('error', 'Lỗi', 'Không thể xem xét yêu cầu');
    } finally {
      setReviewLoading(false);
    }
  };

  const showNotification = (type, title, message) => {
    setNotification({ isOpen: true, type, title, message });
  };

  const getTypeText = (type) => {
    const types = {
      'ADD_KANJI': 'Thêm Kanji',
      'ADD_COMPOUND': 'Thêm từ ghép',
      'CORRECTION': 'Báo lỗi/Sửa đổi'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Chờ duyệt'},
      'APPROVED': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Đã chấp nhận' },
      'REJECTED': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', label: 'Đã từ chối' }
    };
    const badge = badges[status] || badges['PENDING'];
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${badge.bg} ${badge.text} border flex items-center gap-1`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
              Quản lý yêu cầu
            </h1>
            <p className="text-gray-600 mt-1">Duyệt các yêu cầu từ người dùng</p>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <span className={`material-symbols-outlined ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>pending_actions</span>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{totalElements}</span>
            <span className="text-sm text-gray-500">yêu cầu</span>
          </div>
        </div>

        {/* Filters */}
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-6`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className={`w-full px-4 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500`}
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã chấp nhận</option>
                <option value="REJECTED">Đã từ chối</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Loại yêu cầu
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className={`w-full px-4 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500`}
              >
                <option value="ALL">Tất cả</option>
                <option value="ADD_KANJI">Thêm Kanji</option>
                <option value="ADD_COMPOUND">Thêm từ ghép</option>
                <option value="CORRECTION">Báo lỗi/Sửa đổi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suggestions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-slate-500"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Đang tải...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-12 text-center`}>
            <span className={`material-symbols-outlined text-6xl ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>inbox</span>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200'} rounded-xl shadow-md border hover:shadow-lg transition-all cursor-pointer overflow-hidden`}
                onClick={() => {
                  setSelectedSuggestion(suggestion);
                  setShowReviewDialog(true);
                  setReviewStatus('APPROVED');
                  setAdminNote('');
                }}
              >
                {/* Header with type icon */}
                <div className={`p-4 bg-gradient-to-br from-slate-500 to-rose-400`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-white text-xl">
                        {suggestion.type === 'ADD_KANJI' ? 'translate' : 
                         suggestion.type === 'ADD_COMPOUND' ? 'menu_book' : 'flag'}
                      </span>
                      <span className="text-white font-medium text-sm">
                        {getTypeText(suggestion.type)}
                      </span>
                    </div>
                    {getStatusBadge(suggestion.status)}
                  </div>
                </div>

                {/* Content preview */}
                <div className="p-4">
                  {/* Main word/kanji */}
                  <div className="mb-3 min-h-[80px] flex items-center justify-center">
                    {suggestion.type === 'ADD_KANJI' && suggestion.kanji && (
                      <div className="text-center">
                        <div className="text-5xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-1">{suggestion.kanji}</div>
                        {suggestion.hanViet && (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{suggestion.hanViet}</div>
                        )}
                      </div>
                    )}
                    {suggestion.type === 'ADD_COMPOUND' && suggestion.word && (
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-1">{suggestion.word}</div>
                        {suggestion.reading && (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{suggestion.reading}</div>
                        )}
                      </div>
                    )}
                    {suggestion.type === 'CORRECTION' && (
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent mb-1">
                          {suggestion.kanji || suggestion.word || 'N/A'}
                        </div>
                        {(suggestion.hanViet || suggestion.reading) && (
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>{suggestion.hanViet || suggestion.reading}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined ${isDark ? 'text-gray-500' : 'text-gray-400'} text-sm`}>person</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate max-w-[150px]`}>{suggestion.username}</span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{formatDate(suggestion.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            totalElements={totalElements}
          />
        )}

        {/* Review Dialog - Full Detail View */}
        {showReviewDialog && selectedSuggestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4 overflow-y-auto">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-3xl w-full my-8`}>
              {/* Header */}
              <div className={`px-6 py-4 rounded-t-2xl bg-gradient-to-br from-slate-500 to-rose-400`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white text-3xl">
                      {selectedSuggestion.type === 'ADD_KANJI' ? 'translate' : 
                       selectedSuggestion.type === 'ADD_COMPOUND' ? 'menu_book' : 'flag'}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{getTypeText(selectedSuggestion.type)}</h2>
                      <p className="text-sm text-white/80">{selectedSuggestion.username} • {formatDate(selectedSuggestion.createdAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowReviewDialog(false);
                      setSelectedSuggestion(null);
                      setAdminNote('');
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-white">close</span>
                  </button>
                </div>
              </div>
              
              {/* Content Detail */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-slate-200'} rounded-xl p-5 space-y-4 border-2`}>
                  {/* Kanji Details */}
                  {selectedSuggestion.type === 'ADD_KANJI' && (
                    <div className="space-y-3">
                      <div className={`${isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} border-2 rounded-lg p-4`}>
                        <p className={`text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'} uppercase mb-3`}>➥ Đề xuất thêm Kanji mới</p>
                        
                        <div className={`text-center py-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                          <div className="text-5xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">{selectedSuggestion.kanji}</div>
                          {selectedSuggestion.hanViet && (
                            <div className={`text-xl mt-2 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>{selectedSuggestion.hanViet}</div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {selectedSuggestion.onyomi && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Onyomi</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.onyomi}</p>
                            </div>
                          )}
                          {selectedSuggestion.kunyomi && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Kunyomi</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.kunyomi}</p>
                            </div>
                          )}
                          {selectedSuggestion.joyoReading && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Joyo Reading</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.joyoReading}</p>
                            </div>
                          )}
                          {selectedSuggestion.meaning && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className="text-xs font-semibold text-slate-500 uppercase">Nghĩa</span>
                              <p className="text-base text-slate-700 mt-1">{selectedSuggestion.meaning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Compound Details */}
                  {selectedSuggestion.type === 'ADD_COMPOUND' && (
                    <div className="space-y-3">
                      <div className={`${isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} border-2 rounded-lg p-4`}>
                        <p className={`text-xs font-bold ${isDark ? 'text-green-400' : 'text-green-700'} uppercase mb-3`}>➥ Đề xuất thêm từ ghép mới</p>
                        
                        <div className={`text-center py-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg`}>
                          <div className="text-5xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">{selectedSuggestion.word}</div>
                          {selectedSuggestion.reading && (
                            <div className={`text-lg mt-2 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>{selectedSuggestion.reading}</div>
                          )}
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          {selectedSuggestion.hiragana && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Hiragana</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.hiragana}</p>
                            </div>
                          )}
                          {selectedSuggestion.meaning && (
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-white'}`}>
                              <span className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Nghĩa</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.meaning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Correction Details */}
                  {selectedSuggestion.type === 'CORRECTION' && (
                    <div className="space-y-3">
                      <div className={`${isDark ? 'bg-amber-900/30 border-amber-700' : 'bg-amber-50 border-amber-200'} border-2 rounded-lg p-4`}>
                        <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'} uppercase mb-3`}>⚠️ Yêu cầu sửa đổi / Báo lỗi</p>
                        
                        {/* Kanji/Word đang được báo lỗi */}
                        <div className={`text-center py-4 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg mb-3`}>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Kanji/Từ được báo:</p>
                          <div className="text-5xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent">
                            {selectedSuggestion.kanji || selectedSuggestion.word}
                          </div>
                          {(selectedSuggestion.hanViet || selectedSuggestion.reading) && (
                            <div className={`text-lg mt-2 ${isDark ? 'text-gray-300' : 'text-slate-500'}`}>
                              {selectedSuggestion.hanViet || selectedSuggestion.reading}
                            </div>
                          )}
                        </div>

                        {/* Chi tiết đề xuất sửa đổi */}
                        <div className="space-y-2">
                          <p className={`text-xs font-semibold uppercase ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>📝 Nội dung đề xuất thay đổi:</p>
                          
                          {selectedSuggestion.kanji && (
                            <>
                              {selectedSuggestion.hanViet && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Hán Việt mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.hanViet}</p>
                                </div>
                              )}
                              {selectedSuggestion.onyomi && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Onyomi mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.onyomi}</p>
                                </div>
                              )}
                              {selectedSuggestion.kunyomi && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Kunyomi mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.kunyomi}</p>
                                </div>
                              )}
                              {selectedSuggestion.joyoReading && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Joyo Reading mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.joyoReading}</p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {selectedSuggestion.word && (
                            <>
                              {selectedSuggestion.reading && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Reading mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.reading}</p>
                                </div>
                              )}
                              {selectedSuggestion.hiragana && (
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                                  <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Hiragana mới:</span>
                                  <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.hiragana}</p>
                                </div>
                              )}
                            </>
                          )}
                          
                          {selectedSuggestion.meaning && (
                            <div className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-slate-200'}`}>
                              <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Nghĩa mới:</span>
                              <p className={`text-base mt-1 ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>{selectedSuggestion.meaning}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Reason */}
                  {selectedSuggestion.reason && (
                    <div className={`${isDark ? 'bg-gray-800 border-l-4 border-slate-500' : 'bg-white border-l-4 border-gradient-to-b from-slate-400 to-rose-400'} p-4 rounded-lg`}>
                      <p className="text-xs font-semibold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent uppercase mb-2">Lý do yêu cầu</p>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>{selectedSuggestion.reason}</p>
                    </div>
                  )}
                </div>
                
                {/* Review Controls - Only for PENDING */}
                {selectedSuggestion.status === 'PENDING' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Quyết định <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setReviewStatus('APPROVED')}
                          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            reviewStatus === 'APPROVED'
                              ? 'bg-gradient-to-r from-slate-500 to-rose-400 text-white shadow-lg'
                              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined">check_circle</span>
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => setReviewStatus('REJECTED')}
                          className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            reviewStatus === 'REJECTED'
                              ? 'bg-gradient-to-r from-slate-500 to-rose-400 text-white shadow-lg'
                              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined">cancel</span>
                          Từ chối
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Ghi chú {reviewStatus === 'REJECTED' && <span className="text-rose-500">*</span>}
                      </label>
                      <textarea
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        rows="4"
                        className={`w-full px-4 py-3 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none`}
                        placeholder={reviewStatus === 'APPROVED' 
                          ? "Cảm ơn bạn đã đóng góp..." 
                          : "Vui lòng cho biết lý do từ chối..."}
                      />
                    </div>
                  </div>
                )}
                
                {/* Admin Response - For reviewed suggestions */}
                {selectedSuggestion.status !== 'PENDING' && selectedSuggestion.adminNote && (
                  <div className={`mt-6 rounded-xl p-4 ${
                    selectedSuggestion.status === 'APPROVED' 
                      ? isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-300'
                      : isDark ? 'bg-rose-900/30 border-rose-700' : 'bg-rose-50 border-rose-300'
                  } border-2`}>
                    <p className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Phản hồi của Admin:</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{selectedSuggestion.adminNote}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-2`}>
                      {selectedSuggestion.adminUsername} • {formatDate(selectedSuggestion.reviewedAt)}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Footer Actions */}
              {selectedSuggestion.status === 'PENDING' && (
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                  <button
                    onClick={() => {
                      setShowReviewDialog(false);
                      setSelectedSuggestion(null);
                      setAdminNote('');
                    }}
                    disabled={reviewLoading}
                    className={`flex-1 px-4 py-3 border-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined">close</span>
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      if (reviewStatus === 'REJECTED' && !adminNote.trim()) {
                        showNotification('warning', 'Cảnh báo', 'Vui lòng nhập lý do từ chối');
                        return;
                      }
                      handleReview();
                    }}
                    disabled={reviewLoading}
                    className={`flex-1 px-4 py-3 font-semibold rounded-xl transition-all bg-gradient-to-r from-slate-500 to-rose-400 hover:shadow-lg text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {reviewLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">check_circle</span>
                        Xác nhận
                      </>
                    )}
                  </button>
                </div>
              )}
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

export default AdminSuggestions;