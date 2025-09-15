import axios from "../apis/axios";

export const getSearch = async (searchValue) => {
  try {
    const response = await axios.get("/api/v1/suggest", {
      params: { keyword: searchValue }, // ✅ keyword chứ không phải value
    });
    return response.data.data; // chỉ lấy mảng data
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};
