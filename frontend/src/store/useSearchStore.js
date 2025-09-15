import { create } from "zustand";
import { getSearch } from "../apis/getSearch"; // import API call

const useSearchStore = create((set) => ({
  query: "",
  results: [],
  isLoading: false,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ query: "", results: [], isLoading: false }),

  // ✅ fetch từ API
  fetchResults: async (value) => {
    set({ isLoading: true });
    try {
      const results = await getSearch(value);
      set({ results, isLoading: false });
    } catch (err) {
      console.error("Fetch results failed:", err);
      set({ results: [], isLoading: false });
    }
  },
}));

export default useSearchStore;
