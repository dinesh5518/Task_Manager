import axiosInstance from '../api/axios';

export const fetchProfile = () => axiosInstance.get('/users/me').then((res) => res.data);

export const updateProfile = (payload) => axiosInstance.put('/users/me', payload).then((res) => res.data);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((res) => res.data);
};

export const removeAvatar = () => axiosInstance.delete('/users/me/avatar').then((res) => res.data);

export const changePassword = (payload) => axiosInstance.put('/users/me/password', payload).then((res) => res.data);

export const updateUserSettings = (payload) => axiosInstance.put('/users/me/settings', payload).then((res) => res.data);
