import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, UserPlus, Zap } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const getPasswordStrength = (pw) => {
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;
        return score;
    };

    const strength = getPasswordStrength(password);
    const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
    const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
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
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl glow-pulse"></div>
                <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-brand-accent/10 rounded-full blur-3xl glow-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="w-full max-w-md animate-fade-in-up">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-lg shadow-lg shadow-brand-primary/30">
                            <Zap size={22} />
                        </div>
                        <span className="font-extrabold text-2xl text-white">Flow<span className="text-brand-primary">Craft</span></span>
                    </Link>
                    <p className="text-slate-400 mt-3 text-sm">Create your free account and start automating.</p>
                </div>

                <div className="glass-panel p-8">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 p-3 rounded-xl border border-red-500/20 mb-6 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
                            <input
                                id="reg-name"
                                type="text"
                                required
                                className="input-dark"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                            <input
                                id="reg-email"
                                type="email"
                                required
                                className="input-dark"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                            <input
                                id="reg-password"
                                type="password"
                                required
                                className="input-dark"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {password.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColors[strength - 1] : 'bg-white/10'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-500">{strength > 0 ? strengthLabels[strength - 1] : 'Enter a password'}</p>
                                </div>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center space-x-2 py-3 text-base disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                            <span>{loading ? 'Creating account...' : 'Create Free Account'}</span>
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
                        Already have an account?{' '}
                        <Link to="/login" className="text-brand-primary hover:text-indigo-400 font-semibold transition">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
