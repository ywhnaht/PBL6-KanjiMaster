import React, { useState } from "react";

export default function Sidebar() {
  const [activeIndex, setActiveIndex] = useState(0); // JLPT là index 2

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
    <div className="bg-white/90 shadow-xl transition-all duration-300 w-[240px] shrink-0 h-full flex flex-col border-r border-gray-200 backdrop-blur-sm">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-2xl font-extrabold text-purple-600 flex items-center gap-2 hover:text-purple-700 transition-all duration-300">
          <span className="material-symbols-outlined animate-pulse transition-transform hover:rotate-12">
            translate
          </span>
          Kanji Smart
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-3 px-4">
          {menus.map((m, idx) => (
            <li key={idx}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveIndex(idx);
                }}
                className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 hover:translate-x-1 ${
                  activeIndex === idx
                    ? "bg-gradient-to-r from-purple-50 to-purple-200 text-primary-600 font-medium shadow-sm hover:shadow-md"
                    : "text-gray-800 hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-xl ${
                    activeIndex === idx ? "text-primary-600" : "text-gray-800"
                  }`}
                >
                  {m.icon}
                </span>
                <span
                  className={`font-medium ${
                    activeIndex === idx ? "text-primary-600" : "text-gray-800"
                  }`}
                >
                  {m.label}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-5 border-t border-gray-200">
        <button className="w-full flex items-center justify-center p-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:shadow-md transform hover:scale-105">
          <span className="material-symbols-outlined">menu_open</span>
        </button>
      </div>
    </div>
  );
}
