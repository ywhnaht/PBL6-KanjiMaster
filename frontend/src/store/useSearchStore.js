import { create } from "zustand";
import { getSearch } from "../apis/getSearch";
import { getSearchResult } from "../apis/getSearchResult";

const useSearchStore = create((set) => ({
  query: "",
  results: [],
  wordDetail: null,
  isLoading: false,
  compoundPage: 0,
  compoundTotalPages: 0,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setCompoundPage: (page) => set({ compoundPage: page }),
  reset: () =>
    set({
      query: "",
      results: [],
      wordDetail: null,
      isLoading: false,
      compoundPage: 0,
      compoundTotalPages: 0,
    }),

  // Gợi ý tìm kiếm
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

  // Chi tiết từ / kanji
// src/store/useSearchStore.js
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
        totalCompounds: res.totalCompoundResults || 0,
        examples: res.exampleResults || [],
        relatedResults: res.relatedResults || [],
        kanjis: res.kanjiResults.map((k) => ({
          ...k,
          sinoViet: k.sinoViet || k.hanViet || "",
          nativeViet: k.nativeViet || "",
        })),
      };
    }

    // ✅ Trường hợp tìm từ ghép
    else if (
      res.searchType === "compound_word" &&
      res.compoundResults?.length > 0
    ) {
      const mainCompound = res.compoundResults[0]; // chữ ghép chính
      let kanjiResults = res.kanjiResults || [];

      if (kanjiResults.length === 0) {
        const chars = mainCompound.word.split("");
        kanjiResults = await Promise.all(
          chars.map(async (ch) => {
            try {
              const detail = await getSearchResult(ch, 0, 1);
              if (detail.kanjiResults?.length > 0) {
                const k = detail.kanjiResults[0];
                return {
                  ...k,
                  sinoViet: k.sinoViet || k.hanViet || "",
                  nativeViet: k.nativeViet || "",
                };
              }
              return { kanji: ch, sinoViet: "", nativeViet: "" };
            } catch {
              return { kanji: ch, sinoViet: "", nativeViet: "" };
            }
          })
        );
      }

      apiWord = {
        // thông tin chữ ghép chính
        word: mainCompound.word,
        reading: mainCompound.reading,
        meaning: mainCompound.meaning || mainCompound.meaningEn,

        // ✅ giữ toàn bộ danh sách compounds
        compounds: res.compoundResults || [],
        totalCompounds: res.totalCompoundResults || 0,

        examples: res.exampleResults || [],
        relatedResults: res.relatedResults || [],
        kanjis: kanjiResults,
      };
    }

    set({
      wordDetail: apiWord,
      isLoading: false,
      compoundPage: page,
      compoundTotalPages: Math.ceil((res.totalCompoundResults || 0) / size),
    });
    return apiWord;
  } catch (error) {
    console.error("fetchWordDetail error:", error);
    set({ wordDetail: null, isLoading: false });
    return null;
  }
},

}));

export default useSearchStore;
