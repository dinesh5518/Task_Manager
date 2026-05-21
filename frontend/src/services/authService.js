import axiosInstance from '../api/axios';

const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify({
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                roles: response.data.roles
            }));
        }
        return response.data;
    },

    signup: async (name, email, password) => {
        const response = await axiosInstance.post('/auth/signup', { name, email, password });
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken: () => localStorage.getItem('token'),

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};

export default authService;
