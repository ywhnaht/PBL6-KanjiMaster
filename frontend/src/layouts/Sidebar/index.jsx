import React, { useState } from "react";

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(2);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menus = [
    { icon: "search", label: "Search" },
    { icon: "translate", label: "Translate" },
    { icon: "school", label: "JLPT" },
    { icon: "bookmark", label: "My Word" },
    { icon: "fiber_new", label: "New" },
    { icon: "quiz", label: "Test" },
    { icon: "settings", label: "Setting" },
    { icon: "block", label: "Block" },
  ];

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ease-in-out shrink-0 h-screen flex flex-col border-r border-gray-200 ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      } overflow-x-hidden`}   // ✅ chặn scroll ngang
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 transition-all duration-300">
        <div
          className={`flex items-center gap-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="material-symbols-outlined text-purple-600 text-3xl shrink-0">
            translate
          </span>
          {!isCollapsed && (
            <h2 className="text-2xl font-extrabold text-purple-600 whitespace-nowrap transition-all duration-300">
              Kanji Smart
            </h2>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden"> {/* ✅ fix ngang */}
        <ul
          className={`space-y-2 transition-all duration-300 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {menus.map((m, idx) => (
            <li key={idx}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveIndex(idx);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                  activeIndex === idx
                    ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? m.label : ""}
              >
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-200 ${
                    activeIndex === idx ? "text-purple-700" : "text-gray-700"
                  }`}
                >
                  {m.icon}
                </span>
                {!isCollapsed && (   // ✅ chỉ render khi mở rộng
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      activeIndex === idx
                        ? "text-purple-700"
                        : "text-gray-700"
                    }`}
                  >
                    {m.label}
                  </span>
                )}

                {/* Tooltip khi collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {m.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Toggle Button */}
      <div className="p-4 border-t border-gray-200 transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 group"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className={`material-symbols-outlined transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          >
            {isCollapsed ? "menu" : "menu_open"}
          </span>
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap transition-all duration-300">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
