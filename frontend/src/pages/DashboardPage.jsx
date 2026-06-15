import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { Loader2, Plus, Workflow, Activity, CheckCircle2, XCircle, BarChart3, Zap, ArrowUpRight } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await client.get('/analytics/dashboard');
            setData(res);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-brand-primary" size={40} />
        </div>
    );

    const stats = data?.stats || {};
    const plan = data?.plan || { name: 'free', limits: {} };
    const recent = data?.recentExecutions || [];

    return (
        <div className="max-w-7xl mx-auto py-8 px-6 space-y-8 animate-fade-in-up">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">
                        Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your workflows.</p>
                </div>
                <Link
                    to="/workflows"
                    className="btn-primary flex items-center space-x-2 self-start"
                >
                    <Plus size={18} />
                    <span>New Workflow</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Workflows', value: stats.totalWorkflows, icon: Workflow, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
                    { label: 'Executions (All Time)', value: stats.totalExecutions, icon: Activity, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
                    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Failed', value: stats.failedExecutions, icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                                <Icon size={20} className={color} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white">{value}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
                    </div>
                ))}
            </div>

            {/* Plan Usage + Recent Executions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Plan Usage */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-white text-lg flex items-center">
                            <Zap size={18} className="text-brand-primary mr-2" />
                            Plan Usage
                        </h2>
                        <span className="text-xs font-bold bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full uppercase">
                            {plan.name}
                        </span>
                    </div>

                    <div className="space-y-5">
                        {[
                            {
                                label: 'Workflows',
                                current: stats.totalWorkflows,
                                max: plan.limits.maxWorkflows === Infinity ? '∞' : plan.limits.maxWorkflows,
                                pct: plan.limits.maxWorkflows === Infinity ? 10 : (stats.totalWorkflows / plan.limits.maxWorkflows) * 100,
                            },
                            {
                                label: 'Executions / month',
                                current: stats.monthlyExecutions,
                                max: plan.limits.maxExecutionsPerMonth === Infinity ? '∞' : plan.limits.maxExecutionsPerMonth,
                                pct: plan.limits.maxExecutionsPerMonth === Infinity ? 5 : (stats.monthlyExecutions / plan.limits.maxExecutionsPerMonth) * 100,
                            },
                        ].map(({ label, current, max, pct }) => (
                            <div key={label}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-slate-400">{label}</span>
                                    <span className="text-white font-semibold">{current} / {max}</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-red-500' : pct > 50 ? 'bg-yellow-500' : 'bg-brand-primary'}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {plan.name === 'free' && (
                        <Link to="/pricing" className="mt-6 block text-center text-sm text-brand-primary hover:text-indigo-400 font-semibold transition">
                            Upgrade for more →
                        </Link>
                    )}
                </div>

                {/* Recent Executions */}
                <div className="glass-card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-white text-lg flex items-center">
                            <BarChart3 size={18} className="text-brand-accent mr-2" />
                            Recent Executions
                        </h2>
                        <Link to="/workflows" className="text-xs text-slate-400 hover:text-white font-medium transition flex items-center">
                            View all <ArrowUpRight size={12} className="ml-1" />
                        </Link>
                    </div>

                    {recent.length === 0 ? (
                        <div className="text-center py-10 text-slate-500">
                            <Activity size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No executions yet. Run a workflow to see results here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recent.map((exec) => (
                                <Link
                                    key={exec._id}
                                    to={`/executions/${exec._id}`}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            exec.status === 'completed' ? 'bg-green-400' :
                                            exec.status === 'failed' ? 'bg-red-400' :
                                            exec.status === 'canceled' ? 'bg-slate-400' : 'bg-yellow-400'
                                        }`} />
                                        <div>
                                            <div className="text-sm font-medium text-white">{exec.workflow_name}</div>
                                            <div className="text-xs text-slate-500">{exec.started_at ? new Date(exec.started_at).toLocaleString() : '—'}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={exec.status} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
