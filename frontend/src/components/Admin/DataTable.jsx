import React from 'react';
import useDarkModeStore from '../../store/useDarkModeStore';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  loading = false,
  emptyMessage = 'Không có dữ liệu'
}) => {
  const isDark = useDarkModeStore((state) => state.isDark);
  
  if (loading) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8`}>
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-[#2F4454] border-t-transparent rounded-full animate-spin"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border p-8`}>
        <div className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className={`material-symbols-outlined text-8xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>inbox</span>
          <p className="text-lg font-semibold">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-2xl shadow-lg border overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-left text-sm font-semibold">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-center text-sm font-semibold">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {data.map((row, rowIdx) => (
              <tr key={rowIdx} className={`transition-colors duration-150 ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {col.render ? col.render(row[col.field], row) : row[col.field]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>Sửa</span>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>Xóa</span>
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
