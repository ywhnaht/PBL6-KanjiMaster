import React, { useState } from 'react';
import Papa from 'papaparse';

export default function ImportPreview({ onConfirm, onCancel, type = 'kanji' }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const expectedHeaders = type === 'kanji' 
    ? ['kanji', 'hanViet', 'meaning', 'onyomi', 'kunyomi', 'level', 'examples']
    : ['word', 'meaning', 'reading', 'frequency', 'hiragana', 'example', 'exampleMeaning'];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Vui lòng chọn file CSV');
      return;
    }

    setFile(selectedFile);
    setError('');
    parseCSV(selectedFile);
  };

  const parseCSV = (file) => {
    setLoading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`Lỗi parse CSV: ${results.errors[0].message}`);
          setLoading(false);
          return;
        }

        const headers = results.meta.fields;
        setHeaders(headers);

        // Validate headers
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          setError(`Thiếu các cột: ${missingHeaders.join(', ')}`);
          setPreviewData([]);
          setLoading(false);
          return;
        }

        // Show first 10 rows for preview
        setPreviewData(results.data.slice(0, 10));
        setLoading(false);
      },
      error: (error) => {
        setError(`Lỗi đọc file: ${error.message}`);
        setLoading(false);
      }
    });
  };

  const handleConfirm = () => {
    if (file) {
      onConfirm(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-slate-500 to-rose-400">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined">upload_file</span>
            Import {type === 'kanji' ? 'Kanji' : 'Compound'} từ CSV
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn file CSV
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-500/10 file:text-slate-500 hover:file:bg-slate-500/20 cursor-pointer"
            />
            <p className="mt-2 text-xs text-gray-500">
              Định dạng: {expectedHeaders.join(', ')}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-500">error</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500"></div>
              <p className="mt-2 text-gray-600">Đang đọc file...</p>
            </div>
          )}

          {/* Preview Table */}
          {previewData.length > 0 && !loading && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                Xem trước ({previewData.length} dòng đầu tiên)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      {headers.map((header, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {rowIdx + 1}
                        </td>
                        {headers.map((header, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap"
                          >
                            {row[header] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                * Chỉ hiển thị 10 dòng đầu tiên. File sẽ import toàn bộ dữ liệu.
              </p>
            </div>
          )}

          {/* Instructions */}
          {!file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">info</span>
                Hướng dẫn
              </h4>
              <ul className="text-sm text-blue-800 space-y-1 ml-7 list-disc">
                <li>File CSV phải có encoding UTF-8</li>
                <li>Dòng đầu tiên là tên các cột: {expectedHeaders.join(', ')}</li>
                {type === 'kanji' && (
                  <>
                    <li>Level: 1-5 (1=N1, 5=N5)</li>
                    <li>Examples: phân cách bằng dấu | (ví dụ: 学校|学生)</li>
                  </>
                )}
                <li>Xem trước dữ liệu trước khi import</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!file || error || previewData.length === 0}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-slate-500 to-rose-400 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            Xác nhận Import
          </button>
        </div>
      </div>
    </div>
  );
}
