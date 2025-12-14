import React, { useRef, useEffect, useState } from "react";

export default function DrawBoard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [ws, setWs] = useState(null);
  const [predictions, setPredictions] = useState([]);

  const [drawing, setDrawing] = useState(false);
  const currentStroke = useRef([]);
  const allStrokes = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const socket = new WebSocket(
      "wss://web-production-a4fdd2.up.railway.app/ws/recognize/"
    );
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === "predictions") {
        setPredictions(data.predictions);
      }
    };

    return () => socket.close();
  }, []);

  const startDrawing = (e) => {
    setDrawing(true);
    currentStroke.current = [];

    const rect = canvasRef.current.getBoundingClientRect();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!drawing) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxRef.current.strokeStyle = "#000";

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    currentStroke.current.push([x, y]);
  };

  const stopDrawing = () => {
    if (!drawing) return;
    setDrawing(false);

    if (currentStroke.current.length > 0) {
      allStrokes.current.push(currentStroke.current);
      sendStroke(currentStroke.current);
    }
  };

  const sendStroke = (stroke) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(
      JSON.stringify({
        action: "strokes",
        stroke,
        canvas_size: { width: 770, height: 366 },
      })
    );
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 770, 366);

    allStrokes.current = [];

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ action: "clear" }));
    }

    setPredictions([]);
  };

  const renderPredictions = () => {
    if (!predictions.length)
      return <span className="text-gray-500 text-sm">Đang chờ kết quả...</span>;

    const topKPerStroke = predictions.map((p) => p.topk.slice(0, 5));
    const cartesian = (arrays) =>
      arrays.reduce(
        (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
        [[]]
      );

    const combos = cartesian(topKPerStroke);

    const comboScores = combos
      .map((combo) => ({
        chars: combo.map((c) => c.label).join(""),
        prob: combo.reduce((p, c) => p * c.prob, 1),
      }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 5);

    return comboScores.map((c, i) => (
      <span
        key={i}
        className="px-3 py-1 rounded-lg bg-gray-100 text-sm font-semibold 
                   text-gray-800 hover:bg-blue-100 hover:text-blue-800 
                   transition-colors cursor-pointer"
      >
        <span className="text-xl font-bold">{c.chars}</span>
      </span>
    ));
  };

  return (
    <div className="absolute left-0 mt-3 w-[800px] bg-white border border-gray-300 
                    rounded-xl shadow-lg z-50 p-3">

      {/* Predictions giống Code 2 */}
      <div className="flex flex-wrap gap-2 mb-3 h-10 items-center">
        {renderPredictions()}
      </div>

      {/* Canvas giống Code 2 */}
      <canvas
        ref={canvasRef}
        width={770}
        height={366}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-200 rounded-lg cursor-crosshair bg-white"
      />

      {/* Buttons giống Code 2 */}
      <div className="flex justify-between items-center mt-2">
        <span></span>
        <div className="flex gap-3">
          <button
            onClick={clearCanvas}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}