import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { icon: "search", label: "Search", path: "/home" },
    { icon: "school", label: "JLPT", path: "/JLPT" }, // Giữ nguyên là home
    { icon: "bookmark", label: "My Word", path: "/bookmark" }, // Giữ nguyên là home
    { icon: "quiz", label: "Test", path: "/test" }, // Đổi thành path test
    { icon: "settings", label: "Setting", path: "/setting" }, // Giữ nguyên là home
    { icon: "block", label: "Block", path: "/block" }, // Giữ nguyên là home
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
          <span className="material-symbols-outlined text-purple-600 text-3xl shrink-0">
            translate
          </span>
          {!isCollapsed && (
            <h2 className="text-2xl font-extrabold text-purple-600 whitespace-nowrap transition-all duration-300">
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
                    ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? menu.label : ""}
              >
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-200 ${
                    isActive(menu.path) ? "text-purple-700" : "text-gray-700"
                  }`}
                >
                  {menu.icon}
                </span>
                {!isCollapsed && (
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive(menu.path)
                        ? "text-purple-700"
                        : "text-gray-700"
                    }`}
                  >
                    {menu.label}
                  </span>
                )}

                {/* Tooltip khi collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {menu.label}
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