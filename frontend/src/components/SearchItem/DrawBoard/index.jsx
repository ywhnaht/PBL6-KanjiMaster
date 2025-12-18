import React, { useRef, useEffect, useState, useCallback } from "react";
import useDarkModeStore from "../../../store/useDarkModeStore";

const WS_URL = "wss://web-production-a4fdd2.up.railway.app/ws/recognize/";

export default function DrawBoard({ onClose, onSearchComplete }) {
  const isDark = useDarkModeStore((state) => state.isDark);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const currentStroke = useRef([]);
  const allStrokes = useRef([]);
  const boardRef = useRef(null);

  const [ws, setWs] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [predictions, setPredictions] = useState([]);

  /* =========================
     INIT CANVAS + WEBSOCKET
  ========================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Màu nét vẽ linh hoạt theo mode
    ctx.strokeStyle = isDark ? "#60a5fa" : "#1e293b";

    ctx.fillStyle = isDark ? "#1e293b" : "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.status === "predictions") {
        displayPredictions(data.predictions);
      }
    };

    return () => socket.close();
  }, [isDark]);

  /* =========================
     HANDLE CLICK OUTSIDE
  ========================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boardRef.current && !boardRef.current.contains(e.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  /* =========================
     PREDICTION LOGIC
  ========================= */
  const displayPredictions = useCallback((preds) => {
    if (!preds || preds.length === 0) {
      setPredictions([]);
      return;
    }
    const topKPerChar = preds.map((p) => p.topk.slice(0, 5));
    const cartesian = (arr) =>
      arr.reduce(
        (acc, cur) => acc.flatMap((a) => cur.map((c) => [...a, c])),
        [[]]
      );
    const combos = cartesian(topKPerChar);
    const scored = combos
      .map((c) => ({
        chars: c.map((x) => x.label).join(""),
        prob: c.reduce((p, x) => p * x.prob, 1),
      }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5)
      .map((x) => ({
        chars: x.chars,
        probPercent: (x.prob * 100).toFixed(1),
      }));
    setPredictions(scored);
  }, []);

  /* =========================
     ACTIONS (Sử dụng logic chuẩn của bạn)
  ========================= */
  const sendStroke = useCallback(
    (stroke) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      ws.send(
        JSON.stringify({
          action: "strokes",
          stroke,
          canvas_size: {
            width: canvasRef.current.width,
            height: canvasRef.current.height,
          },
        })
      );
    },
    [ws]
  );

  const startDrawing = useCallback((e) => {
    setDrawing(true);
    setHasDrawn(true);
    currentStroke.current = [];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    currentStroke.current.push([x, y]);
  }, []);

  const draw = useCallback(
    (e) => {
      if (!drawing) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctxRef.current.lineTo(x, y);
      ctxRef.current.stroke();
      currentStroke.current.push([x, y]);
    },
    [drawing]
  );

  const stopDrawing = useCallback(() => {
    if (!drawing) return;
    setDrawing(false);
    ctxRef.current.closePath();
    if (currentStroke.current.length > 1) {
      allStrokes.current.push([...currentStroke.current]);
      setCanUndo(true);
      sendStroke(currentStroke.current);
    }
  }, [drawing, sendStroke]);

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.fillStyle = isDark ? "#1e293b" : "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    allStrokes.current = [];
    currentStroke.current = [];
    setPredictions([]);
    setHasDrawn(false);
    setCanUndo(false);
    ws?.send(JSON.stringify({ action: "clear" }));
  }, [isDark, ws]);

  const undoStroke = useCallback(() => {
    if (allStrokes.current.length === 0) return;
    allStrokes.current.pop();
    setCanUndo(allStrokes.current.length > 0);
    setHasDrawn(allStrokes.current.length > 0);
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    ctx.fillStyle = isDark ? "#1e293b" : "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = isDark ? "#60a5fa" : "#1e293b";
    ctx.lineWidth = 5;
    allStrokes.current.forEach((stroke) => {
      ctx.beginPath();
      ctx.moveTo(stroke[0][0], stroke[0][1]);
      stroke.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.stroke();
      ctx.closePath();
    });
    ws?.send(JSON.stringify({ action: "undo" }));
  }, [isDark, ws]);

  const handlePredictionClick = useCallback(
    (chars) => {
      onSearchComplete(chars);
      clearCanvas();
      onClose();
    },
    [onSearchComplete, clearCanvas, onClose]
  );

  /* =========================
     RENDER
  ========================= */
  return (
    <div
      ref={boardRef}
      className={`absolute left-0 mt-3 w-[800px] border rounded-2xl shadow-2xl z-50 overflow-hidden transition-all duration-300 ${
        isDark
          ? "bg-slate-900 border-slate-700 shadow-black/40"
          : "bg-white border-gray-200 shadow-gray-300/50"
      }`}
    >
      {/* Header: Hiển thị kết quả gợi ý */}
      {/* Header: Hiển thị kết quả gợi ý */}
      <div
        className={`p-3 border-b flex items-center min-h-[70px] ${
          isDark
            ? "border-slate-800 bg-slate-800/50"
            : "border-gray-100 bg-gray-50"
        }`}
      >
        {!hasDrawn ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
            <span className="material-symbols-outlined text-lg">edit_note</span>
            Vẽ vào khung dưới để bắt đầu nhận diện
          </div>
        ) : (
          <div className="w-full">
            {predictions.length > 0 ? (
              <div className="flex flex-wrap gap-2 items-center">
                {predictions.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handlePredictionClick(p.chars)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
                      isDark
                        ? "bg-slate-700 text-white"
                        : "bg-white border border-gray-200 hover:bg-blue-50 shadow-sm"
                    }`}
                    title={`Confidence: ${p.probPercent}%`}
                  >
                    <span className="text-xl font-bold">{p.chars}</span>
                    {/* <span className="text-xs opacity-75">
                      ({p.probPercent}%)
                    </span> */}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium animate-pulse">
                <span className="inline-block animate-spin">
                  <span className="material-symbols-outlined">sync</span>
                </span>
                Đang nhận diện...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={768}
          height={320}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`w-full rounded-xl cursor-crosshair border-2 transition-colors ${
            isDark
              ? "border-slate-800 bg-slate-800 shadow-inner"
              : "border-gray-50 bg-[#fafafa]"
          }`}
        />
      </div>

      {/* Footer: Các nút chức năng */}
      <div
        className={`px-4 py-3 flex justify-between items-center ${
          isDark ? "bg-slate-800/30" : "bg-gray-50/50"
        }`}
      >
        <button
          onClick={onClose}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            isDark
              ? "hover:bg-slate-700 text-slate-300"
              : "hover:bg-gray-200 text-gray-600"
          }`}
        >
          <span className="material-symbols-outlined text-lg">close</span> Đóng
        </button>

        <div className="flex gap-3">
          <button
            onClick={undoStroke}
            disabled={!canUndo}
            title="Quay lại (Undo)"
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
              canUndo
                ? isDark
                  ? "bg-slate-700 hover:bg-slate-600 text-yellow-400"
                  : "bg-white shadow-sm hover:bg-gray-100 text-yellow-600"
                : "opacity-20 cursor-not-allowed text-gray-400"
            }`}
          >
            <span className="material-symbols-outlined">undo</span>
          </button>

          <button
            onClick={clearCanvas}
            title="Xóa tất cả"
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
              isDark
                ? "bg-slate-700 hover:bg-red-900/40 text-slate-300 hover:text-red-400"
                : "bg-white shadow-sm hover:bg-red-50 text-gray-500 hover:text-red-600"
            }`}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}