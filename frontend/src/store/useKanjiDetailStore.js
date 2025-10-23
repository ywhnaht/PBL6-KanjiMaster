// store/useKanjiDetailStore.js
import { create } from "zustand";
import { getKanjiDetail } from "../apis/getKanjiDetail";
import { updateKanjiStatus } from "../apis/updateKanjiStatus";
import useAuthStore from "./useAuthStore";

// 🆕 BIẾN GLOBAL ĐỂ TRÁNH CIRCULAR DEPENDENCY
let kanjiStoreRef = null;

// 🆕 FUNCTION ĐỂ SET KANJI STORE REFERENCE
export const setKanjiStoreRef = (store) => {
  kanjiStoreRef = store;
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

  // --- Kanji detail actions ---
  openKanjiDetail: async (kanjiId) => {
    set({ loading: true, error: null, isModalOpen: true });

    try {
      const userId = get().isLoggedIn() ? get().getUserId() : null;

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

  // 🆕 CẬP NHẬT markAsMastered ĐỂ GỌI REFRESH
  markAsMastered: async (kanjiId) => {
    try {
      const userId = get().getUserId();
      if (!userId) {
        console.warn("❌ User not logged in, cannot mark as mastered");
        return { success: false, message: "User not logged in" };
      }

      console.log(`🎯 Marking kanji as mastered:`, { userId, kanjiId });

      const response = await updateKanjiStatus({
        userId,
        kanjiId,
        status: "MASTERED",
      });

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

        // 🆕 GỌI CALLBACK REFRESH NẾU CÓ
        if (get().onKanjiStatusChange) {
          get().onKanjiStatusChange();
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
        message: error.message,
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
