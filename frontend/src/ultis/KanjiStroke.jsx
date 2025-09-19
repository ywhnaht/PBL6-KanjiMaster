// src/utils/KanjiStroke.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import DOMPurify from "dompurify";

export default function KanjiStroke({
  svgUrl,
  width = 300,
  height = 300,
  className = "",
  autoPlay = true,
  loop = true,
  strokeDuration = 500, // thời gian mỗi nét
  strokeDelay = 200,    // delay giữa các nét
}) {
  const [svgContent, setSvgContent] = useState(
    `<svg width="${width}" height="${height}" viewBox="0 0 160 160">
      <rect width="160" height="160" fill="#f0f0f0"/>
    </svg>`
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const cleanup = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    setIsAnimating(false);
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // Load SVG
  useEffect(() => {
    if (!svgUrl) return;

    let cancelled = false;
    fetch(svgUrl)
      .then(res => res.text())
      .then(text => {
        if (cancelled) return;
        const clean = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true } });
        setSvgContent(clean);
      })
      .catch(err => console.warn("SVG fetch error", err));

    return () => { cancelled = true; };
  }, [svgUrl]);

  // Animate stroke với requestAnimationFrame
  const animateStrokes = useCallback(() => {
    cleanup();

    const container = containerRef.current;
    if (!container) return;

    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    const paths = Array.from(svgEl.querySelectorAll("path")).filter(
      path => path.getAttribute("stroke") !== "#bcc9e2" && path.getAttribute("d")
    );
    const texts = Array.from(svgEl.querySelectorAll("text"));

    if (!paths.length) return;

    setIsAnimating(true);

    let startTime = null;
    let currentIndex = 0;

    // Reset paths & texts
    paths.forEach((path, index) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.transition = "none";
      if (texts[index]) texts[index].style.opacity = "0";
    });

    const drawNext = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Xác định path nào đang vẽ
      const index = Math.floor(elapsed / strokeDelay);
      if (index >= paths.length) {
        // Hoàn thành tất cả
        setIsAnimating(false);
        if (loop) {
          setTimeout(() => animateStrokes(), 500);
        }
        return;
      }

      if (index !== currentIndex) {
        currentIndex = index;
      }

      const path = paths[index];
      const text = texts[index];

      if (path) {
        const pathStart = index * strokeDelay;
        const pathProgress = Math.min((elapsed - pathStart) / strokeDuration, 1);
        const length = path.getTotalLength();
        path.style.strokeDashoffset = `${length * (1 - pathProgress)}`;
        if (text) text.style.opacity = "1";
      }

      animationRef.current = requestAnimationFrame(drawNext);
    };

    animationRef.current = requestAnimationFrame(drawNext);

  }, [cleanup, strokeDelay, strokeDuration, loop, svgContent]);

  useEffect(() => {
    if (svgContent && autoPlay && !isAnimating) animateStrokes();
  }, [svgContent, autoPlay, isAnimating, animateStrokes]);

  const triggerAnimation = useCallback(() => {
    if (!isAnimating) animateStrokes();
  }, [isAnimating, animateStrokes]);

  return (
    <div className={`kanji-draw ${className}`} style={{ position: "relative", display: "inline-block" }}>
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
        }}
      />

      {/* Status indicator */}
      {isAnimating && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
