import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, CreditCard, Zap, LogOut } from 'lucide-react';

const SettingsPage = () => {
    const { user, logout } = useAuth();

    const planColors = {
        free: 'bg-slate-500/10 text-slate-400',
        pro: 'bg-brand-primary/10 text-brand-primary',
        business: 'bg-brand-accent/10 text-brand-accent',
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-6 space-y-8 animate-fade-in-up">
            <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition">
                    <ArrowLeft size={18} className="text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Settings</h1>
                    <p className="text-slate-400 mt-1 text-sm">Manage your account and subscription.</p>
                </div>
            </div>

            {/* Profile */}
            <div className="glass-card p-6">
                <h2 className="font-bold text-white text-lg mb-6 flex items-center">
                    <User size={18} className="text-brand-primary mr-2" />
                    Profile
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
                        <div className="text-white font-medium">{user?.name || '—'}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email</label>
                        <div className="text-white font-medium">{user?.email || '—'}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Member Since</label>
                        <div className="text-white font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription */}
            <div className="glass-card p-6">
                <h2 className="font-bold text-white text-lg mb-6 flex items-center">
                    <CreditCard size={18} className="text-brand-accent mr-2" />
                    Subscription
                </h2>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm text-slate-400 mb-1">Current Plan</div>
                        <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${planColors[user?.plan] || planColors.free}`}>
                                <Zap size={14} className="inline mr-1" />
                                {user?.plan || 'Free'}
                            </span>
                        </div>
                    </div>
                    <Link
                        to="/pricing"
                        className="btn-primary text-sm px-5 py-2"
                    >
                        {user?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                    </Link>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card p-6 border-red-500/20">
                <h2 className="font-bold text-white text-lg mb-4">Danger Zone</h2>
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to log out?')) {
                            logout();
                        }
                    }}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 font-semibold text-sm transition"
                >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;
