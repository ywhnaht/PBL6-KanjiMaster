import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../layouts/Header";
import Sidebar from "../../layouts/Sidebar";
import useNotebookStore from "../../store/useNotebookStore";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useAuthStore } from "../../store/useAuthStore";

const NBDetail = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();
  const axiosPrivateHook = useAxiosPrivate();
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;

  const {
    currentNotebook,
    notebookEntries,
    loading,
    getNotebookDetails,
    deleteNotebook,
    deleteEntryFromNotebook,
  } = useNotebookStore();

  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [showWord, setShowWord] = useState(true);
  const [showSpelling, setShowSpelling] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'entry' or 'notebook'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && notebookId) {
      loadNotebookDetails();
    }
  }, [notebookId, isAuthenticated]);

  useEffect(() => {
    filterEntries();
  }, [notebookEntries, searchTerm, showWord, showSpelling, showMeaning]);

  const loadNotebookDetails = async () => {
    try {
      await getNotebookDetails(axiosPrivateHook, notebookId);
    } catch (err) {
      console.error("Error loading notebook details:", err);
    }
  };

  const filterEntries = () => {
    let filtered = notebookEntries || [];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          entry.text?.toLowerCase().includes(term) ||
          entry.entityReading?.toLowerCase().includes(term) ||
          entry.meaning?.toLowerCase().includes(term)
      );
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Delete entry handler
  const handleDeleteEntry = (entry) => {
    setDeleteType("entry");
    setSelectedEntry(entry);
    setShowDeleteModal(true);
  };

  // Delete notebook handler
  const handleDeleteNotebook = () => {
    setDeleteType("notebook");
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteType === "entry" && selectedEntry) {
        // Call delete entry from store
        console.log("🗑️ Deleting entry with ID:", selectedEntry.entryId);
        await deleteEntryFromNotebook(axiosPrivateHook, selectedEntry.entryId);
        console.log("✅ Entry deleted successfully");
        setShowDeleteModal(false);
        setSelectedEntry(null);
      } else if (deleteType === "notebook") {
        // Delete notebook
        console.log("🗑️ Deleting notebook with ID:", notebookId);
        await deleteNotebook(axiosPrivateHook, notebookId);
        console.log("✅ Notebook deleted successfully");
        setShowDeleteModal(false);
        navigate("/notebook");
      }
    } catch (error) {
      console.error("❌ Error deleting:", error);
      alert("Không thể xoá. Vui lòng thử lại!");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                Vui lòng đăng nhập
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="webcrumbs">
      <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto py-8 px-20">
            <main className="bg-white rounded-3xl w-full p-12 border border-gray-200">
              {/* Breadcrumb */}
              <div className="text-sm text-gray-600 mb-8 flex items-center gap-2">
                <button
                  onClick={() => navigate("/notebook")}
                  className="hover:text-rose-500 transition-colors font-medium"
                >
                  List of notebooks
                </button>
                <span>/</span>
                <span className="text-gray-800 font-semibold">
                  {currentNotebook?.name || "Loading..."}
                </span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="material-symbols-outlined text-6xl text-rose-400 animate-spin">
                    hourglass_empty
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Left Sidebar */}
                  <div className="lg:col-span-1">
                    {/* Notebook Info Card */}
                    <div className="rounded-2xl border border-slate-300 p-6 mb-6">
                      {/* Notebook Image */}
                      <div className="w-full h-48 bg-gradient-to-br rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-lg">
                        <img
                          src="https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=400&fit=crop"
                          alt={currentNotebook?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Notebook Details */}
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {currentNotebook?.name}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        {currentNotebook?.description || "Không có mô tả"}
                      </p>
                      <p className="text-slate-700 font-semibold mb-4 text-lg">
                        <span className="slate-600">
                          {currentNotebook?.totalEntries || 0}
                        </span>{" "}
                        word
                      </p>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium">
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                          Sửa
                        </button>
                        <button
                          onClick={handleDeleteNotebook}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all font-medium"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="lg:col-span-3">
                    {/* Top Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
                      {/* Feature Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-semibold shadow-md">
                          <span className="material-symbols-outlined text-lg">
                            collections
                          </span>
                          FlashCard
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-semibold shadow-md">
                          <span className="material-symbols-outlined text-lg">
                            category
                          </span>
                          Quiz
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all font-semibold shadow-md">
                          <span className="material-symbols-outlined text-lg">
                            assignment
                          </span>
                          Mini Test
                        </button>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-4 py-2 pl-10 rounded-lg border border-slate-300 focus:outline-none bg-slate-50"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">
                          search
                        </span>
                      </div>

                      {/* Filter */}
                      <button className="flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-all font-semibold">
                        <span className="material-symbols-outlined text-lg">
                          tune
                        </span>
                        Filter
                      </button>
                    </div>

                    {/* Tab Filters */}
                    <div className="flex gap-4 mb-6 border-b border-slate-200 pb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSpelling}
                          onChange={(e) => setShowSpelling(e.target.checked)}
                          className="w-4 h-4 rounded accent-rose-400"
                        />
                        <span className="text-slate-700 font-medium">
                          Spelling
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showMeaning}
                          onChange={(e) => setShowMeaning(e.target.checked)}
                          className="w-4 h-4 rounded accent-rose-400"
                        />
                        <span className="text-slate-700 font-medium">
                          Meaning
                        </span>
                      </label>
                      <button className="ml-auto flex items-center gap-2 text-slate-600 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </button>
                    </div>

                    {/* Entries Grid */}
                    {filteredEntries.length === 0 ? (
                      <div className="text-center py-12">
                        <span className="material-symbols-outlined text-6xl text-slate-300 inline-block mb-4">
                          search_off
                        </span>
                        <p className="text-slate-500 text-lg">
                          Không tìm thấy từ nào
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paginatedEntries.map((entry, idx) => (
                          <div
                            key={entry.entryId || idx}
                            className="bg-white border border-slate-200 rounded-xl p-4 transition-all flex flex-col"
                          >
                            {/* Header */}
                            <div className="mb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <button className="text-slate-400 flex-shrink-0 mt-1 transition-colors">
                                    <span className="material-symbols-outlined text-base">
                                      volume_up
                                    </span>
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xl font-semibold text-slate-800 break-words leading-snug">
                                      {entry.text}
                                    </h4>

                                    {showSpelling && (
                                      <p className="text-sm text-slate-500 mt-1 truncate">
                                        {entry.entityReading}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                  {entry.entityType === "COMPOUND"
                                    ? "TỪ GHÉP"
                                    : entry.entityType}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2 mb-3">
                              {showMeaning && (
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                  <p className="text-slate-700 text-sm leading-relaxed">
                                    <span className="font-semibold text-slate-800">
                                      Meaning:
                                    </span>{" "}
                                    {entry.meaning || (
                                      <span className="text-slate-400 italic">
                                        No meaning provided
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Divider */}
                            <div className="w-full h-px bg-slate-100 my-2"></div>

                            {/* Footer */}
                            <div className="flex items-center gap-2 pt-1">
                              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium">
                                <span className="material-symbols-outlined text-sm">
                                  description
                                </span>
                                Notes
                              </button>
                              <button
                                onClick={() => handleDeleteEntry(entry)}
                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-sm font-medium"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                                Xoá
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {filteredEntries.length > itemsPerPage && (
                      <div className="flex items-center justify-center gap-2 mt-8">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>&lt;</span>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold transition-all ${
                              currentPage === i + 1
                                ? "bg-gradient-to-br from-slate-600 to-rose-400 text-white shadow-md"
                                : "border border-slate-300 hover:bg-slate-100 text-slate-600"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>&gt;</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative z-[10000]">
            {deleteType === "entry" ? (
              <>
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <span className="material-symbols-outlined text-red-600 text-xl">
                    warning
                  </span>
                </div>
                <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                  Xóa từ này?
                </h3>
                <p className="text-center text-slate-600 mb-2">
                  <span className="font-semibold text-slate-800">
                    {selectedEntry?.text}
                  </span>
                </p>
                <p className="text-center text-slate-500 text-sm mb-6">
                  Hành động này không thể hoàn tác
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <span className="material-symbols-outlined text-red-600 text-xl">
                    warning
                  </span>
                </div>
                <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                  Xóa notebook này?
                </h3>
                <p className="text-center text-slate-600 mb-2">
                  <span className="font-semibold text-slate-800">
                    {currentNotebook?.name}
                  </span>
                </p>
                <p className="text-center text-slate-500 text-sm mb-6">
                  Tất cả các từ trong notebook sẽ bị xóa. Hành động này không
                  thể hoàn tác
                </p>
              </>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      hourglass_empty
                    </span>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NBDetail;
