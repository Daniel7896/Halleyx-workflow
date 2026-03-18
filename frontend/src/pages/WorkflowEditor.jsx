import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import SchemaBuilder from '../components/SchemaBuilder';
import StepCard from '../components/StepCard';
import { Loader2, ArrowLeft, Save, Plus, GitMerge } from 'lucide-react';

const WorkflowEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState(null);
    const [steps, setSteps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Step Form State
    const [showStepForm, setShowStepForm] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [stepData, setStepData] = useState({ name: '', step_type: 'task', order: 1, metadata: '' });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [wfRes, stepsRes] = await Promise.all([
                client.get(`/workflows/${id}`),
                client.get(`/workflows/${id}/steps`)
            ]);
            // Ensure input_schema is never null
            if (!wfRes.input_schema) wfRes.input_schema = {};
            setWorkflow(wfRes);
            setSteps(stepsRes);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWorkflow = async () => {
        try {
            setSaving(true);
            const wfToSave = {
                name: workflow.name,
                is_active: workflow.is_active,
                input_schema: workflow.input_schema,
                start_step_id: workflow.start_step_id
            };
            const res = await client.put(`/workflows/${id}`, wfToSave);
            setWorkflow(res);
            alert('Workflow saved successfully!');
        } catch (err) {
            alert(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveStep = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            let parsedMetadata = {};
            if (stepData.metadata.trim()) {
                try { parsedMetadata = JSON.parse(stepData.metadata); }
                catch (_) { throw new Error('Metadata must be valid JSON'); }
            }

            const payload = { ...stepData, metadata: parsedMetadata };
            delete payload.metadataString;

            if (editingStep) {
                await client.put(`/steps/${editingStep._id}`, payload);
            } else {
                await client.post(`/workflows/${id}/steps`, payload);
            }

            await fetchData();
            setShowStepForm(false);
            setEditingStep(null);
            setStepData({ name: '', step_type: 'task', order: steps.length + 1, metadata: '' });
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleEditStep = (step) => {
        setEditingStep(step);
        setStepData({
            name: step.name,
            step_type: step.step_type,
            order: step.order,
            metadata: Object.keys(step.metadata || {}).length ? JSON.stringify(step.metadata, null, 2) : ''
        });
        setShowStepForm(true);
    };

    const handleDeleteStep = async (stepId) => {
        if (!window.confirm('Are you sure you want to delete this step? Rules associated might break.')) return;
        try {
            await client.delete(`/steps/${stepId}`);
            if (workflow.start_step_id === stepId) {
                setWorkflow({ ...workflow, start_step_id: null });
            }
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleSetStartStep = async (stepId) => {
        try {
            setSaving(true);
            const res = await client.put(`/workflows/${id}`, { ...workflow, start_step_id: stepId });
            setWorkflow(res);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20 text-brand-primary">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    if (error || !workflow) return (
        <div className="text-center p-10 font-bold text-red-500">{error || 'Workflow not found'}</div>
    );

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-10">
            <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white sticky top-[72px] z-30 shadow-sm">
                <div className="flex items-center space-x-4">
                    <Link to="/workflows" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition bg-white shadow-sm">
                        <ArrowLeft size={18} className="text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Editing Workflow</h1>
                        <p className="text-xs text-slate-500 font-mono">ID: {id}</p>
                    </div>
                </div>
                <button
                    onClick={handleSaveWorkflow}
                    disabled={saving}
                    className="bg-brand-secondary hover:bg-violet-700 text-white px-5 py-2 rounded-lg flex items-center shadow-md font-semibold transition text-sm disabled:opacity-50"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={16} className="mr-2" />}
                    Save Changes
                </button>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-xl shadow-slate-200/40">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-4">
                    1. General Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-600 mb-2">Workflow Name</label>
                        <input
                            type="text"
                            className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-brand-primary focus:outline-none transition-colors font-medium text-slate-800"
                            value={workflow.name}
                            onChange={e => setWorkflow({ ...workflow, name: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center pt-8 space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={workflow.is_active}
                                onChange={e => setWorkflow({ ...workflow, is_active: e.target.checked })}
                            />
                            <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                            <span className="ml-3 text-sm font-bold text-slate-700">{workflow.is_active ? 'Active' : 'Inactive'}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-xl shadow-slate-200/40">
                <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center border-b border-slate-100 pb-4">
                    2. Input Schema
                </h2>
                <p className="text-slate-500 mb-6 text-sm">Define the dynamic fields required to start this workflow. This structures the intake form.</p>
                <SchemaBuilder
                    schema={workflow.input_schema}
                    onChange={(newSchema) => setWorkflow({ ...workflow, input_schema: newSchema })}
                />
            </div>

            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white shadow-xl shadow-slate-200/40">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-extrabold text-slate-800">3. Steps Pipeline</h2>
                    <button
                        onClick={() => {
                            setEditingStep(null);
                            setStepData({ name: '', step_type: 'task', order: steps.length + 1, metadata: '' });
                            setShowStepForm(true);
                        }}
                        className="flex items-center space-x-1 text-sm bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition font-medium"
                    >
                        <Plus size={16} /> <span>Add Step</span>
                    </button>
                </div>

                {showStepForm && (
                    <form onSubmit={handleSaveStep} className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-4">{editingStep ? 'Edit Step' : 'New Step'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Order</label>
                                <input type="number" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    value={stepData.order} onChange={e => setStepData({ ...stepData, order: Number(e.target.value) })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Step Name</label>
                                <input type="text" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    value={stepData.name} onChange={e => setStepData({ ...stepData, name: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Step Type</label>
                                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    value={stepData.step_type} onChange={e => setStepData({ ...stepData, step_type: e.target.value })}>
                                    <option value="task">Task</option>
                                    <option value="approval">Approval</option>
                                    <option value="notification">Notification</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Metadata (JSON)</label>
                                <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono" rows="3"
                                    placeholder='{"assignee": "me@example.com"}'
                                    value={stepData.metadata} onChange={e => setStepData({ ...stepData, metadata: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={() => setShowStepForm(false)} className="px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                            <button type="submit" className="px-4 py-1.5 text-sm font-medium bg-brand-primary text-white hover:bg-pink-600 rounded-lg transition flex items-center">
                                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save Step'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {steps.map(step => (
                        <div key={step._id} className="relative group">
                            <StepCard
                                step={step}
                                isStartStep={workflow.start_step_id === step._id}
                                onEdit={handleEditStep}
                                onDelete={handleDeleteStep}
                                onSetStart={handleSetStartStep}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition duration-300">
                                <Link to={`/workflows/${id}/rules?step=${step._id}`} className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-2 text-xs font-bold rounded-lg flex items-center shadow-sm">
                                    <GitMerge size={14} className="mr-1" /> Rules
                                </Link>
                            </div>
                        </div>
                    ))}
                    {steps.length === 0 && !showStepForm && (
                        <div className="text-center py-10 text-slate-400 italic">No steps added. Add your first step above!</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowEditor;
