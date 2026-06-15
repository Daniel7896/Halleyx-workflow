import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('fc_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const data = await client.get('/auth/me');
            setUser(data);
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await client.post('/auth/login', { email, password });
        localStorage.setItem('fc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const register = async (name, email, password) => {
        const data = await client.post('/auth/register', { name, email, password });
        localStorage.setItem('fc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const googleLogin = async (idToken) => {
        const data = await client.post('/auth/google', { idToken });
        localStorage.setItem('fc_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('fc_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, googleLogin, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
