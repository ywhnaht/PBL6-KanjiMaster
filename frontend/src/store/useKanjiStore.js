import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getKanjiLevel } from "../apis/getKanjiLevel";
import useAuthStore from "./useAuthStore";

const useKanjiStore = create(
  persist(
    (set, get) => ({
      // --- Kanji state ---
      kanjiItems: [],
      pagination: {
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        pageSize: 10,
      },
      loading: false,
      error: null,

      // 🎯 Helper kiểm tra đăng nhập
      isLoggedIn: () => {
        try {
          const authStore = useAuthStore.getState();
          return !!(authStore.accessToken && authStore.user);
        } catch (error) {
          console.error("Error checking login status:", error);
          return false;
        }
      },

      // 🎯 Lấy user ID từ auth store
      getUserId: () => {
        try {
          const authStore = useAuthStore.getState();
          return authStore.user?.id || null;
        } catch (error) {
          console.error("Error getting user ID:", error);
          return null;
        }
      },

      // --- Kanji actions ---
      fetchKanjiByLevel: async ({ level, page = 0, size = 50 }) => {
        set({ loading: true, error: null });
        try {
          const userId = get().getUserId();

          const response = await getKanjiLevel({
            level,
            userId: userId || null,
            page,
            size,
          });

          console.log(`Fetch kanji for level ${level}:`, response);

          let items = [];
          let paginationData = {};

          // 🎯 Xử lý response structure từ API
          if (response.success && response.data) {
            items = response.data.items || [];
            paginationData = {
              currentPage: response.data.currentPage ?? page,
              totalPages: response.data.totalPages ?? 0,
              totalItems: response.data.totalItems ?? 0,
              pageSize: response.data.pageSize ?? size,
            };
          } else {
            console.warn("API response indicates failure:", response);
            items = [];
            paginationData = {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              pageSize: size,
            };
          }

          console.log(`Processed ${items.length} items for level ${level}`);

          set({
            kanjiItems: items,
            pagination: paginationData,
          });

          return {
            items,
            pagination: paginationData,
            success: response.success,
            message: response.message,
          };
        } catch (error) {
          console.error("Failed to fetch kanji:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch kanji data";

          set({
            error: errorMessage,
            kanjiItems: [],
            pagination: {
              currentPage: 0,
              totalPages: 0,
              totalItems: 0,
              pageSize: 10,
            },
          });
          return {
            items: [],
            pagination: {},
            success: false,
            error: errorMessage,
          };
        } finally {
          set({ loading: false });
        }
      },

      // 🎯 Kiểm tra xem một kanji có phải đã học không (MASTERED)
      isKanjiLearned: (kanji) => {
        if (!kanji) return false;

        const state = get();
        const kanjiItem = state.kanjiItems.find(
          (item) => item && item.kanji === kanji
        );

        return kanjiItem ? kanjiItem.status === "MASTERED" : false;
      },

      // Fetch all kanji by level (pagination)
      fetchAllKanjiByLevel: async ({ level, size = 100 }) => {
        set({ loading: true, error: null });
        try {
          let allItems = [];
          let currentPage = 0;
          let hasMore = true;

          const userId = get().getUserId();

          while (hasMore) {
            const response = await getKanjiLevel({
              level,
              userId: userId || null,
              page: currentPage,
              size,
            });

            console.log(
              `Fetching page ${currentPage} for level ${level}:`,
              response
            );

            let items = [];
            let totalPages = 0;

            if (response.success && response.data) {
              items = response.data.items || [];
              totalPages = response.data.totalPages || 0;
            }

            if (items.length > 0) {
              allItems = [...allItems, ...items];
              currentPage++;
              hasMore = currentPage < totalPages && items.length === size;
            } else {
              hasMore = false;
            }
          }

          console.log(
            `Fetched total ${allItems.length} items for level ${level}`
          );

          set({
            kanjiItems: allItems,
            pagination: {
              currentPage: 0,
              totalPages: 1,
              totalItems: allItems.length,
              pageSize: allItems.length,
            },
          });

          return allItems;
        } catch (error) {
          console.error("Failed to fetch all kanji:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch kanji data";

          set({
            error: errorMessage,
            kanjiItems: [],
          });
          return [];
        } finally {
          set({ loading: false });
        }
      },

      // 🆕 THÊM HOẶC CẬP NHẬT ACTION NÀY
      updateKanjiStatus: (kanjiId, newStatus) => {
        set((state) => {
          // Cập nhật trong kanjiItems
          const updatedKanjiItems = state.kanjiItems.map((item) =>
            item.id === kanjiId ? { ...item, status: newStatus } : item
          );

          console.log(
            `🔄 Updated kanji ${kanjiId} status to ${newStatus} in store`,
            {
              before: state.kanjiItems.find((item) => item.id === kanjiId)
                ?.status,
              after: newStatus,
              totalItems: updatedKanjiItems.length,
            }
          );

          return {
            kanjiItems: updatedKanjiItems,
          };
        });
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Clear kanji items
      clearKanjiItems: () =>
        set({
          kanjiItems: [],
          pagination: {
            currentPage: 0,
            totalPages: 0,
            totalItems: 0,
            pageSize: 10,
          },
        }),
    }),
    {
      name: "kanji-storage",
      // 🎯 CẦN LƯU TRỮ ĐỂ TRÁNH GỌI API NHIỀU LẦN
      partialize: (state) => ({
        kanjiItems: state.kanjiItems,
        pagination: state.pagination,
      }),
    }
  )
);

export default useKanjiStore;
