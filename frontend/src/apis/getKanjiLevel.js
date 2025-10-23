import axios from "./axios";

/**
 * Lấy danh sách kanji theo level (có phân trang)
 */
export const getKanjiLevel = async ({ level, userId, page = 0, size = 50 }) => {
  try {
    console.log(`Calling API for level: ${level}, page: ${page}, size: ${size}`);
    
    const res = await axios.get("/api/v1/kanji/level", {
      params: {
        level,
        ...(userId && { userId }),
        page,
        size,
      },
    });

    console.log('API Response structure:', {
      success: res.data?.success,
      hasData: !!res.data?.data,
      itemsCount: res.data?.data?.items?.length || 0,
      fullResponse: res.data
    });
    
    // Trả về toàn bộ response data, component sẽ xử lý
    return res.data || {};
  } catch (error) {
    console.error("Error fetching kanji level:", error);
    console.error("Error response:", error.response?.data);
    return {
      success: false,
      message: error.message,
      data: { items: [] }
    };
  }
};