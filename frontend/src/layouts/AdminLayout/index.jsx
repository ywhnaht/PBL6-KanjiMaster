import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Header from '../Header';
import useDarkModeStore from '../../store/useDarkModeStore';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isDark = useDarkModeStore((state) => state.isDark);

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar on left - full height */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main content area on right - uses margin to avoid overlap */}
      <div 
        className="flex-1 flex flex-col"
        style={{
          marginLeft: isCollapsed ? '72px' : '240px',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header at top of right side - fixed */}
        <div className="fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out" style={{
          left: isCollapsed ? '72px' : '240px',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <Header />
        </div>
        
        {/* Main content with padding top to avoid header overlap */}
        <main className={`flex-1 p-8 pt-[88px] transition-all duration-300 ${isDark ? 'text-gray-100' : ''}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
