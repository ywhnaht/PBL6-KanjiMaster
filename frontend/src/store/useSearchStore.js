import { create } from "zustand";
import {
  getSearch,
  getKanjiDetail,
  getCompoundDetail,
  getCompoundKanji,
} from "../apis/getSearch";
import _ from "lodash";

const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  searchResults: [], // 🆕 Lưu toàn bộ kết quả từ API search (với type)
  wordDetail: null,
  kanjiDetail: null,
  isLoading: false,
  compoundPage: 0,
  compoundTotalPages: 0,
  suggestCache: {},
  currentWordId: null,
  currentKanjiId: null,
  compoundKanjis: [],

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setCompoundPage: (page) => set({ compoundPage: page }),
  setCurrentWordId: (id) => set({ currentWordId: id }),
  setCurrentKanjiId: (id) => set({ currentKanjiId: id }),
  
  reset: () =>
    set({
      query: "",
      results: [],
      searchResults: [], // 🆕
      wordDetail: null,
      kanjiDetail: null,
      isLoading: false,
      compoundPage: 0,
      compoundTotalPages: 0,
      suggestCache: {},
      currentWordId: null,
      currentKanjiId: null,
      compoundKanjis: [],
    }),

  // --- fetchSuggest với debounce ---
  fetchSuggest: _.debounce(async (searchValue) => {
    if (!searchValue.trim()) {
      set({ results: [], searchResults: [], isLoading: false });
      return [];
    }

    const { suggestCache } = get();
    if (suggestCache[searchValue]) {
      const cached = suggestCache[searchValue];
      set({ 
        results: cached, 
        searchResults: cached, // 🆕 Lưu full results
        isLoading: false 
      });
      return cached;
    }

    set({ isLoading: true });
    try {
      const res = await getSearch(searchValue);
      set((state) => ({
        results: res,
        searchResults: res, // 🆕 Lưu full results
        isLoading: false,
        suggestCache: { ...state.suggestCache, [searchValue]: res },
      }));
      return res;
    } catch (error) {
      console.error("fetchSuggest error:", error);
      set({ results: [], searchResults: [], isLoading: false });
      return [];
    }
  }, 500),

  // --- fetch chi tiết Kanji ---
  fetchKanjiDetail: async (idOrText) => {
    set({ isLoading: true });
    try {
      const data = await getKanjiDetail(idOrText);
      if (!data) {
        set({ kanjiDetail: null, isLoading: false });
        return null;
      }

      // thêm url svg trực tiếp nếu có
      if (data.initials?.svgLink) {
        data.initials.svgUrl = data.initials.svgLink;
      }

      set({ 
        kanjiDetail: data, 
        wordDetail: null, 
        isLoading: false,
        currentKanjiId: idOrText // Lưu ID kanji hiện tại
      });
      return data;
    } catch (error) {
      console.error("fetchKanjiDetail error:", error);
      set({ kanjiDetail: null, isLoading: false });
      return null;
    }
  },

  // --- fetch chi tiết Compound / Word ---
  fetchCompoundDetail: async (id) => {
    set({ isLoading: true });
    try {
      const data = await getCompoundDetail(id);
      if (!data) {
        set({ wordDetail: null, isLoading: false });
        return null;
      }

      // chuẩn hóa data để render trong WordResult
      const wordDetail = {
        id: data.id,
        word: data.word,
        hiragana: data.hiragana || "",
        meaning: data.meaning || "",
        meaningEn: data.meaningEn || "",
        examples: data.example
          ? [{ example: data.example, meaning: data.exampleMeaning }]
          : [],
        relatedWords: data.relatedWords || [],
      };

      set({ 
        wordDetail, 
        kanjiDetail: null, 
        isLoading: false,
        currentWordId: id // Lưu ID word hiện tại
      });
      return wordDetail;
    } catch (error) {
      console.error("fetchCompoundDetail error:", error);
      set({ wordDetail: null, isLoading: false });
      return null;
    }
  },

  // --- fetch chi tiết Compound -> Kanji ---
  fetchCompoundKanji: async (id) => {
    console.log("🔥 fetchCompoundKanji called with id:", id);
    if (!id) {
      console.warn("❌ fetchCompoundKanji: id is undefined or null");
      return [];
    }

    set({ isLoading: true });
    try {
      const kanjis = await getCompoundKanji(id);
      console.log("✅ Kanji fetched:", kanjis);
      set({ compoundKanjis: kanjis, isLoading: false });
      return kanjis;
    } catch (error) {
      console.error(
        "fetchCompoundKanji error:",
        error.response?.data || error.message
      );
      set({ compoundKanjis: [], isLoading: false });
      return [];
    }
  },
}));

export default useSearchStore;