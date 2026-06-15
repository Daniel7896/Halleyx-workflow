import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
    const token = localStorage.getItem('fc_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

client.interceptors.response.use(
    (response) => {
        return response.data.data !== undefined ? response.data.data : response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'API request failed';
        
        // Auto-logout on 401
        if (error.response?.status === 401) {
            localStorage.removeItem('fc_token');
            // Only redirect if not already on auth pages
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(new Error(message));
    }
);

export default client;
