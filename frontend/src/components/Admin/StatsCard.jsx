import React from 'react';

const StatsCard = ({ icon, title, value, subtitle, trend, trendValue, color = 'slate' }) => {
  const getTrendColor = () => {
    if (!trend) return '';
    return trend === 'up' ? 'text-slate-600' : 'text-slate-500';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? '↑' : '↓';
  };

  const getColorClasses = () => {
    const colors = {
      blue: {
        gradient: 'from-slate-500 to-rose-400',
        text: 'text-slate-700',
        bg: 'bg-slate-50'
      },
      red: {
        gradient: 'from-slate-500 to-rose-400',
        text: 'text-slate-700',
        bg: 'bg-slate-50'
      },
      purple: {
        gradient: 'from-slate-500 to-rose-400',
        text: 'text-slate-700',
        bg: 'bg-slate-50'
      },
      green: {
        gradient: 'from-slate-500 to-rose-400',
        text: 'text-slate-700',
        bg: 'bg-slate-50'
      },
      slate: {
        gradient: 'from-slate-500 to-rose-400',
        text: 'text-slate-700',
        bg: 'bg-slate-50'
      }
    };
    return colors[color] || colors.slate;
  };

  const colorClasses = getColorClasses();

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-14 h-14 bg-gradient-to-br from-slate-500 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <span className="material-symbols-outlined text-3xl">{icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium mb-1 bg-gradient-to-r from-slate-500 to-rose-400 px-3 py-1 rounded-lg inline-block">{title}</p>
              <p className={`text-4xl font-bold bg-gradient-to-r from-slate-500 to-rose-400 bg-clip-text text-transparent`}>{value.toLocaleString()}</p>
            </div>
          </div>
          {subtitle && (
            <div className={`${colorClasses.bg} rounded-lg px-3 py-2 mt-3`}>
              <p className="text-sm text-gray-700 font-medium">{subtitle}</p>
            </div>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-3 ${getTrendColor()}`}>
              <span className="text-lg font-bold">{getTrendIcon()}</span>
              <span className="text-sm font-semibold">{trendValue}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
