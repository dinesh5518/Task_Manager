import axiosInstance from '../api/axios';

export const fetchNotifications = async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
};

export const createNotification = async (notificationPayload) => {
    const response = await axiosInstance.post('/notifications', notificationPayload);
    return response.data;
};

export const markNotificationRead = async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
};

export const markAllNotificationsRead = async () => {
    await axiosInstance.put('/notifications/read-all');
};

export const clearNotifications = async () => {
    await axiosInstance.delete('/notifications');
};

export const scanDueNotifications = async () => {
    const response = await axiosInstance.post('/notifications/scan-due');
    return response.data;
};
