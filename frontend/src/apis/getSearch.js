import axios from "./axios";

export const getSearch = async (searchValue) => {
  try {
    const response = await axios.get("/api/v1/suggest", {
      params: { keyword: searchValue },
    });
    return response.data.data; // giả sử backend trả về list object {kanji, reading, meaning}
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
