// apis/updateKanjiStatus.js
import { axiosPrivate } from "./axios";

/**
 * Cập nhật trạng thái học kanji (Đánh dấu đã học MASTERED)
 */
export const updateKanjiStatus = async (kanjiId, status = "MASTERED", manualToken = null) => {
  try {
    console.log(`🎯 Updating kanji status to ${status}:`, {
      kanjiId,
      usingManualToken: !!manualToken
    });

    // 🎯 TẠO HEADERS VỚI TOKEN
    const headers = {};
    if (manualToken) {
      headers['Authorization'] = `Bearer ${manualToken}`;
    }
    
    const res = await axiosPrivate.post(`/api/v1/users/progress/master`, 
      {}, // empty body
      {
        params: {
          kanjiId
        },
        headers: headers // 🎯 TRUYỀN HEADERS CÓ TOKEN
      }
    );

    console.log('✅ Update Kanji Status API Response:', res.data);
    
    return {
      success: true,
      message: "Kanji status updated successfully",
      data: res.data
    };
  } catch (error) {
    console.error("❌ Error updating kanji status:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        "Failed to update kanji status";

    return {
      success: false,
      message: errorMessage,
      data: null,
      status: error.response?.status
    };
  }
};