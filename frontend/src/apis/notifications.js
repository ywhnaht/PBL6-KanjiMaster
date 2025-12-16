import axios from './axios';

export const getNotifications = async (page = 0, size = 20) => {
  const response = await axios.get(`/api/notifications`, {
    params: { page, size }
  });
  return response.data;
};

export const getUnreadNotifications = async () => {
  const response = await axios.get('/api/notifications/unread');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get('/api/notifications/unread/count');
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  await axios.put(`/api/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async () => {
  await axios.put('/api/notifications/read-all');
};

export const deleteNotification = async (notificationId) => {
  await axios.delete(`/api/notifications/${notificationId}`);
};