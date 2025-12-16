import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useProfileStore = create(
  devtools(
    (set, get) => ({
      // State
      profile: null,
      stats: null,
      loading: false,
      avatarUploading: false,
      error: null,

      fetchProfile: async (axios) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get("/api/v1/profile");

          if (response.data.success) {
            set({
              profile: response.data.data,
              loading: false,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch profile"
            );
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });
          throw error;
        }
      },

      updateProfile: async (axios, fullName, bio = "") => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put("/api/v1/profile", {
            fullName,
            bio,
          });

          if (response.data.success) {
            set({
              profile: response.data.data,
              loading: false,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to update profile"
            );
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });
          throw error;
        }
      },

      changePassword: async (
        axios,
        currentPassword,
        newPassword,
        confirmPassword
      ) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.put("/api/v1/profile/password", {
            currentPassword,
            newPassword,
            confirmPassword,
          });

          if (response.data.success) {
            set({
              loading: false,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to change password"
            );
          }
        } catch (error) {
          set({
            loading: false,
            error: error.response?.data?.message || error.message,
          });
          throw error;
        }
      },

      uploadAvatar: async (axios, file) => {
        set({ avatarUploading: true, error: null });
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await axios.post("/api/v1/profile/avatar", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.data.success) {
            // ✅ Cập nhật avatar trực tiếp mà không gọi fetchProfile
            set((state) => ({
              profile: {
                ...state.profile,
                avatarUrl: response.data.data.avatarUrl,
              },
              avatarUploading: false,
            }));
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to upload avatar"
            );
          }
        } catch (error) {
          set({
            avatarUploading: false,
            error: error.response?.data?.message || error.message,
          });
          throw error;
        }
      },

      deleteAvatar: async (axios) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.delete("/api/v1/profile/avatar");

          if (response.data.success) {
            set({
              profile: response.data.data,
              loading: false,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to delete avatar"
            );
          }
        } catch (error) {
          set({
            loading: false,
            error: error.message,
          });
          throw error;
        }
      },

      fetchStats: async (axios) => {
        set({ error: null });
        try {
          console.log("📊 Fetching profile stats...");

          const response = await axios.get("/api/v1/profile/stats");

          console.log("✅ Profile stats response:", response.data);

          if (response.data.success) {
            set({
              stats: response.data.data,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch profile stats"
            );
          }
        } catch (error) {
          console.error("❌ Error fetching profile stats:", {
            status: error.response?.status,
            message: error.response?.data?.message,
            originalError: error.message,
          });
          set({
            error: error.response?.data?.message || error.message,
          });
          throw error;
        }
      },

      // ✅ Getter functions
      getProfile: () => get().profile,
      getStats: () => get().stats,
      getProfileEmail: () => get().profile?.email,
      getProfileFullName: () => get().profile?.fullName,
      getProfileAvatarUrl: () => get().profile?.avatarUrl,
      getProfileBio: () => get().profile?.bio,
      getTotalKanjiLearned: () => get().profile?.totalKanjiLearned || 0,
      getStreakDays: () => get().profile?.streakDays || 0,
      getTotalKanjiLearnedFromStats: () => get().stats?.totalKanjiLearned || 0,
      getStreakDaysFromStats: () => get().stats?.streakDays || 0,
      getLastStudyDate: () => get().stats?.lastStudyDate,
      getKanjiLearnedByLevel: () => get().stats?.kanjiLearnedByLevel || {},
      getTotalKanjiByLevel: () => get().stats?.totalKanjiByLevel || {},
      getProgressPercentByLevel: () => get().stats?.progressPercentByLevel || {},
      getTotalQuizzesTaken: () => get().stats?.totalQuizzesTaken || 0,
      getAverageQuizScore: () => get().stats?.averageQuizScore || 0,
      getHighestQuizScore: () => get().stats?.highestQuizScore || 0,
      getLowestQuizScore: () => get().stats?.lowestQuizScore || 0,
      getTotalBattlesPlayed: () => get().stats?.totalBattlesPlayed || 0,
      getBattlesWon: () => get().stats?.battlesWon || 0,
      getBattlesLost: () => get().stats?.battlesLost || 0,
      getWinRate: () => get().stats?.winRate || 0,
      isLoading: () => get().loading,
      isAvatarUploading: () => get().avatarUploading,
      getError: () => get().error,

      resetProfileStore: () => {
        set({
          profile: null,
          stats: null,
          loading: false,
          avatarUploading: false,
          error: null,
        });
      },
    }),
    { name: "ProfileStore" }
  )
);

export default useProfileStore;