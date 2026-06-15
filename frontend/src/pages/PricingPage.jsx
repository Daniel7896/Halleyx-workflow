import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowLeft, Zap } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: 0,
        desc: 'Perfect for trying out workflow automation.',
        features: ['3 workflows', '100 executions/month', '5 steps per workflow', '7-day execution history', 'Community support'],
        cta: 'Current Plan',
        highlight: false,
        planKey: 'free'
    },
    {
        name: 'Pro',
        price: 19,
        desc: 'For growing teams that need more power.',
        features: ['25 workflows', '5,000 executions/month', '20 steps per workflow', '30-day execution history', 'Full API access', 'Priority email support'],
        cta: 'Upgrade to Pro',
        highlight: true,
        planKey: 'pro'
    },
    {
        name: 'Business',
        price: 49,
        desc: 'Unlimited everything for serious operations.',
        features: ['Unlimited workflows', 'Unlimited executions', 'Unlimited steps', '90-day execution history', 'Full API access', 'Priority support + SLA'],
        cta: 'Upgrade to Business',
        highlight: false,
        planKey: 'business'
    },
];

const PricingPage = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in-up">
            <div className="flex items-center space-x-4 mb-10">
                <Link to="/dashboard" className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition">
                    <ArrowLeft size={18} className="text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Pricing Plans</h1>
                    <p className="text-slate-400 mt-1 text-sm">Choose the plan that fits your team.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(({ name, price, desc, features, cta, highlight, planKey }) => {
                    const isCurrent = user?.plan === planKey;
                    return (
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
                            <p className="text-sm text-slate-400 mb-4">{desc}</p>
                            <div className="flex items-baseline mb-6">
                                <span className="text-4xl font-black text-white">${price}</span>
                                {price > 0 && <span className="text-slate-400 ml-1 text-sm">/month</span>}
                            </div>
                            <ul className="space-y-3 mb-8">
                                {features.map((f) => (
                                    <li key={f} className="flex items-center text-sm text-slate-300">
                                        <Check size={16} className="text-brand-primary mr-2 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            {isCurrent ? (
                                <div className="w-full text-center py-2.5 rounded-xl font-semibold border border-brand-primary/30 text-brand-primary bg-brand-primary/5">
                                    <Zap size={16} className="inline mr-1" />
                                    Current Plan
                                </div>
                            ) : (
                                <button
                                    className={`w-full py-2.5 rounded-xl font-semibold transition-all ${
                                        highlight ? 'btn-primary' : 'btn-secondary'
                                    }`}
                                    onClick={() => alert('Stripe Checkout integration coming soon! Contact us at support@flowcraft.io')}
                                >
                                    {cta}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-center mt-12 text-sm text-slate-500">
                All plans include a 14-day free trial. No credit card required to start.
            </div>
        </div>
    );
};

export default PricingPage;
