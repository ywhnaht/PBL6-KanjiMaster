import { create } from 'zustand';

const useSidebarStore = create((set) => ({
  isCollapsed: false,
  setIsCollapsed: (value) => set({ isCollapsed: value }),
  toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

export default useSidebarStore;
