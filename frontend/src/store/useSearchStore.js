// src/store/useSearchStore.js
import { create } from "zustand";
import { getSearch } from "../apis/getSearch";
import { getSearchResult, getCompoundKanjis } from "../apis/getSearchResult";
import _ from "lodash";

const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  wordDetail: null,
  isLoading: false,
  compoundPage: 0,
  compoundTotalPages: 0,
  suggestCache: {}, // cache tạm thời các từ đã search
  apiCallCount: 0, // ✅ số lần fetchSuggest được gọi

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
      apiCallCount: 0,
      suggestCache: {},
    }),

  // ✅ Debounce API call 500ms
  fetchSuggest: _.debounce(async (searchValue) => {
    const timestamp = new Date().toISOString();

    // tăng biến đếm mỗi khi debounce thực sự gọi API
    set((state) => ({ apiCallCount: state.apiCallCount + 1 }));
    const callNumber = get().apiCallCount;

    console.log(
      `🟢 [${timestamp}] fetchSuggest called (#${callNumber}) for: "${searchValue}"`
    );

    if (!searchValue.trim()) {
      set({ results: [], isLoading: false });
      console.log(`⚪ [${timestamp}] Empty search, cleared results`);
      return [];
    }

    const { suggestCache } = get();

    // Trả về cache nếu đã có
    if (suggestCache[searchValue]) {
      console.log(
        `♻️ [${timestamp}] Returning cached result for: "${searchValue}"`
      );
      set({ results: suggestCache[searchValue], isLoading: false });
      return suggestCache[searchValue];
    }

    set({ isLoading: true });
    try {
      const res = await getSearch(searchValue);
      const timestampAfter = new Date().toISOString();
      console.log(
        `✅ [${timestampAfter}] API returned for: "${searchValue}"`,
        res
      );

      set((state) => ({
        results: res,
        isLoading: false,
        suggestCache: { ...state.suggestCache, [searchValue]: res },
      }));

      return res;
    } catch (error) {
      const timestampErr = new Date().toISOString();
      console.error(
        `❌ [${timestampErr}] fetchSuggest error for: "${searchValue}"`,
        error
      );
      set({ results: [], isLoading: false });
      return [];
    }
  }, 500),

  // ✅ Fetch chi tiết Word/Kanji
  fetchWordDetail: async (searchValue, type = "word", page = 0, size = 6) => {
    set({ isLoading: true });
    try {
      const res = await getSearchResult(searchValue, page, size);
      console.log("🔍 API response for", searchValue, "type:", type, res);

      let apiWord = null;
      const isSingleKanji = searchValue.length === 1;

      // ✅ helper gom example lại
      const extractExamples = (res, type = "word") => {
        let examples = [];

        // --- Trường hợp Kanji ---
        if (type === "kanji" && res.kanjiResults?.length > 0) {
          for (let k of res.kanjiResults) {
            // từ kanjiExamples
            if (k.kanjiExamples?.length > 0) {
              examples = [
                ...examples,
                ...k.kanjiExamples.map((ex) => ({
                  id: ex.id,
                  sentence: ex.sentence,
                  reading: ex.reading || "",
                  meaning: ex.meaning || "",
                  source: "kanjiExample",
                  kanji: k.kanji,
                })),
              ];
            }

            // từ compoundWords trong kanjiResults
            if (k.compoundWords?.length > 0) {
              examples = [
                ...examples,
                ...k.compoundWords
                  .filter((cw) => cw.example)
                  .map((cw) => ({
                    id: cw.id,
                    sentence: cw.example,
                    reading: cw.hiragana || "",
                    meaning: cw.exampleMeaning || "",
                    source: "compoundWord",
                    kanji: k.kanji,
                  })),
              ];
            }
          }
        }

        // --- Trường hợp Word ---
        else {
          if (res.kanjiResults?.[0]?.kanjiExamples) {
            examples = [
              ...examples,
              ...res.kanjiResults[0].kanjiExamples.map((ex) => ({
                id: ex.id,
                sentence: ex.sentence,
                reading: ex.reading,
                meaning: ex.meaning,
                source: "kanjiExample",
                kanji: res.kanjiResults[0].kanji,
              })),
            ];
          }

          if (res.kanjiResults?.[0]?.compoundWords) {
            examples = [
              ...examples,
              ...res.kanjiResults[0].compoundWords
                .filter((cw) => cw.example)
                .map((cw) => ({
                  id: cw.id,
                  sentence: cw.example,
                  reading: cw.hiragana || "",
                  meaning: cw.exampleMeaning || "",
                  source: "compoundWord",
                  kanji: res.kanjiResults[0].kanji,
                })),
            ];
          }

          if (res.compoundResults) {
            examples = [
              ...examples,
              ...res.compoundResults
                .filter((cw) => cw.example)
                .map((cw) => ({
                  id: cw.id,
                  sentence: cw.example,
                  reading: cw.hiragana || "",
                  meaning: cw.exampleMeaning || "",
                  source: "compoundResult",
                  kanji: cw.word,
                })),
            ];
          }
        }

        return examples;
      };

      // --- Nếu là Word ---
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
            examples: extractExamples(res, "word"),
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
              examples: extractExamples(res, "word"),
              relatedResults: res.relatedResults || [],
            };
          }
        }
      }

      // --- Nếu là Kanji ---
      if (type === "kanji") {
        let kanjis = [];

        if (!isSingleKanji && res.compoundResults?.[0]) {
          try {
            kanjis = await getCompoundKanjis(res.compoundResults[0].id);
          } catch (err) {
            console.warn("Không lấy được kanji từ compound API:", err);
          }
        }

        if (kanjis.length === 0 && res.kanjiResults?.length > 0) {
          kanjis = res.kanjiResults;
        }

        let allCompounds = [];
        for (let k of kanjis) {
          try {
            const detail = await getSearchResult(k.kanji, 0, 5);
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
            // ✅ lưu nguyên kanjiExamples để render
            kanjiExamples: _.flatten(kanjis.map((k) => k.kanjiExamples || [])),
            examples: extractExamples(res, "kanji"), // gom tất cả ví dụ
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
