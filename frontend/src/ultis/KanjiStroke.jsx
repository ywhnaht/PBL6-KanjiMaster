import React, { useEffect, useRef, useState, useCallback } from "react";
import DOMPurify from "dompurify";

export default function KanjiStroke({
  svgUrl,
  width = 300,
  height = 300,
  className = "",
  autoPlay = true,
  loop = false,
  strokeDuration = 300,
  strokeDelay = 600,
}) {
  const [svgContent, setSvgContent] = useState(`<svg viewBox="0 0 109 109"></svg>`);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const strokeColors = [
    "#bf2626","#bf6b26","#bfaf26","#89bf26","#44bf26",
    "#26bf4c","#26bf91","#26a8bf","#2663bf","#2d26bf",
    "#7226bf","#b726bf","#bf2682","#bf263d","#bf2626"
  ];

  const cleanup = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  // Load SVG, inject colors và background trục
  useEffect(() => {
    if (!svgUrl) return;
    let cancelled = false;

    fetch(svgUrl)
      .then(res => res.text())
      .then(text => {
        if (cancelled) return;

        let clean = DOMPurify.sanitize(text, { USE_PROFILES: { svg: true } });
        clean = clean.replace(/(width|height)="[^"]*"/g, "");

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = clean;

        const svgEl = tempDiv.querySelector("svg");
        if (!svgEl) return;

        // Thêm background trục ngang – dọc ở giữa
        const midX = 109 / 2;
        const midY = 109 / 2;
        const bgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

        bgGroup.setAttribute("stroke-dasharray", "4 2"); // 4px nét, 2px khoảng

        bgGroup.setAttribute("stroke", "#cce7ff"); // xanh nhạt
        bgGroup.setAttribute("stroke-width", "0.5");

        const vertical = document.createElementNS("http://www.w3.org/2000/svg", "line");
        vertical.setAttribute("x1", midX);
        vertical.setAttribute("y1", 0);
        vertical.setAttribute("x2", midX);
        vertical.setAttribute("y2", 109);

        const horizontal = document.createElementNS("http://www.w3.org/2000/svg", "line");
        horizontal.setAttribute("x1", 0);
        horizontal.setAttribute("y1", midY);
        horizontal.setAttribute("x2", 109);
        horizontal.setAttribute("y2", midY);

        bgGroup.appendChild(vertical);
        bgGroup.appendChild(horizontal);

        // chèn vào đầu SVG để nằm dưới path/text
        svgEl.insertBefore(bgGroup, svgEl.firstChild);

        // Gán màu stroke cho path
        const paths = svgEl.querySelectorAll("path");
        const texts = svgEl.querySelectorAll("text");

        paths.forEach((path, i) => {
          const color = strokeColors[i % strokeColors.length];
          path.setAttribute("stroke", color);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke-width", "3");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
        });

        texts.forEach((text, i) => {
          const color = strokeColors[i % strokeColors.length];
          text.setAttribute("fill", color);
          text.setAttribute("opacity", "0");
        });

        setSvgContent(svgEl.outerHTML);
      })
      .catch(err => {
        console.warn("SVG fetch error", err);
        setSvgContent(`<svg viewBox="0 0 109 109"><text x="50%" y="50%" text-anchor="middle" fill="#999">SVG lỗi</text></svg>`);
      });

    return () => { cancelled = true; };
  }, [svgUrl]);

  // Animate strokes
  const animateStrokes = useCallback(() => {
    cleanup();
    const container = containerRef.current;
    if (!container) return;
    const svgEl = container.querySelector("svg");
    if (!svgEl) return;

    const paths = Array.from(svgEl.querySelectorAll("path"));
    const texts = Array.from(svgEl.querySelectorAll("text"));
    if (!paths.length) return;

    let startTime = null;
    paths.forEach(path => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length} ${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.transition = "none";
    });
    texts.forEach(t => (t.style.opacity = 0));

    const drawNext = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      let allDone = true;

      paths.forEach((path, i) => {
        const pathStart = i * strokeDelay;
        const progress = Math.min(Math.max((elapsed - pathStart) / strokeDuration, 0), 1);
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const length = path.getTotalLength();
        path.style.strokeDashoffset = `${length * (1 - ease)}`;
        if (texts[i] && progress > 0) texts[i].style.opacity = Math.min(1, ease);
        if (progress < 1) allDone = false;
      });

      if (!allDone) animationRef.current = requestAnimationFrame(drawNext);
    };

    animationRef.current = requestAnimationFrame(drawNext);
  }, [cleanup, strokeDelay, strokeDuration]);

  useEffect(() => {
    if (autoPlay) {
      setTimeout(() => animateStrokes(), 300);
    }
  }, [svgContent, autoPlay, animateStrokes]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width, height, position: "relative" }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
