import React, { useRef, useState } from 'react';

const CsvUploadButton = ({ 
  onFileSelect, 
  accept = '.csv',
  buttonText = 'Import CSV',
  className = '',
  disabled = false
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Reset input để có thể chọn lại cùng file
      event.target.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          ${className}
          ${isDragging ? 'border-[#DA7B93] bg-pink-50' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#2F4454] hover:bg-gray-50'}
          border-2 border-dashed rounded-xl p-4 transition-all duration-200
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-rose-400 rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined">upload_file</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#2F4454]">{buttonText}</p>
            <p className="text-xs text-gray-500">Kéo thả file CSV hoặc click để chọn</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUploadButton;
