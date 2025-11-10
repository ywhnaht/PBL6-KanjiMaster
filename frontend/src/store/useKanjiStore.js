import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getKanjiLevel } from "../apis/getKanjiLevel";
import { useAuthStore } from "./useAuthStore";
import Cookies from "js-cookie";

// 🎯 API function cho progress summary
const getProgressSummary = async (axios) => {
  try {
    // API endpoint: /api/v1/users/progress/summary
    const response = await axios.get('/api/v1/users/progress/summary');
    return response.data;
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    throw error;
  }
};

const cookiesStorage = {
  getItem: (name) => {
    try {
      const cookieValue = Cookies.get(name);
      return cookieValue ? JSON.parse(cookieValue) : null;
    } catch (error) {
      console.error("Error reading cookie:", error);
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      Cookies.set(name, JSON.stringify(value), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    } catch (error) {
      console.error("Error setting cookie:", error);
    }
  },
  removeItem: (name) => {
    try {
      Cookies.remove(name);
    } catch (error) {
      console.error("Error removing cookie:", error);
    }
  },
};

const useKanjiStore = create(
  persist(
    (set, get) => ({
      // --- Kanji state ---
      kanjiItems: [],
      allKanjiCache: {},
      pagination: {
        currentPage: -1,
        totalPages: 0,
        totalItems: 0,
        pageSize: 10,
      },
      loading: false,
      error: null,

      // 🎯 Lưu thêm userId và level để quản lý cache theo user
      currentUserId: null,
      currentLevel: null,

      // 🎯 State cho level đang active (chỉ UI)
      activeLevel: "N5",

      // 🎯 State mới cho progress summary
      progressSummary: {
        N1: 0,
        N2: 0,
        N3: 0,
        N4: 0,
        N5: 0
      },
      summaryLoading: false,
      summaryError: null,

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
      // 🎯 SỬA: Tách hàm setActiveLevel để thay đổi level UI mà không fetch data
      setActiveLevel: (level) => {
        set({ activeLevel: level });
      },

      // 🎯 ACTION: Fetch progress summary
      fetchSummary: async (axios) => {
        set({ summaryLoading: true, summaryError: null });
        
        try {
          console.log("🎯 Fetching progress summary...");
          
          const response = await getProgressSummary(axios);
          
          console.log("✅ Progress summary response:", response);

          if (response.success && response.data) {
            set({
              progressSummary: {
                N1: response.data.N1 || 0,
                N2: response.data.N2 || 0,
                N3: response.data.N3 || 0,
                N4: response.data.N4 || 0,
                N5: response.data.N5 || 0
              },
              summaryError: null
            });

            return {
              success: true,
              data: response.data,
              message: response.message || "Progress summary fetched successfully"
            };
          } else {
            throw new Error(response.message || "Failed to fetch progress summary");
          }
        } catch (error) {
          console.error("❌ Failed to fetch progress summary:", error);
          
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             "Failed to fetch progress summary";

          set({ 
            summaryError: errorMessage,
            progressSummary: {
              N1: 0,
              N2: 0,
              N3: 0,
              N4: 0,
              N5: 0
            }
          });

          return {
            success: false,
            error: errorMessage,
            data: null
          };
        } finally {
          set({ summaryLoading: false });
        }
      },

      // 🎯 ACTION: Clear summary data
      clearSummary: () => set({
        progressSummary: {
          N1: 0,
          N2: 0,
          N3: 0,
          N4: 0,
          N5: 0
        },
        summaryError: null,
        summaryLoading: false
      }),

      // 🎯 Helper để lấy learned count theo level
      getLearnedCountByLevel: (level) => {
        const state = get();
        return state.progressSummary[level] || 0;
      },

      // 🎯 Helper để lấy tổng số kanji đã học
      getTotalLearnedCount: () => {
        const state = get();
        const summary = state.progressSummary;
        return summary.N1 + summary.N2 + summary.N3 + summary.N4 + summary.N5;
      },

      // 🎯 SỬA: Fetch kanji với cache thông minh hơn
      fetchKanjiByLevel: async ({
        axios,
        level,
        page = 0,
        size = 10,
        forceRefresh = false,
      }) => {
        set({ loading: true, error: null });
        try {
          const state = get();
          const currentUser = useAuthStore.getState().user;
          const userId = currentUser?.id || null;
          const apiLevel = String(level);

          console.log(`🎯 Fetching kanji - Level: ${apiLevel}, Page: ${page}, Size: ${size}`);

          // 🎯 CHỈ CLEAR CACHE KHI THỰC SỰ CẦN THIẾT (user thay đổi)
          if (state.currentUserId !== userId) {
            console.log(`🔄 User changed from ${state.currentUserId} to ${userId}, clearing cache`);
            set({
              currentUserId: userId,
              allKanjiCache: {},
            });
          }

          // 🎯 KIỂM TRA CACHE CHO TRANG CỤ THỂ
          const cacheKey = `${apiLevel}_${page}`;
          const cachedData = state.allKanjiCache[cacheKey];

          if (!forceRefresh && cachedData) {
            console.log(`📦 Using cached data for level ${apiLevel}, page ${page}`);
            
            set({
              kanjiItems: cachedData.items,
              pagination: {
                currentPage: page,
                totalPages: cachedData.totalPages,
                totalItems: cachedData.totalItems,
                pageSize: cachedData.pageSize,
              },
              currentLevel: apiLevel,
              error: null,
            });

            return {
              items: cachedData.items,
              pagination: state.pagination,
              success: true,
              message: "Using cached data for this page",
            };
          }

          // 🎯 GỌI API VỚI AXIOSPRIVATE
          const response = await getKanjiLevel(axios, {
            level: apiLevel,
            page,
            size,
          });

          console.log(`✅ API Response for level ${apiLevel}, page ${page}:`, response);

          let items = [];
          let paginationData = {};

          if (response.success && response.data) {
            items = response.data.items || [];
            paginationData = {
              currentPage: response.data.currentPage ?? page,
              totalPages: response.data.totalPages ?? 1,
              totalItems: response.data.totalItems ?? items.length,
              pageSize: response.data.pageSize ?? size,
            };
            
            // Cập nhật allKanjiCache
            const newCache = { ...state.allKanjiCache };
            newCache[cacheKey] = {
              items: items,
              totalPages: paginationData.totalPages,
              totalItems: paginationData.totalItems,
              pageSize: paginationData.pageSize,
            };

            set({
              kanjiItems: items,
              pagination: paginationData,
              currentLevel: apiLevel,
              allKanjiCache: newCache,
              error: null,
            });

            return {
              items,
              pagination: paginationData,
              success: true,
              message: response.message || "Data fetched successfully",
            };
          } else {
            throw new Error(response.message || "API returned failure.");
          }
        } catch (error) {
          console.error("❌ Failed to fetch kanji:", error);
          const errorMessage = error.response?.data?.message || error.message || "Failed to fetch kanji data";

          set({
            error: errorMessage,
            kanjiItems: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              pageSize: size,
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
        const authState = useAuthStore.getState();
        const currentUser = authState.user;

        if (state.currentUserId !== currentUser?.id || !state.currentLevel) {
          return false;
        }

        const kanjiItem = state.kanjiItems.find(
          (item) => item && (item.kanji === kanji || item.character === kanji)
        );

        return kanjiItem ? kanjiItem.status === "MASTERED" : false;
      },

      // 🎯 Lấy trạng thái của một kanji cụ thể
      getKanjiStatus: (kanji) => {
        if (!kanji) return "NOT_LEARNED";
        
        const state = get();
        const authState = useAuthStore.getState();
        const currentUser = authState.user;

        if (state.currentUserId !== currentUser?.id || !state.currentLevel) {
          return "NOT_LEARNED";
        }

        const kanjiItem = state.kanjiItems.find(
          (item) => item && (item.kanji === kanji || item.character === kanji)
        );

        return kanjiItem?.status || "NOT_LEARNED";
      },
      
      // 🎯 Cập nhật trạng thái kanji trong store
      updateKanjiStatus: (kanjiId, newStatus) => {
        set((state) => {
          const authState = useAuthStore.getState();
          const currentUser = authState.user;

          if (state.currentUserId !== currentUser?.id) {
            console.warn("❌ Cannot update kanji status: user mismatch");
            return state;
          }

          const updatedKanjiItems = state.kanjiItems.map((item) =>
            item.id === kanjiId ? { ...item, status: newStatus } : item
          );
          
          // Cập nhật cache
          const cacheKey = `${state.currentLevel}_${state.pagination.currentPage}`;
          const currentCache = state.allKanjiCache[cacheKey];
          
          let newCache = { ...state.allKanjiCache };

          if(currentCache) {
            const updatedCacheItems = currentCache.items.map((item) =>
                item.id === kanjiId ? { ...item, status: newStatus } : item
            );
            newCache[cacheKey] = { ...currentCache, items: updatedCacheItems };
          }

          console.log(`🔄 Updated kanji ${kanjiId} status to ${newStatus}`);

          return {
            kanjiItems: updatedKanjiItems,
            allKanjiCache: newCache,
          };
        });
      },

      // 🎯 Cập nhật nhiều kanji cùng lúc
      updateMultipleKanjiStatus: (updates) => {
        set((state) => {
          const authState = useAuthStore.getState();
          const currentUser = authState.user;

          if (state.currentUserId !== currentUser?.id) {
            console.warn("❌ Cannot update multiple kanji statuses: user mismatch");
            return state;
          }

          const updatedKanjiItems = state.kanjiItems.map((item) => {
            const update = updates.find((update) => update.kanjiId === item.id);
            return update ? { ...item, status: update.newStatus } : item;
          });
          
          // Cập nhật cache
          const cacheKey = `${state.currentLevel}_${state.pagination.currentPage}`;
          const currentCache = state.allKanjiCache[cacheKey];
          let newCache = { ...state.allKanjiCache };

          if(currentCache) {
            const updatedCacheItems = currentCache.items.map((item) => {
                const update = updates.find((update) => update.kanjiId === item.id);
                return update ? { ...item, status: update.newStatus } : item;
            });
            newCache[cacheKey] = { ...currentCache, items: updatedCacheItems };
          }

          console.log(`✅ Updated ${updates.length} kanji statuses for user ${currentUser?.id}`);

          return {
            kanjiItems: updatedKanjiItems,
            allKanjiCache: newCache,
          };
        });
      },

      // 🎯 Force refresh data
      forceRefresh: () => {
        set((state) => ({
          kanjiItems: [],
          pagination: {
            currentPage: -1,
            totalPages: 0,
            totalItems: 0,
            pageSize: state.pagination.pageSize || 10,
          },
          allKanjiCache: {},
        }));
      },

      // 🎯 Kiểm tra cache validity
      isCacheValid: (level, page) => {
        const state = get();
        const authState = useAuthStore.getState();
        const currentUser = authState.user;

        return (
          state.currentUserId === currentUser?.id &&
          state.currentLevel === String(level) &&
          state.pagination.currentPage === page &&
          state.kanjiItems.length > 0
        );
      },

      // Clear error
      clearError: () => set({ error: null }),

      // 🎯 SỬA: Clear kanji items khi user logout (thêm clear summary)
      clearKanjiItems: () =>
        set({
          kanjiItems: [],
          allKanjiCache: {},
          pagination: { currentPage: -1, totalPages: 0, totalItems: 0, pageSize: 10 },
          error: null,
          currentUserId: null,
          currentLevel: null,
          activeLevel: "N5",
          progressSummary: { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0 }, // 🎯 THÊM
          summaryError: null, // 🎯 THÊM
        }),

      // 🎯 SỬA: Reset toàn bộ store (thêm summary)
      resetStore: () =>
        set({
          kanjiItems: [],
          allKanjiCache: {},
          pagination: { currentPage: -1, totalPages: 0, totalItems: 0, pageSize: 10 },
          loading: false,
          error: null,
          currentUserId: null,
          currentLevel: null,
          activeLevel: "N5",
          progressSummary: { N1: 0, N2: 0, N3: 0, N4: 0, N5: 0 }, // 🎯 THÊM
          summaryLoading: false, // 🎯 THÊM
          summaryError: null, // 🎯 THÊM
        }),
    }),
    {
      name: "kanji-storage",
      storage: createJSONStorage(() => cookiesStorage),
      partialize: (state) => ({
        kanjiItems: state.kanjiItems,
        pagination: state.pagination,
        currentUserId: state.currentUserId,
        currentLevel: state.currentLevel,
        activeLevel: state.activeLevel,
        allKanjiCache: state.allKanjiCache,
        progressSummary: state.progressSummary, // 🎯 THÊM
      }),
      version: 4, // 🎯 TĂNG version do thêm progressSummary
    }
  )
);

export default useKanjiStore;