import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { icon: "search", label: "Search", path: "/home" },
    { icon: "school", label: "JLPT", path: "/jlpt" },
    { icon: "bookmark", label: "My Word", path: "/notebook" },
    { icon: "quiz", label: "Test", path: "/test" },
    { icon: "swords", label: "Battle", path: "/battle" },
    { icon: "emoji_events", label: "Leaderboard", path: "/leaderboard" },
    { icon: "settings", label: "Setting", path: "/setting" },
    { icon: "block", label: "Block", path: "/block" },
  ];

  // Hàm kiểm tra menu item có active không
  const isActive = (menuPath) => {
    return location.pathname === menuPath;
  };

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ease-in-out shrink-0 h-screen flex flex-col border-r border-gray-200 ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      } overflow-x-hidden`}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-200 transition-all duration-300">
        <div
          className={`flex items-center gap-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[#DA7B93] text-3xl shrink-0">
            translate
          </span>
          {!isCollapsed && (
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#2F4454] to-[#DA7B93] bg-clip-text text-transparent whitespace-nowrap transition-all duration-300">
              Kanji Master
            </h2>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4 overflow-x-hidden">
        <ul
          className={`space-y-2 transition-all duration-300 ${
            isCollapsed ? "px-2" : "px-4"
          }`}
        >
          {menus.map((menu, idx) => (
            <li key={idx}>
              <a
                href={menu.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(menu.path);
                }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative ${
                  isActive(menu.path)
                    ? "bg-gradient-to-r from-[#DA7B93]/20 to-[#2F4454]/10 text-[#2F4454] shadow-sm border border-[#DA7B93]/30"
                    : menu.highlight
                    ? "text-gray-700 hover:bg-gradient-to-r hover:from-[#DA7B93]/10 hover:to-[#2F4454]/10 hover:text-[#2F4454] border border-[#DA7B93]/20"
                    : "text-gray-700 hover:bg-[#2F4454]/5 hover:text-[#2F4454]"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? menu.label : ""}
              >
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-200 ${
                    isActive(menu.path) ? "text-[#DA7B93]" : "text-gray-700 group-hover:text-[#2F4454]"
                  }`}
                >
                  {menu.icon}
                </span>
                {!isCollapsed && (
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive(menu.path)
                        ? "text-[#2F4454] font-semibold"
                        : "text-gray-700 group-hover:text-[#2F4454]"
                    }`}
                  >
                    {menu.label}
                  </span>
                )}

                {/* Tooltip khi collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-[#2F4454] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {menu.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#2F4454]"></div>
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
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-[#2F4454]/5 hover:bg-[#2F4454]/10 transition-all duration-200 group"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className={`material-symbols-outlined transition-transform duration-300 text-[#2F4454] ${
              isCollapsed ? "rotate-180" : ""
            }`}
          >
            {isCollapsed ? "menu" : "menu_open"}
          </span>
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap transition-all duration-300 text-[#2F4454]">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}