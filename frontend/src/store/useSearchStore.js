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
  wordDetail: null,
  kanjiDetail: null,
  isLoading: false,
  compoundPage: 0,
  compoundTotalPages: 0,
  suggestCache: {},
  // THÊM: state mới để lưu ID hiện tại
  currentWordId: null,
  currentKanjiId: null,
  compoundKanjis: [],

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (isLoading) => set({ isLoading }),
  setCompoundPage: (page) => set({ compoundPage: page }),
  // THÊM: các function mới
  setCurrentWordId: (id) => set({ currentWordId: id }),
  setCurrentKanjiId: (id) => set({ currentKanjiId: id }),
  
  reset: () =>
    set({
      query: "",
      results: [],
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
      set({ results: [], isLoading: false });
      return [];
    }

    const { suggestCache } = get();
    if (suggestCache[searchValue]) {
      set({ results: suggestCache[searchValue], isLoading: false });
      return suggestCache[searchValue];
    }

    set({ isLoading: true });
    try {
      const res = await getSearch(searchValue);
      set((state) => ({
        results: res,
        isLoading: false,
        suggestCache: { ...state.suggestCache, [searchValue]: res },
      }));
      return res;
    } catch (error) {
      console.error("fetchSuggest error:", error);
      set({ results: [], isLoading: false });
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

      // THÊM: lưu kanjiId khi fetch thành công
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
      };

      // THÊM: lưu wordId khi fetch thành công
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
    console.log("🔥 fetchCompoundKanji called with id:", id); // log id
    if (!id) {
      console.warn("❌ fetchCompoundKanji: id is undefined or null");
      return [];
    }

    set({ isLoading: true });
    try {
      const kanjis = await getCompoundKanji(id);
      console.log("✅ Kanji fetched:", kanjis); // log kết quả
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