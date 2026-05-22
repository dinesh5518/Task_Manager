import { create } from 'zustand';
import * as notificationService from '../services/notificationService';

export const useNotificationStore = create((set) => ({
    notifications: [],
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const notifications = await notificationService.fetchNotifications();
            set({ notifications, loading: false });
        } catch (error) {
            set({ error: error.message || 'Failed to load notifications', loading: false });
        }
    },

    scanDueNotifications: async () => {
        set({ loading: true, error: null });
        try {
            const result = await notificationService.scanDueNotifications();
            set({ notifications: result.notifications || [], loading: false });
            return result.created || [];
        } catch (error) {
            set({ error: error.message || 'Failed to sync due alerts', loading: false });
            return [];
        }
    },

    markAsRead: async (id) => {
        try {
            const updated = await notificationService.markNotificationRead(id);
            set((state) => ({
                notifications: state.notifications.map((notification) =>
                    notification.id === id ? updated : notification
                ),
            }));
        } catch (error) {
            set({ error: error.message || 'Failed to mark notification as read' });
        }
    },

    markAllAsRead: async () => {
        try {
            await notificationService.markAllNotificationsRead();
            set((state) => ({
                notifications: state.notifications.map((notification) => ({
                    ...notification,
                    read: true,
                })),
            }));
        } catch (error) {
            set({ error: error.message || 'Failed to mark all notifications as read' });
        }
    },

    clearNotifications: async () => {
        try {
            await notificationService.clearNotifications();
            set({ notifications: [] });
        } catch (error) {
            set({ error: error.message || 'Failed to clear notifications' });
        }
    },
}));
