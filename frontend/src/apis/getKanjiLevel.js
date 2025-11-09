// apis/getKanjiLevel.js - THÊM CONSOLE LOG CHI TIẾT
export const getKanjiLevel = async (axiosPrivate, { level, page = 0, size = 50 }) => {
  try {
    const response = await axiosPrivate.get('/api/v1/kanji/level', {
      params: {
        level,
        page,
        size,
      },
    });

    // 🎯 RETURN ĐÚNG STRUCTURE - data chính là response.data.data
    return {
      success: response.data.success,
      data: response.data.data, // 🎯 QUAN TRỌNG: response.data.data chứ không phải response.data
      message: response.data.message || "Kanji data fetched successfully"
    };

  } catch (error) {
    console.error(`❌ Error fetching kanji level ${level}:`, error);
    

    // Xử lý lỗi chi tiết
    if (error.response) {
      throw {
        message: error.response.data?.message || 'Failed to fetch kanji data',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      throw {
        message: 'No response from server',
        status: null,
      };
    } else {
      throw {
        message: error.message || 'Unknown error occurred',
        status: null,
      };
    }
  }
};