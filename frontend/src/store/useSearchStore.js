import { create } from "zustand";
import { getSearch } from "../apis/getSearch";

const useSearchStore = create((set) => ({
  query: "",
  results: [],
  isLoading: false,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ query: "", results: [], isLoading: false }),

  fetchResults: async (searchValue) => {
    set({ isLoading: true });
    try {
      const res = await getSearch(searchValue);
      set({ results: res, isLoading: false });
      return res;
    } catch {
      set({ results: [], isLoading: false });
      return [];
    }
  },
}));

export default useSearchStore;
