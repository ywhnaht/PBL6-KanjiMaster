// Word Suggestion APIs
export const getAllSuggestions = async (axiosPrivate, status, type, page = 0, size = 20) => {
  const params = { page, size };
  if (status) params.status = status;
  if (type) params.type = type;
  
  const response = await axiosPrivate.get('/api/admin/suggestions', { params });
  return response.data;
};

export const reviewSuggestion = async (axiosPrivate, suggestionId, reviewData) => {
  const response = await axiosPrivate.put(`/api/admin/suggestions/${suggestionId}/review`, reviewData);
  return response.data;
};

export const countPendingSuggestions = async (axiosPrivate) => {
  const response = await axiosPrivate.get('/api/admin/suggestions/count-pending');
  return response.data;
};

export const createSuggestion = async (axiosPrivate, suggestionData) => {
  const response = await axiosPrivate.post('/api/v1/suggestions', suggestionData);
  return response.data;
};

export const getMySuggestions = async (axiosPrivate, page = 0, size = 20) => {
  const response = await axiosPrivate.get('/api/v1/suggestions/my-suggestions', {
    params: { page, size }
  });
  return response.data;
};
