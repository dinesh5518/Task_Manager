import axiosInstance from '../api/axios';

export const fetchAnalytics = async () => {
  const response = await axiosInstance.get('/analytics');
  return response.data;
};
