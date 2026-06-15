import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import client from '../api/client';
import RuleRow from '../components/RuleRow';
import { Loader2, ArrowLeft, Plus } from 'lucide-react';

const RuleEditor = () => {
    const { id } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const [steps, setSteps] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const currentStepId = searchParams.get('step');
    const [ruleData, setRuleData] = useState({ priority: 1, condition: '', next_step_id: '' });
    const [editingRuleId, setEditingRuleId] = useState(null);

    useEffect(() => { fetchInitialData(); }, [id]);
    useEffect(() => {
        if (currentStepId) fetchRules();
        else setRules([]);
    }, [currentStepId]);

    const fetchInitialData = async () => {
        try {
            const stepsData = await client.get(`/workflows/${id}/steps`);
            setSteps(stepsData);
            if (!currentStepId && stepsData.length > 0) {
                setSearchParams({ step: stepsData[0]._id });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async () => {
        try {
            setLoading(true);
            const data = await client.get(`/steps/${currentStepId}/rules`);
            setRules(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRule = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...ruleData,
                next_step_id: ruleData.next_step_id === '' ? null : ruleData.next_step_id,
                priority: Number(ruleData.priority)
            };
            if (editingRuleId) {
                await client.put(`/rules/${editingRuleId}`, payload);
            } else {
                await client.post(`/steps/${currentStepId}/rules`, payload);
            }
            setRuleData({ priority: rules.length + 2, condition: '', next_step_id: '' });
            setEditingRuleId(null);
            await fetchRules();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ruleId) => {
        if (!window.confirm('Delete rule?')) return;
        try {
            await client.delete(`/rules/${ruleId}`);
            fetchRules();
        } catch (err) { alert(err.message); }
    };

    const handleEdit = (rule) => {
        setEditingRuleId(rule._id);
        setRuleData({ priority: rule.priority, condition: rule.condition, next_step_id: rule.next_step_id || '' });
    };

    if (loading && steps.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

    const hasDefault = rules.some(r => r.condition.trim() === 'DEFAULT');

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-fade-in-up">
            <div className="flex items-center space-x-4">
                <Link to={`/workflows/${id}/edit`} className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition">
                    <ArrowLeft size={18} className="text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Rule Configurator</h1>
                    <p className="text-slate-400 text-sm mt-1">Define execution flow logic between steps</p>
                </div>
            </div>

            <div className="glass-card p-6">
                <div className="mb-6 border-b border-white/[0.06] pb-6">
                    <label className="block text-sm font-bold text-slate-300 mb-2">Select Active Step</label>
                    <select
                        className="input-dark"
                        value={currentStepId || ''}
                        onChange={e => setSearchParams({ step: e.target.value })}
                    >
                        {steps.map(s => <option key={s._id} value={s._id}>{s.name} (Order: {s.order})</option>)}
                    </select>
                </div>

                {!hasDefault && rules.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-medium text-sm flex items-start">
                        <span className="mr-2">⚠️</span>
                        Warning: No &apos;DEFAULT&apos; rule found. Add one to prevent execution failures.
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="font-bold text-lg text-white mb-4 px-2">Rules Table</h3>
                    <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                        {rules.length > 0 ? rules.map(rule => (
                            <RuleRow key={rule._id} rule={rule} steps={steps} onEdit={handleEdit} onDelete={handleDelete} />
                        )) : (
                            <div className="p-8 text-center text-slate-500 italic">No rules found. Add one below.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">{editingRuleId ? 'Edit Rule' : 'Add New Rule'}</h3>
                    <form className="space-y-4" onSubmit={handleSaveRule}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                                <input type="number" required placeholder="1" className="input-dark text-sm"
                                    value={ruleData.priority} onChange={e => setRuleData({ ...ruleData, priority: e.target.value })} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Condition</label>
                                <input type="text" required placeholder="amount > 100 && country == 'US'" className="input-dark text-sm font-mono"
                                    value={ruleData.condition} onChange={e => setRuleData({ ...ruleData, condition: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Next Step on Match</label>
                            <select className="input-dark text-sm"
                                value={ruleData.next_step_id} onChange={e => setRuleData({ ...ruleData, next_step_id: e.target.value })}>
                                <option value="">-- Terminate Workflow (End) --</option>
                                {steps.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-white/[0.06]">
                            <div className="text-xs text-slate-500 max-w-sm">
                                Supported: <code className="bg-white/10 px-1 rounded">==</code> <code className="bg-white/10 px-1 rounded">&gt;=</code> <code className="bg-white/10 px-1 rounded">&amp;&amp;</code> <code className="bg-white/10 px-1 rounded">contains()</code> <code className="bg-white/10 px-1 rounded">DEFAULT</code>
                            </div>
                            <div className="flex space-x-2">
                                {editingRuleId && (
                                    <button type="button" onClick={() => { setEditingRuleId(null); setRuleData({ priority: rules.length + 1, condition: '', next_step_id: '' }); }} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                                )}
                                <button type="submit" className="btn-primary px-5 py-2 text-sm flex items-center">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} className="mr-1" /> {editingRuleId ? 'Update Rule' : 'Add Rule'}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RuleEditor;
