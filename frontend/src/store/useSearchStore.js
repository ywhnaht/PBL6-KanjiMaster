// src/store/useSearchStore.js
import { create } from "zustand";
import { getSearch } from "../apis/getSearch";
import { getSearchResult, getCompoundKanjis } from "../apis/getSearchResult";

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

  fetchWordDetail: async (searchValue, type = "word", page = 0, size = 5) => {
    set({ isLoading: true });
    try {
      const res = await getSearchResult(searchValue, page, size);

      // ✅ In ra console toàn bộ response để debug
      console.log("🔍 API response for", searchValue, "type:", type, res);

      let apiWord = null;
      const isSingleKanji = searchValue.length === 1;

      if (type === "word") {
        if (isSingleKanji && res.kanjiResults?.[0]) {
          const mainKanji = res.kanjiResults[0];
          apiWord = {
            id: mainKanji.id,
            word: mainKanji.kanji,
            hiragana:
              mainKanji.joyoReading ||
              mainKanji.kunyomi ||
              mainKanji.onyomi ||
              "",
            meaning: mainKanji.hanViet || "",
            compounds: res.compoundResults || [],
            examples: res.exampleResults || [],
            relatedResults: res.relatedResults || [],
          };
        } else {
          const mainWord = res.compoundResults?.[0] || null;
          if (mainWord) {
            apiWord = {
              id: mainWord.id,
              word: mainWord.word,
              hiragana: mainWord.hiragana || "",
              meaning: mainWord.meaning || mainWord.meaningEn || "",
              compounds: res.compoundResults || [],
              examples: res.exampleResults || [],
              relatedResults: res.relatedResults || [],
            };
          }
        }
      }

      if (type === "kanji") {
        let kanjis = [];

        if (!isSingleKanji) {
          if (res.compoundResults?.[0]) {
            try {
              kanjis = await getCompoundKanjis(res.compoundResults[0].id);
              console.log("📦 Compound Kanjis API:", kanjis);
            } catch (err) {
              console.warn("Không lấy được kanji từ compound API:", err);
            }
          }
        }

        if (kanjis.length === 0 && res.kanjiResults?.length > 0) {
          kanjis = res.kanjiResults;
        }

        let allCompounds = [];
        for (let k of kanjis) {
          try {
            const detail = await getSearchResult(k.kanji, 0, 5);
            console.log(`📚 Compounds for kanji ${k.kanji}:`, detail.compoundResults);
            if (detail.compoundResults) {
              allCompounds = [...allCompounds, ...detail.compoundResults];
            }
          } catch (err) {
            console.warn(`Không lấy được từ ghép cho kanji ${k.kanji}:`, err);
          }
        }

        if (kanjis.length > 0) {
          apiWord = {
            id: kanjis[0].id,
            kanjis: kanjis.map((k) => ({
              ...k,
              sinoViet: k.sinoViet || k.hanViet || "",
              nativeViet: k.nativeViet || "",
              svgUrl: `http://localhost:8080/api/v1/kanji/${k.id}/svg`,
            })),
            examples: res.exampleResults || [],
            compounds: allCompounds,
            relatedResults: res.relatedResults || [],
          };
        }
      }

      set({
        wordDetail: apiWord,
        isLoading: false,
        compoundPage: page,
        compoundTotalPages: Math.ceil((res.totalCompoundResults || 0) / size),
      });

      return apiWord;
    } catch (error) {
      console.error("❌ fetchWordDetail error:", error);
      set({ wordDetail: null, isLoading: false });
      return null;
    }
  },
}));

export default useSearchStore;
