import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Plus, Play, Edit2, Loader2, Workflow, Trash2 } from 'lucide-react';

const WorkflowList = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const data = await client.get('/workflows');
            setWorkflows(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            const data = await client.post('/workflows', { name: newName });
            setShowModal(false);
            setNewName('');
            navigate(`/workflows/${data._id}/edit`);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this workflow and all its steps/rules?')) return;
        try {
            await client.delete(`/workflows/${id}`);
            fetchWorkflows();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                            <Workflow size={28} />
                        </div>
                        Workflows
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage and monitor automation pipelines</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center space-x-2"
                >
                    <Plus size={20} /> <span>New Workflow</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl border border-red-500/20 mb-6 font-medium flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="animate-spin text-brand-primary" size={40} />
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Version</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Created</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {workflows.map((wf) => (
                                <tr key={wf._id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-6 py-4 font-bold text-white">{wf.name}</td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-sm">v{wf.version}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${wf.is_active ? 'bg-green-500/10 text-green-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {wf.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(wf.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/workflows/${wf._id}/edit`}
                                                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition flex items-center space-x-1 font-semibold text-xs"
                                            >
                                                <Edit2 size={14} /> <span>Edit</span>
                                            </Link>
                                            <Link
                                                to={`/workflows/${wf._id}/execute`}
                                                className="px-3 py-1.5 bg-brand-primary text-white shadow-sm shadow-brand-primary/30 rounded-lg hover:bg-indigo-500 transition flex items-center space-x-1 font-semibold text-xs"
                                            >
                                                <Play size={14} /> <span>Execute</span>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(wf._id)}
                                                className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition flex items-center space-x-1 font-semibold text-xs"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {workflows.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic font-medium">
                                        No workflows found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="glass-panel p-8 w-full max-w-md animate-fade-in-up">
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Workflow</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-300 mb-2">Workflow Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="input-dark"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    required
                                    placeholder="e.g. Employee Onboarding"
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary px-5 py-2.5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newName.trim()}
                                    className="btn-primary disabled:opacity-50"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowList;
