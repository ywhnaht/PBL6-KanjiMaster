import { useEffect } from 'react';
import AppRoutes from './routers';
import useDarkModeStore from '../src/store/useDarkModeStore';

function App() {
  const isDark = useDarkModeStore((state) => state.isDark);
  const initializeDarkMode = useDarkModeStore((state) => state.initializeDarkMode);

  useEffect(() => {
    initializeDarkMode();
  }, [initializeDarkMode]);

  return (
    <div className={`transition-all duration-300 w-screen h-screen ${
      isDark 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-white text-gray-900'
    }`}>
      <AppRoutes />
    </div>
  );
}

export default App;