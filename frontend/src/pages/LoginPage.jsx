import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, LogIn, Zap } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCredentialResponse = async (response) => {
        setError('');
        setLoading(true);
        try {
            await googleLogin(response.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google Sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initializeGoogleBtn = () => {
            if (window.google) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id';
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("google-signin-btn"),
                    { theme: "dark", size: "large", width: "100%", shape: "rectangular" }
                );
            }
        };

        if (window.google) {
            initializeGoogleBtn();
        } else {
            const timer = setInterval(() => {
                if (window.google) {
                    initializeGoogleBtn();
                    clearInterval(timer);
                }
            }, 100);
            return () => clearInterval(timer);
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl glow-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl glow-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-primary/30">
                            <Zap size={22} />
                        </div>
                        <span className="font-extrabold text-2xl text-white">Flow<span className="text-brand-primary">Craft</span></span>
                    </Link>
                    <p className="text-slate-400 mt-3 text-sm">Welcome back. Sign in to continue.</p>
                </div>

                {/* Form Card */}
                <div className="glass-panel p-8">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                            <input
                                id="login-email"
                                type="email"
                                required
                                className="input-dark"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <input
                                id="login-password"
                                type="password"
                                required
                                className="input-dark"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-base disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                        </button>
                    </form>

                    <div className="relative flex items-center justify-center my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50"></div>
                        </div>
                        <span className="relative px-3 text-xs uppercase bg-[#0d0f17] text-slate-400 font-semibold tracking-wider">
                            Or continue with
                        </span>
                    </div>

                    <div className="flex justify-center w-full min-h-[44px]">
                        <div id="google-signin-btn" className="w-full"></div>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link to="/register" className="text-brand-primary hover:text-indigo-400 font-semibold transition">
                            Create one free
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
