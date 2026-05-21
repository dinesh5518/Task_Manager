import { create } from 'zustand';
import axiosInstance from '../api/axios';

export const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

    fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get('/tasks');
            set({ tasks: response.data, loading: false });
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addTask: async (taskData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post('/tasks', taskData);
            set((state) => ({ tasks: [...state.tasks, response.data], loading: false }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    updateTask: async (id, taskData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.put(`/tasks/${id}`, taskData);
            set((state) => ({
                tasks: state.tasks.map(task => task.id === id ? response.data : task),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    deleteTask: async (id) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.delete(`/tasks/${id}`);
            set((state) => ({
                tasks: state.tasks.filter(task => task.id !== id),
                loading: false
            }));
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },
    
    updateTaskStatusOptimistic: (id, newStatus) => {
        set((state) => ({
            tasks: state.tasks.map(task => 
                task.id === id ? { ...task, status: newStatus } : task
            )
        }));
        // Note: You should call updateTask afterwards to persist
    }
}));
