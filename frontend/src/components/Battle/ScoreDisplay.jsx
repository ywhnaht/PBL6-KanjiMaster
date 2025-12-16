import React, { memo } from 'react';
import { motion } from 'framer-motion';
import useDarkModeStore from '../../store/useDarkModeStore';

const ScoreDisplay = memo(({ player, opponent }) => {
  const isDark = useDarkModeStore((state) => state.isDark);

  return (
    <div className={`flex justify-between items-center rounded-xl p-4 mb-4 border transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-r from-slate-700/50 to-slate-700/30 border-slate-600'
        : 'bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 border-[#DA7B93]/20'
    }`}>
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-full mr-2 border-2 bg-gradient-to-br from-[#2F4454] to-[#DA7B93] flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'border-[#2F4454]' : 'border-[#2F4454]'
        }`}>
          <span className="material-symbols-outlined text-white text-lg">person</span>
        </div>
        <div>
          <p className={`font-bold text-sm transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-gray-800'
          }`}>{player.name}</p>
          <div className="flex items-center">
            <motion.span 
              key={`player-${player.score}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-bold text-lg text-[#2F4454]"
            >
              {player.score}
            </motion.span>
            <span className={`text-sm ml-1 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>điểm</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-full shadow-md">
        <span className="material-symbols-outlined text-yellow-300">swords</span>
        <span className="font-bold">VS</span>
      </div>
      
      <div className="flex items-center">
        <div className="text-right mr-2">
          <p className={`font-bold text-sm transition-colors duration-300 ${
            isDark ? 'text-slate-100' : 'text-gray-800'
          }`}>{opponent.name}</p>
          <div className="flex items-center justify-end">
            <motion.span 
              key={`opponent-${opponent.score}`}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="font-bold text-lg text-[#DA7B93]"
            >
              {opponent.score}
            </motion.span>
            <span className={`text-sm ml-1 transition-colors duration-300 ${
              isDark ? 'text-slate-400' : 'text-gray-500'
            }`}>điểm</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-full border-2 bg-gradient-to-br from-[#DA7B93] to-[#2F4454] flex items-center justify-center transition-colors duration-300 ${
          isDark ? 'border-[#DA7B93]' : 'border-[#DA7B93]'
        }`}>
          <span className="material-symbols-outlined text-white text-lg">person</span>
        </div>
      </div>
    </div>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';

export default ScoreDisplay;