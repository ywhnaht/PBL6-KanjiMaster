// src/apis/getSearchResult.js
import axios from "./axios";

export const getSearchResult = async (query, page = 0, size = 5) => {
  try {
    const response = await axios.get("http://localhost:8080/api/v1/search", {
      params: {
        q: query,
        page,
        size,
      },
      headers: {
        accept: "application/json",
      },
    });

    if (response.data.success) {
      return response.data.data; // Trả về phần "data" chứa kết quả
    } else {
      throw new Error(response.data.message || "Failed to fetch search results");
    }
  } catch (error) {
    console.error("Error fetching search results:", error);
    throw error;
  }
};

export const getCompoundKanjis = async (id) => {
  try {
    const response = await axios.get(`/api/v1/compound/${id}/kanji`, {
      headers: { accept: "application/json" },
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Failed to fetch compound kanjis");
    }
  } catch (error) {
    console.error("Error fetching compound kanjis:", error);
    throw error;
  }
};