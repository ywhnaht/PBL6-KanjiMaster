// Admin Kanji Management APIs
export const getAllKanji = async (axiosPrivate, page = 0, size = 20, sortBy = 'kanji', sortDirection = 'ASC') => {
  const response = await axiosPrivate.get('/api/admin/kanji', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

export const getKanjiById = async (axiosPrivate, kanjiId) => {
  const response = await axiosPrivate.get(`/api/admin/kanji/${kanjiId}`);
  return response.data;
};

export const createKanji = async (axiosPrivate, kanjiData) => {
  const response = await axiosPrivate.post('/api/admin/kanji', kanjiData);
  return response.data;
};

export const updateKanji = async (axiosPrivate, kanjiId, kanjiData) => {
  const response = await axiosPrivate.put(`/api/admin/kanji/${kanjiId}`, kanjiData);
  return response.data;
};

export const deleteKanji = async (axiosPrivate, kanjiId) => {
  const response = await axiosPrivate.delete(`/api/admin/kanji/${kanjiId}`);
  return response.data;
};

export const importKanjiFromCsv = async (axiosPrivate, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosPrivate.post('/api/admin/kanji/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const searchKanji = async (axiosPrivate, keyword, page = 0, size = 20) => {
  const response = await axiosPrivate.get('/api/admin/kanji/search', {
    params: { keyword, page, size }
  });
  return response.data;
};
