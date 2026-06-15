import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Zap, GitMerge, Shield, BarChart3, RefreshCw, Code2, 
    Activity, ArrowRight, Check, Sparkles, Play, Plus, 
    Trash2, Save, Terminal, Globe, Lock, UserPlus, AlertCircle
} from 'lucide-react';
import client from '../api/client';

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
    const navigate = useNavigate();

    // Sandbox States
    const [sandboxSteps, setSandboxSteps] = useState([
        { id: 's1', name: 'Check Order Amount', type: 'task', order: 1, metadata: { min_amount: 150 } },
        { id: 's2', name: 'Charge Credit Card', type: 'payment', order: 2, metadata: { gateway: 'stripe' } },
        { id: 's3', name: 'Alert Fraud Team', type: 'notification', order: 3, metadata: { channel: 'slack' } }
    ]);
    const [sandboxRules, setSandboxRules] = useState([
        { id: 'r1', stepId: 's1', priority: 1, condition: 'amount >= 500', nextStepId: 's3' },
        { id: 'r2', stepId: 's1', priority: 2, condition: 'DEFAULT', nextStepId: 's2' }
    ]);
    const [selectedStepId, setSelectedStepId] = useState('s1');
    const [newStepName, setNewStepName] = useState('');
    const [newStepType, setNewStepType] = useState('task');
    const [sandboxAmount, setSandboxAmount] = useState('750');
    
    // Execution Sim States
    const [executionLogs, setExecutionLogs] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simProgress, setSimProgress] = useState(0);

    // Auth Modal Signup trigger
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalReason, setAuthModalReason] = useState('');

    // Signup form states inside modal
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
    const [signupError, setSignupError] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const { login } = useAuth();

    const selectedStep = sandboxSteps.find(s => s.id === selectedStepId);

    // Run Simulation
    const runSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setExecutionLogs([]);
        setSimProgress(0);

        const logs = [
            { t: 'info', msg: `⚡ Initializing workflow engine with order amount = $${sandboxAmount}...` },
            { t: 'info', msg: `🔍 Fetching start step: "Check Order Amount" (Order: 1)` },
            { t: 'eval', msg: `⚙️ Evaluating rules for "Check Order Amount":` }
        ];

        // Rule logic
        const amt = Number(sandboxAmount);
        if (amt >= 500) {
            logs.push({ t: 'match', msg: `✅ Rule "amount >= 500" matched (Order Amount: ${amt} >= 500 is TRUE)` });
            logs.push({ t: 'route', msg: `➡️ Routing to Next Step: "Alert Fraud Team" (Order: 3)` });
            logs.push({ t: 'info', msg: `🔔 Executing "Alert Fraud Team": Dispatched notification to Slack channel #fraud-alerts` });
            logs.push({ t: 'success', msg: `🎉 Workflow execution completed successfully. (Status: COMPLETED)` });
        } else {
            logs.push({ t: 'match', msg: `❌ Rule "amount >= 500" did not match.` });
            logs.push({ t: 'match', msg: `✅ Rule "DEFAULT" matched.` });
            logs.push({ t: 'route', msg: `➡️ Routing to Next Step: "Charge Credit Card" (Order: 2)` });
            logs.push({ t: 'info', msg: `💳 Executing "Charge Credit Card": Processing payment via Stripe gateway` });
            logs.push({ t: 'success', msg: `🎉 Workflow execution completed successfully. (Status: COMPLETED)` });
        }

        // Animated output
        let currentIdx = 0;
        const interval = setInterval(() => {
            if (currentIdx < logs.length) {
                setExecutionLogs(prev => [...prev, logs[currentIdx]]);
                currentIdx++;
                setSimProgress(Math.floor((currentIdx / logs.length) * 100));
            } else {
                clearInterval(interval);
                setIsSimulating(false);
            }
        }, 850);
    };

    // Add Step to Sandbox
    const handleAddStep = (e) => {
        e.preventDefault();
        if (!newStepName.trim()) return;
        const newId = `s${Date.now()}`;
        const newStepObj = {
            id: newId,
            name: newStepName.trim(),
            type: newStepType,
            order: sandboxSteps.length + 1,
            metadata: newStepType === 'payment' ? { gateway: 'razorpay' } : { status: 'pending' }
        };
        setSandboxSteps([...sandboxSteps, newStepObj]);
        
        // Add a default rule routing to the new step if it's the only rule or build a default exit
        setSandboxRules([...sandboxRules, {
            id: `r${Date.now()}`,
            stepId: newId,
            priority: 1,
            condition: 'DEFAULT',
            nextStepId: ''
        }]);

        setNewStepName('');
        setSelectedStepId(newId);
    };

    // Delete Step
    const handleDeleteStep = (id) => {
        if (sandboxSteps.length <= 1) return;
        setSandboxSteps(sandboxSteps.filter(s => s.id !== id));
        setSandboxRules(sandboxRules.filter(r => r.stepId !== id));
        if (selectedStepId === id) {
            setSelectedStepId(sandboxSteps[0].id);
        }
    };

    // Trigger Signup Modal
    const triggerSignup = (reason) => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            setAuthModalReason(reason);
            setShowAuthModal(true);
        }
    };

    // Handle Quick Signup
    const handleQuickSignup = async (e) => {
        e.preventDefault();
        setSignupError('');
        setSignupLoading(true);
        try {
            const data = await client.post('/auth/register', signupData);
            login(data.token, data.user);
            setShowAuthModal(false);
            navigate('/dashboard');
        } catch (err) {
            setSignupError(err.message || 'Registration failed');
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className="relative overflow-hidden min-h-screen bg-slate-950">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
                <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-brand-primary/20 rounded-full blur-[140px] animate-pulse duration-5000"></div>
                <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] bg-brand-secondary/15 rounded-full blur-[120px] animate-pulse duration-7000"></div>
            </div>

            {/* HERO SECTION WITH HEADLINE & CTAs */}
            <section className="relative pt-32 pb-12 px-6 text-center">
                <div className="max-w-4xl mx-auto z-10 relative">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
                        <Sparkles size={14} className="text-brand-accent animate-pulse" />
                        <span className="text-sm text-slate-300 font-semibold tracking-wide">FlowCraft Playground Sandbox</span>
                    </div>

                    <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[1.05] mb-6">
                        <span className="text-white">Build automation</span>
                        <br />
                        <span className="gradient-text font-extrabold">before you sign up.</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                        Configure rules, add steps, and simulate execution logs instantly using our live sandbox editor below.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => triggerSignup('get_started')}
                            className="btn-primary px-8 py-4 text-base font-bold flex items-center space-x-2 shadow-lg shadow-brand-primary/20 hover:scale-[1.02] transition"
                        >
                            <span>Start Free Developer Plan</span>
                            <ArrowRight size={18} />
                        </button>
                        <a href="#demo-sandbox" className="btn-secondary px-8 py-4 text-base font-semibold">
                            Try Interactive Sandbox
                        </a>
                    </div>
                </div>
            </section>

            {/* INTERACTIVE WORKFLOW SANDBOX SECTION */}
            <section id="demo-sandbox" className="py-12 px-6 max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-white">Interactive Sandbox Playground</h2>
                    <p className="text-slate-400 mt-2">Add steps, configure routing conditions, and run simulation in real-time.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* LEFT PANEL: Sandbox Editor */}
                    <div className="lg:col-span-8 glass-card border border-white/[0.08] p-6 flex flex-col justify-between space-y-6">
                        <div>
                            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 mb-6">
                                <div>
                                    <h3 className="font-extrabold text-white text-lg">Visual Steps Configurator</h3>
                                    <p className="text-xs text-slate-500">Add execution triggers and action steps</p>
                                </div>
                                <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">SANDBOX MODE</span>
                            </div>

                            {/* Step Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {sandboxSteps.map(step => (
                                    <div
                                        key={step.id}
                                        onClick={() => setSelectedStepId(step.id)}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${
                                            selectedStepId === step.id
                                                ? 'border-brand-primary bg-brand-primary/5 shadow-md shadow-brand-primary/5'
                                                : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded uppercase">{step.type}</span>
                                            {sandboxSteps.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteStep(step.id);
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-white text-sm truncate">{step.name}</h4>
                                        <div className="text-[10px] text-slate-500 font-mono mt-1">Order: {step.order}</div>
                                    </div>
                                ))}

                                {/* Add Step form */}
                                <form onSubmit={handleAddStep} className="p-4 rounded-xl border border-dashed border-white/20 bg-white/[0.01] hover:bg-white/[0.02] transition flex flex-col justify-between">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Add custom step..."
                                        value={newStepName}
                                        onChange={e => setNewStepName(e.target.value)}
                                        className="bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none w-full border-b border-white/10 pb-1"
                                    />
                                    <div className="flex items-center justify-between mt-3 gap-2">
                                        <select
                                            value={newStepType}
                                            onChange={e => setNewStepType(e.target.value)}
                                            className="bg-slate-900 border border-white/10 text-[11px] text-slate-400 rounded px-1.5 py-1 focus:outline-none"
                                        >
                                            <option value="task">Task</option>
                                            <option value="payment">Payment</option>
                                            <option value="notification">Alert</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="bg-brand-primary text-white p-1 rounded-lg hover:bg-indigo-600 transition flex items-center justify-center shrink-0"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Active Step Details */}
                            {selectedStep && (
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 mb-4">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Configure Step: {selectedStep.name}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-slate-500 font-semibold mb-1 uppercase">Step Name</label>
                                            <input
                                                type="text"
                                                className="input-dark text-sm"
                                                value={selectedStep.name}
                                                onChange={e => {
                                                    const updatedName = e.target.value;
                                                    setSandboxSteps(sandboxSteps.map(s => s.id === selectedStepId ? { ...s, name: updatedName } : s));
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 font-semibold mb-1 uppercase">Metadata Value</label>
                                            <input
                                                type="text"
                                                className="input-dark text-sm font-mono"
                                                value={JSON.stringify(selectedStep.metadata)}
                                                onChange={e => {
                                                    try {
                                                        const parsed = JSON.parse(e.target.value);
                                                        setSandboxSteps(sandboxSteps.map(s => s.id === selectedStepId ? { ...s, metadata: parsed } : s));
                                                    } catch (_) {}
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rules Configuration */}
                            {selectedStep && (
                                <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Routing Rules (Step Flow)</h4>
                                    <div className="space-y-3">
                                        {sandboxRules.filter(r => r.stepId === selectedStepId).map(rule => (
                                            <div key={rule.id} className="flex flex-wrap items-center gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                                                <span className="text-xs font-mono bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">Priority {rule.priority}</span>
                                                <div className="flex-1 min-w-[200px]">
                                                    <input
                                                        type="text"
                                                        className="bg-transparent border-b border-white/10 text-sm text-white font-mono focus:outline-none w-full pb-1 focus:border-brand-primary"
                                                        value={rule.condition}
                                                        onChange={e => {
                                                            const cond = e.target.value;
                                                            setSandboxRules(sandboxRules.map(r => r.id === rule.id ? { ...r, condition: cond } : r));
                                                        }}
                                                    />
                                                </div>
                                                <ArrowRight size={14} className="text-slate-600" />
                                                <select
                                                    value={rule.nextStepId}
                                                    onChange={e => {
                                                        const nextId = e.target.value;
                                                        setSandboxRules(sandboxRules.map(r => r.id === rule.id ? { ...r, nextStepId: nextId } : r));
                                                    }}
                                                    className="bg-slate-900 border border-white/10 text-xs text-white rounded px-2 py-1 focus:outline-none"
                                                >
                                                    <option value="">End Workflow</option>
                                                    {sandboxSteps.filter(s => s.id !== selectedStepId).map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sandbox Bottom Actions */}
                        <div className="border-t border-white/[0.06] pt-5 flex items-center justify-between flex-wrap gap-4">
                            <button
                                onClick={() => triggerSignup('save_workflow')}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center space-x-2 border border-white/10 transition"
                            >
                                <Save size={16} />
                                <span>Save Workflow to Cloud</span>
                            </button>
                            <button
                                onClick={() => triggerSignup('enable_webhook')}
                                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl flex items-center space-x-2 border border-white/10 transition"
                            >
                                <Globe size={16} />
                                <span>Enable Webhook API</span>
                            </button>
                        </div>
                    </div>

                    {/* RIGHT PANEL: Live Simulator & Console */}
                    <div className="lg:col-span-4 flex flex-col space-y-6">
                        {/* Simulation Options */}
                        <div className="glass-card border border-white/[0.08] p-5">
                            <h3 className="font-extrabold text-white text-base mb-4 flex items-center">
                                <Terminal size={18} className="text-brand-accent mr-2" />
                                Sim Parameters
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-slate-500 font-bold mb-1.5 uppercase">Test Order Amount ($)</label>
                                    <input
                                        type="number"
                                        className="input-dark text-sm font-mono"
                                        value={sandboxAmount}
                                        onChange={e => setSandboxAmount(e.target.value)}
                                        placeholder="750"
                                    />
                                </div>
                                <button
                                    onClick={runSimulation}
                                    disabled={isSimulating}
                                    className="w-full btn-primary px-6 py-3 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                                >
                                    <Play size={16} fill="white" />
                                    <span>{isSimulating ? `Simulating ${simProgress}%` : 'Run Test Execution'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Real-time Console Logs */}
                        <div className="glass-card border border-white/[0.08] p-5 flex-1 flex flex-col min-h-[300px] justify-between bg-black/40">
                            <div>
                                <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-white/[0.06] flex items-center justify-between">
                                    <span>Console Audit Trail</span>
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                                </h3>
                                
                                <div className="space-y-2.5 font-mono text-[11px] leading-relaxed max-h-[250px] overflow-y-auto pr-1">
                                    {executionLogs.map((log, idx) => (
                                        <div
                                            key={idx}
                                            className={`transition-all duration-300 ${
                                                log.t === 'match' ? 'text-indigo-400' :
                                                log.t === 'route' ? 'text-blue-400' :
                                                log.t === 'success' ? 'text-green-400 font-bold' :
                                                log.t === 'eval' ? 'text-violet-400' : 'text-slate-300'
                                            }`}
                                        >
                                            {log.msg}
                                        </div>
                                    ))}
                                    {executionLogs.length === 0 && (
                                        <div className="text-slate-600 italic text-center py-12">
                                            Console idle. Adjust Test Order Amount and click Run Test Execution.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isSimulating && (
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
                                    <div className="h-full bg-brand-primary transition-all duration-300" style={{ width: `${simProgress}%` }}></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* MARKETING FEATURES GRID */}
            <section id="features" className="py-24 px-6 relative border-t border-white/[0.04]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            SaaS workflow features
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto text-base">
                            Built with premium tools to help creators launch multi-step automation engines instantly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card p-6 border border-white/[0.06] hover:border-white/[0.12] transition-colors group">
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

            {/* PRICING TIER GRID */}
            <section id="pricing" className="py-20 px-6 border-t border-white/[0.04]">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            Transparent Developer Tiers
                        </h2>
                        <p className="text-slate-400">Scale and monetize with Razorpay integrations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map(({ name, price, features: planFeatures, highlight }) => (
                            <div
                                key={name}
                                className={`rounded-2xl p-8 relative transition border ${
                                    highlight
                                        ? 'bg-gradient-to-b from-brand-primary/25 to-brand-secondary/10 border-brand-primary shadow-2xl shadow-brand-primary/10'
                                        : 'glass-card border-white/[0.06] hover:border-white/[0.12]'
                                }`}
                            >
                                {highlight && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
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
                                <button
                                    onClick={() => triggerSignup('select_plan')}
                                    className={`w-full block text-center py-2.5 rounded-xl font-bold transition-all ${
                                        highlight
                                            ? 'btn-primary'
                                            : 'btn-secondary'
                                    }`}
                                >
                                    {price === 0 ? 'Start Free Plan' : 'Select Plan'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── SIGNUP OVERLAY MODAL ── */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 px-6">
                    <div className="glass-panel border border-white/[0.12] p-8 w-full max-w-md animate-fade-in-up relative">
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white text-lg font-bold p-1 rounded hover:bg-white/5 transition"
                        >
                            ✕
                        </button>
                        
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center mx-auto mb-3 border border-brand-primary/30">
                                <Lock size={20} className="text-brand-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-white">
                                {authModalReason === 'save_workflow' && 'Save Sandbox Workflow'}
                                {authModalReason === 'enable_webhook' && 'Enable Webhook API'}
                                {authModalReason === 'select_plan' && 'Choose Subscription Plan'}
                                {authModalReason === 'get_started' && 'Join FlowCraft SaaS'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1.5">
                                Sign up for a free developer account to unlock full production features.
                            </p>
                        </div>

                        {signupError && (
                            <div className="mb-4 bg-red-500/10 text-red-400 p-3 rounded-lg border border-red-500/20 text-xs font-semibold flex items-center">
                                <AlertCircle size={14} className="mr-2" /> {signupError}
                            </div>
                        )}

                        <form onSubmit={handleQuickSignup} className="space-y-4">
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-dark text-sm"
                                    placeholder="Daniel Dev"
                                    value={signupData.name}
                                    onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-dark text-sm"
                                    placeholder="daniel@flowcraft.io"
                                    value={signupData.email}
                                    onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-dark text-sm"
                                    placeholder="••••••••"
                                    value={signupData.password}
                                    onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                disabled={signupLoading}
                                className="w-full btn-primary py-3 font-bold text-sm mt-6 flex items-center justify-center space-x-2"
                            >
                                <UserPlus size={16} />
                                <span>{signupLoading ? 'Registering...' : 'Create Free Developer Account'}</span>
                            </button>
                        </form>

                        <div className="text-center mt-5 pt-4 border-t border-white/[0.06]">
                            <p className="text-xs text-slate-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-brand-primary font-bold hover:underline">
                                    Login here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 py-8 px-6 mt-12">
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
