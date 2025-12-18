import React from 'react';
import useDarkModeStore from '../../store/useDarkModeStore';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize = 10,
  totalElements = 0
}) => {
  const isDark = useDarkModeStore((state) => state.isDark);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  if (totalPages <= 1) return null;

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-4`}>
      <div className="flex items-center justify-between">
        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Hiển thị <span className="font-semibold text-[#2F4454]">{startItem}</span> đến{' '}
          <span className="font-semibold text-[#2F4454]">{endItem}</span> trong tổng số{' '}
          <span className="font-semibold text-[#2F4454]">{totalElements}</span> mục
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentPage === 0
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-700 hover:bg-[#2F4454] hover:text-white text-gray-300' : 'bg-gray-100 hover:bg-[#2F4454] hover:text-white text-gray-700'
            }`}
          >
            ← Trước
          </button>
          
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                page === currentPage
                  ? 'bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white'
                  : isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {page + 1}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            className={`px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
              currentPage >= totalPages - 1
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-700 hover:bg-[#2F4454] hover:text-white text-gray-300' : 'bg-gray-100 hover:bg-[#2F4454] hover:text-white text-gray-700'
            }`}
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
