import { create } from 'zustand';

const useDarkModeStore = create((set, get) => ({
  isDark: false,

  isDarkMode: () => get().isDark,

  toggleDarkMode: () => {
    const currentState = get().isDark;
    const newDarkMode = !currentState;
    
    // ✅ CẬP NHẬT DOM NGAY LẬP TỨC (trước khi state update)
    updateDOMImmediately(newDarkMode);
    
    // ✅ Sau đó mới update state (để trigger re-render)
    set({ isDark: newDarkMode });
    localStorage.setItem('darkMode', String(newDarkMode));
  },

  initializeDarkMode: () => {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved !== null 
      ? saved === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // ✅ Update DOM ngay lập tức
    updateDOMImmediately(isDark);
    
    set({ isDark });
  },
}));

// ✅ Helper function - cập nhật DOM NGAY LẬP TỨC (không chờ re-render)
const updateDOMImmediately = (isDark) => {
  // Thêm/bỏ class dark từ HTML element
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Cập nhật CSS variables toàn cục
  const root = document.documentElement;
  if (isDark) {
    root.style.setProperty('--bg-primary', '#0f172a');
    root.style.setProperty('--text-primary', '#e5e7eb');
    root.style.setProperty('--bg-secondary', '#1e293b');
  } else {
    root.style.setProperty('--bg-primary', '#ffffff');
    root.style.setProperty('--text-primary', '#213547');
    root.style.setProperty('--bg-secondary', '#f8f9fa');
  }
};

export default useDarkModeStore;