import React, { useRef, useEffect, useState, useCallback } from "react";

const WEBSOCKET_URL = "ws://localhost:8080/ws/recognize/";
const THROTTLE_TIME = 50;

export default function DrawBoard({ onClose, onSearchComplete }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const wsRef = useRef(null);
    const isDrawing = useRef(false);
    const currentStroke = useRef([]);
    const lastPoint = useRef(null);
    const lastSentTimeRef = useRef(0);

    // eslint-disable-next-line no-unused-vars
    const [wsStatus, setWsStatus] = useState("Đang kết nối...");
    const [predictions, setPredictions] = useState([]);
    const [hasDrawn, setHasDrawn] = useState(false);

    const displayPredictions = useCallback((predictionsData) => {
        if (!predictionsData || predictionsData.length === 0) {
            setPredictions([]);
            return;
        }

        const topKPerStroke = predictionsData.map(pred => pred.topk.slice(0, 5));

        function cartesian(arrays) {
            return arrays.reduce((acc, curr) => {
                const res = [];
                acc.forEach(a => {
                    curr.forEach(c => {
                        res.push([...a, c]);
                    });
                });
                return res;
            }, [[]]);
        }

        const combos = cartesian(topKPerStroke);
        const comboScores = combos.map(combo => {
            const chars = combo.map(c => c.label).join('');
            const prob = combo.reduce((p, c) => p * c.prob, 1);
            return { chars, prob };
        });

        comboScores.sort((a, b) => b.prob - a.prob);

        const topResults = comboScores.slice(0, 5).map(c => ({
            chars: c.chars,
            probPercent: (c.prob * 100).toFixed(1)
        }));

        setPredictions(topResults);
    }, []);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (ctxRef.current && canvas) {
            ctxRef.current.fillStyle = "#FFFFFF";
            ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);

            currentStroke.current = [];
            setPredictions([]);
            setHasDrawn(false);

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ action: "clear" }));
            }
        }
    }, []);

    const sendStroke = useCallback(() => {
        const stroke = currentStroke.current;
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && stroke.length > 0) {
            const canvas = canvasRef.current;
            const message = {
                action: "stroke",
                stroke: stroke,
                canvas_size: { width: canvas.width, height: canvas.height },
            };
            wsRef.current.send(JSON.stringify(message));
        }
    }, []);

    const handlePredictionClick = useCallback((text) => {
        if (text) {
            onSearchComplete(text);
            clearCanvas();
            onClose(); 
        }
    }, [clearCanvas, onClose, onSearchComplete]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctxRef.current = ctx;

        const ws = new WebSocket(WEBSOCKET_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setWsStatus("✅ Đã kết nối!");
        };

        ws.onclose = (event) => {
            setWsStatus(`❌ Mất kết nối! (Mã lỗi: ${event.code})`);
        };

        // eslint-disable-next-line no-unused-vars
        ws.onerror = (error) => {
            setWsStatus("⚠️ Lỗi kết nối!");
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === "predictions") {
                    displayPredictions(data.predictions);
                }
            } catch (e) {
                // Giữ lại lỗi console để debug
                console.error("Lỗi xử lý tin nhắn:", e);
            }
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [displayPredictions]);

    const startDrawing = (e) => {
        setHasDrawn(true);
        isDrawing.current = true;
        const { offsetX, offsetY } = e.nativeEvent;

        currentStroke.current = [];
        lastPoint.current = null;
        lastSentTimeRef.current = Date.now();

        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        drawPoint(offsetX, offsetY);
    };

    const drawPoint = (x, y) => {
        if (!lastPoint.current || lastPoint.current[0] !== x || lastPoint.current[1] !== y) {
            currentStroke.current.push([x, y]);
            lastPoint.current = [x, y];
        }
    }

    const draw = (e) => {
        if (!isDrawing.current) return;
        const { offsetX, offsetY } = e.nativeEvent;
        const now = Date.now();

        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();

        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);

        if (now - lastSentTimeRef.current > THROTTLE_TIME) {
            drawPoint(offsetX, offsetY);
            lastSentTimeRef.current = now;
        }
    };

    const stopDrawing = (e) => {
        if (isDrawing.current) {
            isDrawing.current = false;
            ctxRef.current.closePath();

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            let x, y;
            if (e && e.nativeEvent && e.nativeEvent.clientX !== undefined) {
                x = Math.round(e.nativeEvent.clientX - rect.left);
                y = Math.round(e.nativeEvent.clientY - rect.top);
            } else if (lastPoint.current) {
                x = lastPoint.current[0];
                y = lastPoint.current[1];
            }

            if (x !== undefined && y !== undefined) {
                if (!lastPoint.current || lastPoint.current[0] !== x || lastPoint.current[1] !== y) {
                    drawPoint(x, y);
                }
            }

            sendStroke();
        }
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

            <div className={`flex flex-wrap gap-2 mb-3 h-10 items-center ${!hasDrawn && 'hidden'}`}>
                {predictions.length > 0 ? (
                    predictions.map((p, i) => (
                        <span
                            key={i}
                            onClick={() => handlePredictionClick(p.chars)}
                            className="px-3 py-1 rounded-lg bg-gray-100 text-sm font-semibold text-gray-800 hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                            <span className="text-xl font-bold text-gray-800">{p.chars}</span>
                        </span>
                    ))
                ) : (
                    <span className="text-gray-500 text-sm">Đang chờ kết quả...</span>
                )}
            </div>

            {!hasDrawn && (
                <div className="flex flex-wrap gap-2 mb-3 h-10 items-center">
                    <span className="text-gray-500 text-sm">Hãy vẽ nét đầu tiên để bắt đầu nhận diện.</span>
                </div>
            )}

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

            <div className="flex justify-between items-center mt-2">
                <button
                    onClick={onClose}
                    className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300 transition-colors"
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
                        className="p-2 rounded-full text-gray-400 cursor-not-allowed"
                        title="Hoàn tác (Chưa hỗ trợ)"
                        disabled
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