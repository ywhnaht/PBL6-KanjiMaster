import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useDarkModeStore from "../../store/useDarkModeStore";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useDarkModeStore((state) => state.isDark); // ✅ FIX: Dùng selector

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
      className={`shadow-xl transition-all duration-300 ease-in-out shrink-0 h-screen flex flex-col border-r ${
        isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-gray-200'
      } ${isCollapsed ? "w-[72px]" : "w-[240px]"} overflow-x-hidden`}
    >
      {/* 🔝 Header */}
      <div className={`border-b transition-all duration-300 h-[72px] flex items-center px-5 ${
        isDark
          ? 'border-slate-700'
          : 'border-gray-200'
      }`}>
        <div
          className={`flex items-center gap-2 w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="material-symbols-outlined text-[#DA7B93] text-3xl shrink-0">
            translate
          </span>
          {!isCollapsed && (
            <h2 className={`text-2xl font-extrabold bg-clip-text text-transparent whitespace-nowrap transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-r from-[#ffbacb] to-[#DA7B93]'
                : 'bg-gradient-to-r from-[#2F4454] to-[#DA7B93]'
            }`}>
              Kanji Master
            </h2>
          )}
        </div>
      </div>

      {/* 📋 Menu Items */}
      <div className={`flex-1 overflow-y-auto py-4 overflow-x-hidden ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
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
                    ? isDark
                      ? "bg-gradient-to-r from-[#DA7B93]/30 to-[#2F4454]/20 text-slate-100 shadow-sm border border-[#DA7B93]/40"
                      : "bg-gradient-to-r from-[#DA7B93]/20 to-[#2F4454]/10 text-[#2F4454] shadow-sm border border-[#DA7B93]/30"
                    : isDark
                    ? "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    : "text-gray-700 hover:bg-[#2F4454]/5 hover:text-[#2F4454]"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? menu.label : ""}
              >
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-200 ${
                    isActive(menu.path)
                      ? "text-[#DA7B93]"
                      : isDark
                      ? "text-slate-400 group-hover:text-slate-200"
                      : "text-gray-700 group-hover:text-[#2F4454]"
                  }`}
                >
                  {menu.icon}
                </span>
                {!isCollapsed && (
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive(menu.path)
                        ? isDark
                          ? "text-slate-100 font-semibold"
                          : "text-[#2F4454] font-semibold"
                        : isDark
                        ? "text-slate-300 group-hover:text-slate-100"
                        : "text-gray-700 group-hover:text-[#2F4454]"
                    }`}
                  >
                    {menu.label}
                  </span>
                )}

                {/* 💬 Tooltip khi collapsed */}
                {isCollapsed && (
                  <div className={`absolute left-full ml-2 px-3 py-1.5 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50 ${
                    isDark
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-[#2F4454]'
                  }`}>
                    {menu.label}
                    <div className={`absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent ${
                      isDark
                        ? 'border-r-slate-700'
                        : 'border-r-[#2F4454]'
                    }`}></div>
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* 🔘 Toggle Button */}
      <div className={`p-4 border-t transition-all duration-300 ${
        isDark
          ? 'border-slate-700 bg-slate-800'
          : 'border-gray-200 bg-white'
      }`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center justify-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
            isDark
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
              : 'bg-[#2F4454]/5 hover:bg-[#2F4454]/10 text-[#2F4454]'
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className={`material-symbols-outlined transition-transform duration-300 ${
              isDark ? 'text-slate-200' : 'text-[#2F4454]'
            } ${isCollapsed ? "rotate-180" : ""}`}
          >
            {isCollapsed ? "menu" : "menu_open"}
          </span>
          {!isCollapsed && (
            <span className={`font-medium whitespace-nowrap transition-all duration-300 ${
              isDark
                ? 'text-slate-200'
                : 'text-[#2F4454]'
            }`}>
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}