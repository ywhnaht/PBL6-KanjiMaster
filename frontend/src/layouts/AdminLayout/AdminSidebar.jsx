import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminSidebar({ isCollapsed, setIsCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { icon: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "group", label: "Users", path: "/admin/users" },
    { icon: "translate", label: "Kanji", path: "/admin/kanji" },
    { icon: "menu_book", label: "Compounds", path: "/admin/compounds" },
    { icon: "home", label: "Back to Home", path: "/home", highlight: true },
  ];

  const isActive = (menuPath) => {
    return location.pathname === menuPath;
  };

  return (
    <div
      className={`bg-white shadow-xl transition-all duration-300 ease-in-out shrink-0 fixed left-0 top-0 bottom-0 flex flex-col border-r border-gray-200 z-40 ${
        isCollapsed ? "w-[72px]" : "w-[240px]"
      } overflow-x-hidden`}
    >
      {/* Header */}
      <div className="border-b border-gray-200 transition-all duration-300 h-[72px] flex items-center px-5">
        <div
          className={`flex items-center gap-2 w-full ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <span className="material-symbols-outlined text-slate-500 text-3xl shrink-0">
            admin_panel_settings
          </span>
          {!isCollapsed && (
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300">
              Admin Panel
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
                    ? "bg-gradient-to-r from-slate-500/20 to-rose-500/10 text-rose-500 shadow-sm border border-slate-500/30"
                    : menu.highlight
                    ? "text-gray-700 hover:bg-gradient-to-r hover:from-[#DA7B93]/10 hover:to-[#2F4454]/10 hover:text-[#2F4454] border border-[#DA7B93]/20"
                    : "text-gray-700 hover:bg-slate-500/5 hover:text-rose-500"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? menu.label : ""}
              >
                <span
                  className={`material-symbols-outlined text-xl shrink-0 transition-colors duration-200 ${
                    isActive(menu.path) 
                      ? "text-slate-500" 
                      : menu.highlight 
                      ? "text-[#DA7B93] group-hover:text-[#2F4454]"
                      : "text-gray-700 group-hover:text-rose-500"
                  }`}
                >
                  {menu.icon}
                </span>
                {!isCollapsed && (
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${
                      isActive(menu.path)
                        ? "text-rose-500 font-semibold"
                        : menu.highlight
                        ? "text-[#2F4454] group-hover:text-[#2F4454]"
                        : "text-gray-700 group-hover:text-rose-500"
                    }`}
                  >
                    {menu.label}
                  </span>
                )}

                {/* Tooltip khi collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {menu.label}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-rose-500"></div>
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
          className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-slate-500/5 hover:bg-slate-500/10 transition-all duration-200 group"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span
            className={`material-symbols-outlined transition-transform duration-300 text-slate-500 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          >
            {isCollapsed ? "menu" : "menu_open"}
          </span>
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap transition-all duration-300 text-slate-500">
              Collapse
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

