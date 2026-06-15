import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { 
    Loader2, Plus, Workflow, Activity, CheckCircle2, 
    XCircle, BarChart3, Zap, ArrowUpRight, Play, Terminal, 
    Globe, Key, Code, HelpCircle, ArrowRight
} from 'lucide-react';

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

    // Generate dynamic chart points based on actual execution history
    const trend = stats.executionTrend || [];
    const maxCount = Math.max(...trend.map(t => t.count), 5);
    
    const pointsArray = trend.map((t, idx) => {
        // Space points evenly across 460px width
        const x = 10 + idx * 73;
        // Map count to height range (10 to 90)
        const y = 90 - (t.count / maxCount) * 80;
        return { x, y, ...t };
    });

    const chartPoints = pointsArray.length > 0 
        ? pointsArray.map(p => `${p.x},${p.y}`).join(' ')
        : "10,90 450,90";
        
    const chartArea = pointsArray.length > 0
        ? `10,100 ` + pointsArray.map(p => `${p.x},${p.y}`).join(' ') + ` 450,100`
        : "10,100 450,100";

    return (
        <div className="w-full max-w-[1600px] mx-auto py-8 px-6 lg:px-10 space-y-8 animate-fade-in-up">
            
            {/* Top Row: Welcome & Main Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-white/[0.06] pb-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                        Welcome, <span className="gradient-text font-black">{user?.name || 'Developer'}</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Control, monitor, and scale your FlowCraft engine workflows in real-time.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/workflows"
                        className="btn-primary px-6 py-3 font-bold text-sm flex items-center space-x-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition"
                    >
                        <Plus size={16} />
                        <span>Create Workflow</span>
                    </Link>
                    <Link
                        to="/settings"
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
                    >
                        Manage API Keys
                    </Link>
                </div>
            </div>

            {/* Grid 1: Eye-Catching Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Workflows', value: stats.totalWorkflows, icon: Workflow, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                    { label: 'Total Executions', value: stats.totalExecutions, icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Failed Executions', value: stats.failedExecutions, icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`glass-card p-6 border ${bg} hover:scale-[1.01] transition-all`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                            <Icon size={20} className={color} />
                        </div>
                        <div className="text-4xl font-extrabold text-white tracking-tight">{value}</div>
                    </div>
                ))}
            </div>

            {/* Main Content Area: Left stats/charts, Right actions/usage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT SIDE (8 cols): Trend Chart + Recent Executions */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* SVG Trendline Chart Card */}
                    <div className="glass-card p-6 border border-white/[0.08]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-extrabold text-white text-lg">Execution Analytics</h2>
                                <p className="text-xs text-slate-400">Total volume over the last 7 operational days</p>
                            </div>
                            <span className="text-xs font-bold bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 uppercase tracking-wide">Live</span>
                        </div>

                        {/* Chart Grid */}
                        <div className="relative h-48 w-full mt-4 flex items-end">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 460 100" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0"/>
                                    </linearGradient>
                                </defs>
                                {/* Grid lines */}
                                <line x1="0" y1="20" x2="460" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="50" x2="460" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                <line x1="0" y1="80" x2="460" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                
                                {/* Area fill */}
                                <polygon points={chartArea} fill="url(#areaGrad)" />
                                
                                {/* Trend Line */}
                                <polyline points={chartPoints} fill="none" stroke="#6366f1" strokeWidth="3" />
                            </svg>
                        </div>
                        
                        {/* X Axis labels */}
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-3 px-1">
                            {trend.map((t, idx) => {
                                const formatted = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                return (
                                    <span key={idx} className="w-[60px] text-center">{formatted}</span>
                                );
                            })}
                            {trend.length === 0 && (
                                <>
                                    <span>7 days ago</span>
                                    <span>Today</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Recent Executions Table */}
                    <div className="glass-card p-6 border border-white/[0.08]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="font-extrabold text-white text-lg">Operational Audit Logs</h2>
                                <p className="text-xs text-slate-400">Detailed historical tracking of run completions</p>
                            </div>
                            <Link to="/workflows" className="text-xs text-brand-primary hover:underline font-bold flex items-center">
                                View all workflows <ArrowUpRight size={14} className="ml-0.5" />
                            </Link>
                        </div>

                        {recent.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                                <Activity size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No operational records found. Create and launch a workflow to populate logs.</p>
                            </div>
                        ) : (
                            <div className="border border-white/[0.06] rounded-xl overflow-hidden divide-y divide-white/[0.04]">
                                {recent.map((exec) => (
                                    <Link
                                        key={exec._id}
                                        to={`/executions/${exec._id}`}
                                        className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-2.5 h-2.5 rounded-full ${
                                                exec.status === 'completed' ? 'bg-green-400' :
                                                exec.status === 'failed' ? 'bg-red-400' :
                                                exec.status === 'canceled' ? 'bg-slate-400' : 'bg-yellow-400'
                                            }`} />
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-brand-primary transition">{exec.workflow_name}</div>
                                                <div className="text-xs text-slate-500 mt-0.5">{exec.started_at ? new Date(exec.started_at).toLocaleString() : '—'}</div>
                                            </div>
                                        </div>
                                        <StatusBadge status={exec.status} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT SIDE (4 cols): Plan Details, API Sandbox, Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Plan Meter card */}
                    <div className="glass-card p-6 border border-white/[0.08] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-extrabold text-white text-base flex items-center">
                                <Zap size={16} className="text-brand-primary mr-1.5" />
                                Usage Quota
                            </h2>
                            <span className="text-[10px] font-black bg-brand-primary/10 text-brand-primary border border-brand-primary/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                {plan.name} Plan
                            </span>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    label: 'Workflows Created',
                                    current: stats.totalWorkflows,
                                    max: plan.limits.maxWorkflows === Infinity ? '∞' : plan.limits.maxWorkflows,
                                    pct: plan.limits.maxWorkflows === Infinity ? 5 : (stats.totalWorkflows / plan.limits.maxWorkflows) * 100,
                                },
                                {
                                    label: 'Monthly Executions',
                                    current: stats.monthlyExecutions,
                                    max: plan.limits.maxExecutionsPerMonth === Infinity ? '∞' : plan.limits.maxExecutionsPerMonth,
                                    pct: plan.limits.maxExecutionsPerMonth === Infinity ? 5 : (stats.monthlyExecutions / plan.limits.maxExecutionsPerMonth) * 100,
                                },
                            ].map(({ label, current, max, pct }) => (
                                <div key={label}>
                                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                                        <span className="text-slate-400">{label}</span>
                                        <span className="text-white font-bold">{current} / {max}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-brand-primary'}`}
                                            style={{ width: `${Math.min(pct, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {plan.name === 'free' && (
                            <Link to="/pricing" className="mt-6 btn-secondary w-full text-center py-2.5 text-xs font-bold block">
                                Upgrade Plan Limits
                            </Link>
                        )}
                    </div>

                    {/* Developer API Docs Quick Link */}
                    <div className="glass-card p-6 border border-white/[0.08] bg-gradient-to-br from-indigo-950/20 to-transparent">
                        <h3 className="font-extrabold text-white text-base mb-3 flex items-center">
                            <Code size={18} className="text-indigo-400 mr-2" />
                            API Access
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                            Trigger your workflows remotely using webhooks and API calls. View endpoints and sample payloads in your configuration panel.
                        </p>
                        <div className="space-y-2.5">
                            <div className="flex items-center text-xs text-slate-300 font-mono bg-black/40 p-2 rounded border border-white/5">
                                <span className="text-green-400 mr-1.5 font-bold">POST</span>
                                <span className="truncate">/workflows/:id/execute</span>
                            </div>
                            <Link to="/settings" className="text-xs text-brand-primary hover:underline font-bold flex items-center">
                                Fetch API Tokens <ArrowRight size={12} className="ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
