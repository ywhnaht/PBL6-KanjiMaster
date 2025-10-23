// apis/updateKanjiStatus.js
import { axiosPrivate } from "./axios"; // 🆕 DÙNG axiosPrivate THAY VÌ axios

/**
 * Cập nhật trạng thái học kanji
 */
export const updateKanjiStatus = async ({ userId, kanjiId, status = "MASTERED" }) => {
  try {
    console.log(`🎯 Updating kanji status:`, {
      userId,
      kanjiId, 
      status
    });
    
    const res = await axiosPrivate.post(`/api/v1/users/progress/master`, 
      {}, // empty body
      {
        params: {
          userId,
          kanjiId
        }
      }
    );

    console.log('📡 Update Kanji Status API Response:', res.data);
    
    return res.data || {};
  } catch (error) {
    console.error("🚨 Error updating kanji status:", error);
    console.error("🚨 Error response:", error.response?.data);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};