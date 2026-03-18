import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.response.use(
    (response) => {
        // Return just the expected nested data or root if no data wrapper
        return response.data.data !== undefined ? response.data.data : response.data;
    },
    (error) => {
        const message = error.response?.data?.message || error.message || 'API request failed';
        return Promise.reject(new Error(message));
    }
);

export default client;
