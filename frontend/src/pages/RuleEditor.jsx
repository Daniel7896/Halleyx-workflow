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

    // Form State
    const [ruleData, setRuleData] = useState({ priority: 1, condition: '', next_step_id: '' });
    const [editingRuleId, setEditingRuleId] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, [id]);

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
    }

    const handleEdit = (rule) => {
        setEditingRuleId(rule._id);
        setRuleData({
            priority: rule.priority,
            condition: rule.condition,
            next_step_id: rule.next_step_id || ''
        });
    }

    if (loading && steps.length === 0) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

    const hasDefault = rules.some(r => r.condition.trim() === 'DEFAULT');

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            <div className="flex items-center space-x-4">
                <Link to={`/workflows/${id}/edit`} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition bg-white shadow-sm">
                    <ArrowLeft size={18} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">Rule Configurator</h1>
                    <p className="text-slate-500 text-sm mt-1">Define execution flow logic between steps</p>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-slate-200/40 border border-white">
                <div className="mb-6 border-b border-slate-100 pb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Active Step</label>
                    <select
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-secondary font-medium"
                        value={currentStepId || ''}
                        onChange={e => setSearchParams({ step: e.target.value })}
                    >
                        {steps.map(s => <option key={s._id} value={s._id}>{s.name} (Order: {s.order})</option>)}
                    </select>
                </div>

                {!hasDefault && rules.length > 0 && (
                    <div className="mb-6 p-4 bg-orange-50 text-orange-800 rounded-xl border border-orange-200 font-medium text-sm flex items-start">
                        <span className="mr-2">⚠️</span>
                        Warning: No 'DEFAULT' rule found. If no conditions match, the workflow engine will fail. It is highly recommended to add a DEFAULT rule with the lowest priority.
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 px-2">Rules Table (Evaluated top to bottom)</h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        {rules.length > 0 ? rules.map(rule => (
                            <RuleRow key={rule._id} rule={rule} steps={steps} onEdit={handleEdit} onDelete={handleDelete} />
                        )) : (
                            <div className="p-8 text-center text-slate-400 italic">No rules found for this step. Add one below.</div>
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-700 mb-4">{editingRuleId ? 'Edit Rule' : 'Add New Rule'}</h3>
                    <form className="space-y-4" onSubmit={handleSaveRule}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                                <input type="number" required placeholder="1" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    value={ruleData.priority} onChange={e => setRuleData({ ...ruleData, priority: e.target.value })} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Condition</label>
                                <input type="text" required placeholder="amount > 100 && country == 'US'" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                                    value={ruleData.condition} onChange={e => setRuleData({ ...ruleData, condition: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Next Step on Match</label>
                            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                                value={ruleData.next_step_id} onChange={e => setRuleData({ ...ruleData, next_step_id: e.target.value })}>
                                <option value="">-- Terminate Workflow (End) --</option>
                                {steps.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-200">
                            <div className="text-xs text-slate-500 max-w-sm">
                                Supported: <code className="bg-slate-200 px-1 rounded">==</code> <code className="bg-slate-200 px-1 rounded">&gt;=</code> <code className="bg-slate-200 px-1 rounded">&&</code> <code className="bg-slate-200 px-1 rounded">contains(field, 'val')</code> <code className="bg-slate-200 px-1 rounded">DEFAULT</code>
                            </div>
                            <div className="flex space-x-2">
                                {editingRuleId && (
                                    <button type="button" onClick={() => { setEditingRuleId(null); setRuleData({ priority: rules.length + 1, condition: '', next_step_id: '' }) }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                                )}
                                <button type="submit" className="bg-brand-secondary text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center hover:bg-violet-700 transition shadow-sm">
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
