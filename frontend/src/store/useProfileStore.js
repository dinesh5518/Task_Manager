import { create } from 'zustand';
import {
  changePassword,
  fetchProfile,
  removeAvatar,
  updateProfile,
  updateUserSettings,
  uploadAvatar,
} from '../services/userService';

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,
  saving: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await fetchProfile();
      set({ profile, loading: false });
      return profile;
    } catch (error) {
      set({
        loading: false,
        error: error.response?.data?.message || error.message || 'Unable to load profile',
      });
      throw error;
    }
  },

  updateProfile: async (payload) => {
    set({ saving: true, error: null });
    try {
      const profile = await updateProfile(payload);
      set({ profile, saving: false });
      return profile;
    } catch (error) {
      set({
        saving: false,
        error: error.response?.data?.message || error.message || 'Unable to update profile',
      });
      throw error;
    }
  },

  uploadAvatar: async (file) => {
    set({ saving: true, error: null });
    try {
      const profile = await uploadAvatar(file);
      set({ profile, saving: false });
      return profile;
    } catch (error) {
      set({
        saving: false,
        error: error.response?.data?.message || error.message || 'Unable to upload avatar',
      });
      throw error;
    }
  },

  removeAvatar: async () => {
    set({ saving: true, error: null });
    try {
      const profile = await removeAvatar();
      set({ profile, saving: false });
      return profile;
    } catch (error) {
      set({
        saving: false,
        error: error.response?.data?.message || error.message || 'Unable to remove avatar',
      });
      throw error;
    }
  },

  changePassword: async (payload) => {
    set({ saving: true, error: null });
    try {
      const response = await changePassword(payload);
      set({ saving: false });
      return response;
    } catch (error) {
      set({
        saving: false,
        error: error.response?.data?.message || error.message || 'Unable to change password',
      });
      throw error;
    }
  },

  updateSettings: async (payload) => {
    const previous = get().profile;
    if (previous?.settings) {
      set({ profile: { ...previous, settings: { ...previous.settings, ...payload } } });
    }
    set({ saving: true, error: null });
    try {
      const profile = await updateUserSettings(payload);
      set({ profile, saving: false });
      return profile;
    } catch (error) {
      set({ profile: previous, saving: false, error: error.response?.data?.message || error.message || 'Unable to save settings' });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
