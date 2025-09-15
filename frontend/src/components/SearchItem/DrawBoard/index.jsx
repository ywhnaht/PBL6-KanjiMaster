import React, { useRef, useEffect } from "react";

export default function DrawBoard({ predictions, onClose }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "black"; // Màu xám + mờ nhẹ
    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    isDrawing.current = true;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = "drawing.png";
    link.click();
  };

  return (
    <div className="absolute left-0 mt-3 w-[800px] bg-white border border-gray-300 rounded-xl shadow-lg z-50 p-3">
      {/* Predictions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {predictions.map((p, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-primary-100 hover:text-primary-700 cursor-pointer transition-all text-sm"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={770}
        height={366}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-200 rounded-lg cursor-crosshair"
      />

      {/* Controls */}
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Đóng
        </button>
        <div className="flex gap-3">
          <button
            onClick={clearCanvas}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Xóa"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            title="Hoàn tác"
          >
            <span className="material-symbols-outlined">undo</span>
          </button>
          <button
            onClick={saveCanvas}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Lưu về máy"
          >
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
