// apis/getKanjiDetail.js
import axios from "./axios";

/**
 * Lấy chi tiết kanji theo ID
 */
export const getKanjiDetail = async ({ kanjiId, userId = null }) => {
  try {
    console.log(`Calling API for kanji detail ID: ${kanjiId}, userId: ${userId}`);
    
    const res = await axios.post(`/api/v1/kanji/${kanjiId}`, 
      {}, // empty body
      {
        params: {
          ...(userId && { userId })
        }
      }
    );

    console.log('Kanji Detail API Response:', {
      success: res.data?.success,
      hasData: !!res.data?.data,
      kanji: res.data?.data?.kanji,
      fullResponse: res.data
    });
    
    return res.data || {};
  } catch (error) {
    console.error("Error fetching kanji detail:", error);
    console.error("Error response:", error.response?.data);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};