import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import RuleEditor from './pages/RuleEditor';
import ExecutionPage from './pages/ExecutionPage';
import ExecutionLogs from './pages/ExecutionLogs';
import PricingPage from './pages/PricingPage';
import SettingsPage from './pages/SettingsPage';

import { Zap, LayoutDashboard, Workflow, CreditCard, Settings, LogOut, Loader2 } from 'lucide-react';

// ─── Protected Route Wrapper ─────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

// ─── Public Route (redirect if already logged in) ────────────────────
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
    );
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return children;
};

// ─── App Navbar (for authenticated users) ────────────────────────────
const AppNavbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    // Don't show navbar on landing, login, register
    const hideNavbar = ['/', '/login', '/register'].includes(location.pathname);
    if (hideNavbar || !isAuthenticated) return null;

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/workflows', label: 'Workflows', icon: Workflow },
        { to: '/pricing', label: 'Pricing', icon: CreditCard },
        { to: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20 group-hover:shadow-brand-primary/40 transition-shadow">
                        <Zap size={18} />
                    </div>
                    <span className="font-extrabold text-lg text-white hidden sm:block">
                        Flow<span className="text-brand-primary">Craft</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center space-x-1">
                    {navLinks.map(({ to, label, icon: Icon }) => {
                        const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));
                        return (
                            <Link
                                key={to}
                                to={to}
                                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-white/10 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon size={16} />
                                <span className="hidden md:inline">{label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Section */}
                <div className="flex items-center space-x-3">
                    <div className="hidden md:block text-right">
                        <div className="text-sm font-semibold text-white">{user?.name}</div>
                        <div className="text-xs text-slate-500 capitalize">{user?.plan || 'free'} plan</div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <button
                        onClick={() => { if (window.confirm('Sign out?')) logout(); }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                        title="Sign out"
                    >
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

// ─── Landing Navbar ──────────────────────────────────────────────────
const LandingNavbar = () => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (location.pathname !== '/') return null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/[0.04]">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                        <Zap size={18} />
                    </div>
                    <span className="font-extrabold text-lg text-white">Flow<span className="text-brand-primary">Craft</span></span>
                </Link>
                <div className="flex items-center space-x-3">
                    {isAuthenticated ? (
                        <Link to="/dashboard" className="btn-primary text-sm px-5 py-2">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm text-slate-300 hover:text-white font-medium transition px-3 py-2">Sign In</Link>
                            <Link to="/register" className="btn-primary text-sm px-5 py-2">Get Started Free</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

// ─── Main App ────────────────────────────────────────────────────────
const AppContent = () => {
    return (
        <div className="min-h-screen">
            <LandingNavbar />
            <AppNavbar />
            <main className="relative z-10">
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/workflows" element={<ProtectedRoute><WorkflowList /></ProtectedRoute>} />
                    <Route path="/workflows/:id/edit" element={<ProtectedRoute><WorkflowEditor /></ProtectedRoute>} />
                    <Route path="/workflows/:id/rules" element={<ProtectedRoute><RuleEditor /></ProtectedRoute>} />
                    <Route path="/workflows/:id/execute" element={<ProtectedRoute><ExecutionPage /></ProtectedRoute>} />
                    <Route path="/executions/:id" element={<ProtectedRoute><ExecutionLogs /></ProtectedRoute>} />
                    <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
