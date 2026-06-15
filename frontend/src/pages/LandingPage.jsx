import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, GitMerge, Shield, BarChart3, RefreshCw, Code2, Activity, ArrowRight, Check, Sparkles } from 'lucide-react';

const features = [
    { icon: GitMerge, title: 'Visual Rule Builder', desc: 'Build complex decision trees with an intuitive visual interface. No coding required.' },
    { icon: Shield, title: 'Secure Engine', desc: 'Custom expression parser — zero eval() or unsafe code injection. Enterprise-grade safety.' },
    { icon: Activity, title: 'Real-time Logs', desc: 'Track every step execution with detailed audit trails and live status monitoring.' },
    { icon: RefreshCw, title: 'Smart Retry', desc: 'Intelligent failure recovery. Resumes from the exact point of failure, not the beginning.' },
    { icon: Code2, title: 'API Access', desc: 'Full REST API to trigger workflows programmatically. Integrate with any system.' },
    { icon: BarChart3, title: 'Analytics', desc: 'Monitor success rates, execution trends, and usage stats from a beautiful dashboard.' },
];

const plans = [
    { name: 'Free', price: 0, features: ['3 workflows', '100 executions/mo', '5 steps per workflow', '7-day history'], highlight: false },
    { name: 'Pro', price: 19, features: ['25 workflows', '5,000 executions/mo', '20 steps per workflow', '30-day history', 'API access', 'Priority support'], highlight: true },
    { name: 'Business', price: 49, features: ['Unlimited workflows', 'Unlimited executions', 'Unlimited steps', '90-day history', 'API access', 'Priority support'], highlight: false },
];

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative overflow-hidden">
            {/* ── HERO ── */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-6 pt-24 pb-20">
                {/* Glow orbs */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-brand-primary/15 rounded-full blur-[120px] glow-pulse"></div>
                <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-brand-secondary/10 rounded-full blur-[100px] glow-pulse" style={{ animationDelay: '2s' }}></div>

                <div className="max-w-4xl mx-auto text-center animate-fade-in-up relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                        <Sparkles size={14} className="text-brand-accent" />
                        <span className="text-sm text-slate-300 font-medium">Workflow Automation, Reimagined</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                        <span className="text-white">Build workflows</span>
                        <br />
                        <span className="gradient-text">that think for you.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Design multi-step automation pipelines with visual rules, real-time execution logs, and intelligent retry logic. No code required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to={isAuthenticated ? '/dashboard' : '/register'}
                            className="btn-primary px-8 py-3.5 text-base flex items-center space-x-2 group"
                        >
                            <span>Start Free</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="#features" className="btn-secondary px-8 py-3.5 text-base">
                            See How It Works
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                        {[
                            ['500+', 'Active Teams'],
                            ['99.9%', 'Uptime'],
                            ['50K+', 'Workflows Run'],
                        ].map(([stat, label]) => (
                            <div key={label}>
                                <div className="text-2xl font-bold text-white">{stat}</div>
                                <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Everything you need to automate
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Powerful features built for teams who want to move fast without breaking things.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }, idx) => (
                            <div
                                key={title}
                                className="glass-card p-6 group"
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
                                    <Icon size={22} className="text-brand-primary" />
                                </div>
                                <h3 className="font-bold text-white text-lg mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/[0.03] to-transparent"></div>
                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Three steps to automation
                        </h2>
                        <p className="text-slate-400">From zero to automated in minutes.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Build', desc: 'Define your workflow with steps, input schemas, and execution logic.' },
                            { step: '02', title: 'Configure Rules', desc: 'Set conditional rules for each step. Our engine parses them safely — no eval().' },
                            { step: '03', title: 'Execute & Monitor', desc: 'Run your workflow, view real-time logs, and retry any failures instantly.' },
                        ].map(({ step, title, desc }) => (
                            <div key={step} className="text-center md:text-left">
                                <div className="text-5xl font-black gradient-text mb-4">{step}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-slate-400">Start free. Scale when you&apos;re ready.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(({ name, price, features: planFeatures, highlight }) => (
                            <div
                                key={name}
                                className={`rounded-2xl p-8 relative ${
                                    highlight
                                        ? 'bg-gradient-to-b from-brand-primary/20 to-brand-secondary/10 border-2 border-brand-primary/40 shadow-2xl shadow-brand-primary/10'
                                        : 'glass-card'
                                }`}
                            >
                                {highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                                <div className="flex items-baseline mb-6">
                                    <span className="text-4xl font-black text-white">${price}</span>
                                    {price > 0 && <span className="text-slate-400 ml-1 text-sm">/month</span>}
                                </div>
                                <ul className="space-y-3 mb-8">
                                    {planFeatures.map((f) => (
                                        <li key={f} className="flex items-center text-sm text-slate-300">
                                            <Check size={16} className="text-brand-primary mr-2 shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={isAuthenticated ? '/dashboard' : '/register'}
                                    className={`w-full block text-center py-2.5 rounded-xl font-semibold transition-all ${
                                        highlight
                                            ? 'btn-primary'
                                            : 'btn-secondary'
                                    }`}
                                >
                                    {price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="glass-panel p-12 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10"></div>
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                                Ready to automate?
                            </h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                Join hundreds of teams already using FlowCraft to build smarter workflows.
                            </p>
                            <Link
                                to={isAuthenticated ? '/dashboard' : '/register'}
                                className="btn-primary px-10 py-3.5 text-base inline-flex items-center space-x-2 group"
                            >
                                <span>Start Automating for Free</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-sm">
                            <Zap size={16} />
                        </div>
                        <span className="font-bold text-white">FlowCraft</span>
                    </div>
                    <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} FlowCraft. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
