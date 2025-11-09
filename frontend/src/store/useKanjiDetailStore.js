// store/useKanjiDetailStore.js
import { create } from "zustand";
import { getKanjiDetail } from "../apis/getKanjiDetail";
import { updateKanjiStatus } from "../apis/updateKanjiStatus";
import { useAuthStore } from "./useAuthStore";

// 🆕 BIẾN GLOBAL ĐỂ TRÁNH CIRCULAR DEPENDENCY
let kanjiStoreRef = null;

// 🆕 FUNCTION ĐỂ SET KANJI STORE REFERENCE
export const setKanjiStoreRef = (store) => {
  kanjiStoreRef = store;
};

// 🆕 HÀM HELPER ĐỂ LẤY TOKEN
const getAuthToken = () => {
  try {
    return useAuthStore.getState().accessToken;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

const useKanjiDetailStore = create((set, get) => ({
  // --- Kanji detail state ---
  kanjiDetail: null,
  loading: false,
  error: null,
  isModalOpen: false,

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

  // --- Kanji detail actions ---
  openKanjiDetail: async (kanjiId) => {
    set({ loading: true, error: null, isModalOpen: true });

    try {
      const userId = get().isLoggedIn() ? useAuthStore.getState().user?.id : null;

      const response = await getKanjiDetail({
        kanjiId,
        userId,
      });

      console.log(`Fetch kanji detail for ID ${kanjiId}:`, response);

      if (response.success && response.data) {
        set({
          kanjiDetail: response.data,
          loading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch kanji detail",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch kanji detail:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch kanji detail";

      set({
        error: errorMessage,
        loading: false,
      });
    }
  },

  // 🆕 CẬP NHẬT markAsMastered - VỚI MANUAL TOKEN
  markAsMastered: async (kanjiId) => {
    try {
      const token = getAuthToken(); // 🎯 LẤY TOKEN TRỰC TIẾP
      
      if (!token) {
        console.warn("❌ No token available, user might be logged out");
        return { success: false, message: "Authentication required" };
      }

      console.log(`🎯 Marking kanji as mastered:`, { 
        kanjiId,
        tokenPresent: !!token,
        tokenPreview: token.substring(0, 20) + '...'
      });

      // 🎯 GỌI API VỚI MANUAL TOKEN
      const response = await updateKanjiStatus(kanjiId, "MASTERED", token);

      if (response.success) {
        console.log("✅ Successfully marked as MASTERED");

        // CẬP NHẬT TRONG MODAL
        const currentKanjiDetail = get().kanjiDetail;
        if (currentKanjiDetail && currentKanjiDetail.id === kanjiId) {
          set({
            kanjiDetail: {
              ...currentKanjiDetail,
              status: "MASTERED",
            },
          });
        }

        // CẬP NHẬT TRONG KANJI STORE
        try {
          if (kanjiStoreRef) {
            kanjiStoreRef.updateKanjiStatus(kanjiId, "MASTERED");
            console.log("✅ Updated kanji status in page via reference");
          } else {
            const { default: useKanjiStore } = await import("./useKanjiStore");
            const kanjiStore = useKanjiStore.getState();
            if (kanjiStore.updateKanjiStatus) {
              kanjiStore.updateKanjiStatus(kanjiId, "MASTERED");
              console.log("✅ Updated kanji status in page via dynamic import");
            }
          }
        } catch (error) {
          console.error("❌ Failed to update kanji store:", error);
        }

        return response;
      } else {
        console.log("❌ Failed to mark as mastered:", response.message);
        return response;
      }
    } catch (error) {
      console.error("🚨 Error marking as mastered:", error);
      return {
        success: false,
        message: error.message || "Failed to mark as mastered",
      };
    }
  },

  // Đóng modal và clear data
  closeKanjiDetail: () =>
    set({
      isModalOpen: false,
      kanjiDetail: null,
      error: null,
      loading: false,
    }),

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useKanjiDetailStore;