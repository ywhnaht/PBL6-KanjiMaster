import React from "react";

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm h-18 flex items-center justify-between px-8 border-b border-gray-200">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
        JLPT
      </h1>
      <div className="flex items-center gap-6">
        <button className="relative w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all duration-300 hover:shadow-md transform hover:scale-110">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center animate-pulse shadow-lg">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-2 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-amber-500 animate-bounce">
            local_fire_department
          </span>
          <span className="font-bold text-amber-700">12</span>
        </div>
        <button className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-100 to-primary-200 text-primary-600 font-bold flex items-center justify-center hover:from-primary-200 hover:to-primary-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110">
          TN
        </button>
      </div>
    </header>
  );
}
