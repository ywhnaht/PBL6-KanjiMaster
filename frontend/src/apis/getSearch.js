import axios from "./axios";

// API search
export const getSearch = async (searchValue) => {
  try {
    const res = await axios.get("/api/v1/search", { params: { q: searchValue } });
    // res.data.data chứa cấu trúc bạn vừa gửi
    return res.data.data.results || [];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};

// API chi tiết Kanji
export const getKanjiDetail = async (id) => {
  try {
    const res = await axios.get(`/api/v1/kanji/${id}`);
    if (res.data.success) return res.data.data;
    return null;
  } catch (error) {
    console.error("getKanjiDetail error:", error);
    return null;
  }
};

// API chi tiết Compound
export const getCompoundDetail = async (id) => {
  try {
    const res = await axios.get(`/api/v1/compound/${id}`);
    if (res.data.success) return res.data.data;
    return null;
  } catch (error) {
    console.error("getCompoundDetail error:", error);
    return null;
  }
};

// API lấy Kanji từ Compound
export const getCompoundKanji = async (id) => {
  try {
    const res = await axios.get(`/api/v1/compound/${id}/kanji`);
    if (res.data.success) {
      return res.data.data; // array gồm các Kanji
    }
    return [];
  } catch (error) {
    console.error("getCompoundKanji error:", error);
    return [];
  }
};