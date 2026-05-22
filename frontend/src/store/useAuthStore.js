import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axiosInstance from '../api/axios';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const response = await axiosInstance.post('/auth/login', { email, password });
                    const userData = {
                        id: response.data.id,
                        name: response.data.name,
                        email: response.data.email,
                        roles: response.data.roles
                    };
                    set({ 
                        user: userData, 
                        token: response.data.token,
                        isAuthenticated: true, 
                        loading: false 
                    });
                    // persist token and user for axios interceptor compatibility
                    try {
                        localStorage.setItem('token', response.data.token);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } catch (e) {
                        // ignore storage errors
                    }
                    return true;
                } catch (error) {
                    set({ 
                        error: error.response?.data?.message || 'Login failed', 
                        loading: false 
                    });
                    return false;
                }
            },

            signup: async (name, email, password) => {
                set({ loading: true, error: null });
                try {
                    await axiosInstance.post('/auth/signup', { name, email, password });
                    set({ loading: false });
                    return true;
                } catch (error) {
                    set({ 
                        error: error.response?.data?.message || 'Signup failed', 
                        loading: false 
                    });
                    return false;
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                } catch (e) {}
            },
            
            clearError: () => set({ error: null }),

            updateUser: (partial) => {
                set((state) => {
                    const nextUser = { ...state.user, ...partial };
                    try {
                        localStorage.setItem('user', JSON.stringify(nextUser));
                    } catch (e) {
                        // ignore storage errors
                    }
                    return { user: nextUser };
                });
            },

            initAuth: () => {
                const token = localStorage.getItem('token');
                const user = localStorage.getItem('user');
                if (token && user) {
                    set({ 
                        token, 
                        user: JSON.parse(user),
                        isAuthenticated: true 
                    });
                }
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);
