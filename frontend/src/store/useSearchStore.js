// src/store/useSearchStore.js
import { create } from "zustand";
import { getSearch } from "../apis/getSearch";
import { getSearchResult } from "../apis/getSearchResult";

const useSearchStore = create((set) => ({
  query: "",
  results: [],
  wordDetail: null, // chi tiết từ / kanji
  isLoading: false,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({ query: "", results: [], wordDetail: null, isLoading: false }),

  fetchSuggest: async (searchValue) => {
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

  fetchWordDetail: async (searchValue, page = 0, size = 5) => {
    set({ isLoading: true });
    try {
      const res = await getSearchResult(searchValue, page, size);

      let apiWord = null;

      // ✅ Trường hợp tìm Kanji
      if (res.searchType === "kanji" && res.kanjiResults?.length > 0) {
        const kanji = res.kanjiResults[0];
        apiWord = {
          word: kanji.kanji,
          reading: kanji.joyoReading || kanji.kunyomi || kanji.onyomi,
          meaning: kanji.hanViet,
          compounds: res.compoundResults || [],
          examples: res.exampleResults || [],        // ✅ thêm
          relatedResults: res.relatedResults || [],  // ✅ thêm
          kanjis: res.kanjiResults || [],
        };
      }

      // ✅ Trường hợp tìm từ ghép (word)
      else if (
        res.searchType === "compound_word" &&
        res.compoundResults?.length > 0
      ) {
        const compound = res.compoundResults[0];
        apiWord = {
          word: compound.word,
          reading: compound.reading,
          meaning: compound.meaning || compound.meaningEn,
          compounds: res.compoundResults || [],
          examples: res.exampleResults || [],        // ✅ thêm
          relatedResults: res.relatedResults || [],  // ✅ thêm
          kanjis: [], // đảm bảo luôn có mảng rỗng
        };
      }

      set({ wordDetail: apiWord, isLoading: false });
      return apiWord;
    } catch (error) {
      console.error("fetchWordDetail error:", error);
      set({ wordDetail: null, isLoading: false });
      return null;
    }
  },
}));

export default useSearchStore;
