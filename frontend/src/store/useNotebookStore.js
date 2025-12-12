import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useNotebookStore = create(
  devtools(
    (set, get) => ({
      // State
      notebooks: [],
      currentNotebook: null,
      loading: false,
      error: null,
      notebookEntries: [],

      fetchNotebooks: async (axios) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get("/api/v1/notebooks");

          if (response.data.success) {
            set({
              notebooks: response.data.data,
              loading: false,
            });
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch notebooks"
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

      createNotebook: async (axios, name, description = "") => {
        set({ loading: true, error: null });
        try {
          const response = await axios.post("/api/v1/notebooks", {
            name,
            description,
          });

          if (response.data.success) {
            const newNotebook = response.data.data;
            // ✅ Cập nhật state immutably
            set((state) => ({
              notebooks: [...state.notebooks, newNotebook],
              loading: false,
            }));
            return newNotebook;
          } else {
            throw new Error(
              response.data.message || "Failed to create notebook"
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

      getNotebookDetails: async (axios, notebookId) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(`/api/v1/notebooks/${notebookId}`);

          if (response.data.success) {
            const notebook = response.data.data;
            set({
              currentNotebook: notebook,
              notebookEntries: notebook.entries || [],
              loading: false,
            });
            return notebook;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch notebook"
            );
          }
        } catch (error) {
          set({ loading: false, error: error.message });
          throw error;
        }
      },

      addEntryToNotebook: async (axios, notebookId, entityType, entityId) => {
        set({ error: null });
        try {
          const numericEntityId = Number(entityId);

          console.log("📤 Adding entry to notebook:", {
            notebookId,
            entityType,
            entityId: numericEntityId,
            payload: { entityType, entityId: numericEntityId },
          });

          const response = await axios.post(
            `/api/v1/notebooks/${notebookId}/entries`,
            {
              entityType: entityType,
              entityId: numericEntityId,
            }
          );

          console.log("✅ Entry added successfully:", response.data);

          if (response.data.success) {
            const state = get();
            if (
              state.currentNotebook &&
              state.currentNotebook.id === notebookId
            ) {
              await state.getNotebookDetails(axios, notebookId);
            }

            set((state) => ({
              notebookEntries: [
                ...state.notebookEntries,
                {
                  entityId: numericEntityId,
                  entityType: entityType,
                },
              ],
            }));

            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to add entry to notebook"
            );
          }
        } catch (error) {
          console.error("❌ Error adding entry:", {
            status: error.response?.status,
            message: error.response?.data?.message,
            data: error.response?.data,
            originalError: error.message,
          });

          set({
            error: error.response?.data?.message || error.message,
          });
          throw error;
        }
      },

      deleteNotebook: async (axios, notebookId) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.delete(
            `/api/v1/notebooks/${notebookId}`
          );

          if (response.data.success) {
            set((state) => ({
              notebooks: state.notebooks.filter((nb) => nb.id !== notebookId),
              currentNotebook:
                state.currentNotebook?.id === notebookId
                  ? null
                  : state.currentNotebook,
              notebookEntries:
                state.currentNotebook?.id === notebookId
                  ? []
                  : state.notebookEntries,
              loading: false,
            }));
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to delete notebook"
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

      deleteEntryFromNotebook: async (axios, notebookEntryId) => {
        set({ error: null });
        try {
          const response = await axios.delete(
            `/api/v1/notebook-entries/${notebookEntryId}`
          );

          if (response.data.success) {
            set((state) => ({
              notebookEntries: state.notebookEntries.filter(
                (entry) => entry.entryId !== notebookEntryId
              ),
            }));

            set((state) => ({
              currentNotebook: state.currentNotebook
                ? {
                    ...state.currentNotebook,
                    totalEntries: Math.max(
                      0,
                      (state.currentNotebook.totalEntries || 1) - 1
                    ),
                  }
                : null,
            }));

            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to delete entry from notebook"
            );
          }
        } catch (error) {
          set({
            error: error.response?.data?.message || error.message,
          });
          throw error;
        }
      },

      // 🎯 SỬA: getSearchHistory với error handling tốt hơn
      getSearchHistory: async (axios, page = 0, limit = 20) => {
        set({ error: null });
        try {
          console.log("📜 Fetching search history:", { page, limit });
          
          const response = await axios.get("/api/v1/search/history", {
            params: { page, limit },
          });

          console.log("✅ Search history response:", response.data);

          if (response.data.success) {
            // API trả về: { items: [...], currentPage, totalPages, totalItems, pageSize }
            return response.data.data;
          } else {
            throw new Error(
              response.data.message || "Failed to fetch search history"
            );
          }
        } catch (error) {
          console.error("❌ Error fetching search history:", {
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

      // 🎯 SỬA: getSearchSuggestions - chỉ dùng level parameter
      getSearchSuggestions: async (axios, level = 5) => {
        set({ error: null });
        try {
          console.log("💡 Fetching search suggestions:", { level });
          
          const response = await axios.get("/api/v1/suggest/today", {
            params: { level }, // 🎯 SỬA: Chỉ truyền level, không phải page/limit
          });

          console.log("✅ Search suggestions response:", response.data);

          if (response.data.success) {
            // 🎯 SỬA: API trả về array trực tiếp
            const suggestionsArray = Array.isArray(response.data.data) 
              ? response.data.data 
              : [];
            
            return {
              items: suggestionsArray,
              totalItems: suggestionsArray.length,
              pageSize: suggestionsArray.length,
              currentPage: 0,
              totalPages: 1,
            };
          } else {
            throw new Error(
              response.data.message || "Failed to fetch search suggestions"
            );
          }
        } catch (error) {
          console.error("❌ Error fetching search suggestions:", {
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
      getCurrentNotebook: () => get().currentNotebook,
      getNotebookEntries: () => get().notebookEntries,
      getEntryById: (entryId) => {
        const entries = get().notebookEntries;
        return entries.find((entry) => entry.entryId === entryId);
      },
      getEntriesByType: (entityType) => {
        const entries = get().notebookEntries;
        return entries.filter((entry) => entry.entityType === entityType);
      },
      getTotalEntries: () => {
        const notebook = get().currentNotebook;
        return notebook ? notebook.totalEntries : 0;
      },
      isLoading: () => get().loading,
      getError: () => get().error,
      getNotebookById: (notebookId) => {
        const notebooks = get().notebooks;
        return notebooks.find((nb) => nb.id === notebookId);
      },
      searchNotebooksByName: (searchTerm) => {
        const notebooks = get().notebooks;
        const term = searchTerm.toLowerCase();
        return notebooks.filter((nb) => nb.name.toLowerCase().includes(term));
      },
      entryExists: (entityId, entityType) => {
        const entries = get().notebookEntries;
        const numericEntityId = Number(entityId);
        const normalizedType = entityType?.toUpperCase().trim();

        console.log("🔍 entryExists check:", {
          searching: { entityId, numericEntityId, entityType: normalizedType },
          totalEntries: entries.length,
          entries: entries.map((e) => ({
            entityId: e.entityId,
            entityType: e.entityType,
            match:
              Number(e.entityId) === numericEntityId &&
              e.entityType === normalizedType,
          })),
        });

        return entries.some(
          (entry) =>
            Number(entry.entityId) === numericEntityId &&
            entry.entityType?.toUpperCase().trim() === normalizedType
        );
      },

      resetNotebookStore: () => {
        set({
          notebooks: [],
          currentNotebook: null,
          loading: false,
          error: null,
          notebookEntries: [],
        });
      },

    }),
    { name: "NotebookStore" }
  )
);

export default useNotebookStore;