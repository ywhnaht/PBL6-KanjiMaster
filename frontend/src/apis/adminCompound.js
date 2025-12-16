// Admin Compound Management APIs
export const getAllCompounds = async (axiosPrivate, page = 0, size = 20, sortBy = 'word', sortDirection = 'ASC') => {
  const response = await axiosPrivate.get('/api/admin/compounds', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

export const getCompoundById = async (axiosPrivate, compoundId) => {
  const response = await axiosPrivate.get(`/api/admin/compounds/${compoundId}`);
  return response.data;
};

export const createCompound = async (axiosPrivate, compoundData) => {
  const response = await axiosPrivate.post('/api/admin/compounds', compoundData);
  return response.data;
};

export const updateCompound = async (axiosPrivate, compoundId, compoundData) => {
  const response = await axiosPrivate.put(`/api/admin/compounds/${compoundId}`, compoundData);
  return response.data;
};

export const deleteCompound = async (axiosPrivate, compoundId) => {
  const response = await axiosPrivate.delete(`/api/admin/compounds/${compoundId}`);
  return response.data;
};

export const importCompoundsFromCsv = async (axiosPrivate, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axiosPrivate.post('/api/admin/compounds/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const searchCompounds = async (axiosPrivate, keyword, page = 0, size = 20) => {
  const response = await axiosPrivate.get('/api/admin/compounds/search', {
    params: { keyword, page, size }
  });
  return response.data;
};
