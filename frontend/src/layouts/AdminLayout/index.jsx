import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Header from '../Header';

const AdminLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar on left - full height */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main content area on right - uses margin to avoid overlap */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isCollapsed ? 'ml-[72px]' : 'ml-[240px]'
      }`}>
        {/* Header at top of right side - fixed */}
        <div className="fixed top-0 right-0 z-30 transition-all duration-300" style={{
          left: isCollapsed ? '72px' : '240px'
        }}>
          <Header />
        </div>
        
        {/* Main content with padding top to avoid header overlap */}
        <main className="flex-1 p-8 pt-[88px] transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
