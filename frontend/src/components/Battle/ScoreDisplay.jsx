import React, { memo } from 'react';
import { motion } from 'framer-motion';

const ScoreDisplay = memo(({ player, opponent }) => {
  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-[#2F4454]/10 to-[#DA7B93]/10 rounded-xl p-4 mb-4 border border-[#DA7B93]/20">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full mr-2 border-2 border-[#2F4454] bg-gradient-to-br from-[#2F4454] to-[#DA7B93] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">person</span>
        </div>
        <div>
          <p className="font-bold text-sm">{player.name}</p>
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
            <span className="text-gray-500 text-sm ml-1">điểm</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#2F4454] to-[#DA7B93] text-white rounded-full shadow-md">
        <span className="material-symbols-outlined text-yellow-300">swords</span>
        <span className="font-bold">VS</span>
      </div>
      
      <div className="flex items-center">
        <div className="text-right mr-2">
          <p className="font-bold text-sm">{opponent.name}</p>
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
            <span className="text-gray-500 text-sm ml-1">điểm</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full border-2 border-[#DA7B93] bg-gradient-to-br from-[#DA7B93] to-[#2F4454] flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-lg">person</span>
        </div>
      </div>
    </div>
  );
});

ScoreDisplay.displayName = 'ScoreDisplay';

export default ScoreDisplay;
