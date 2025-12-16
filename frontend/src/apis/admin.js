// Admin User Management APIs
export const getDashboardStats = async (axiosPrivate, ) => {
  const response = await axiosPrivate.get('/api/admin/dashboard');
  return response.data;
};

export const getAllUsers = async (axiosPrivate, page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC') => {
  const response = await axiosPrivate.get('/api/admin/users', {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};

export const getUserById = async (axiosPrivate, userId) => {
  const response = await axiosPrivate.get(`/api/admin/users/${userId}`);
  return response.data;
};

export const createUser = async (axiosPrivate, userData) => {
  const response = await axiosPrivate.post('/api/admin/users', userData);
  return response.data;
};

export const updateUser = async (axiosPrivate, userId, userData) => {
  const response = await axiosPrivate.put(`/api/admin/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (axiosPrivate, userId) => {
  const response = await axiosPrivate.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const updateUserRole = async (axiosPrivate, userId, roleData) => {
  const response = await axiosPrivate.put(`/api/admin/users/${userId}/role`, roleData);
  return response.data;
};

export const banUser = async (axiosPrivate, userId, banData) => {
  const response = await axiosPrivate.post(`/api/admin/users/${userId}/ban`, banData);
  return response.data;
};

export const unbanUser = async (axiosPrivate, userId) => {
  const response = await axiosPrivate.post(`/api/admin/users/${userId}/unban`);
  return response.data;
};

export const searchUsers = async (axiosPrivate, keyword, page = 0, size = 10) => {
  const response = await axiosPrivate.get('/api/admin/users/search', {
    params: { keyword, page, size }
  });
  return response.data;
};

export const getUsersByRole = async (axiosPrivate, role, page = 0, size = 10) => {
  const response = await axiosPrivate.get('/api/admin/users/role', {
    params: { role, page, size }
  });
  return response.data;
};
