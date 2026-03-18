import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Plus, Play, Edit2, Loader2, Workflow } from 'lucide-react';

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
            navigate(`/workflows/${data._id}/edit`);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                            <Workflow size={28} />
                        </div>
                        Workflows
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and monitor automation pipelines</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-lg shadow-slate-800/20 font-semibold"
                >
                    <Plus size={20} /> <span>New Workflow</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 font-medium shadow-sm flex items-center">
                    <span className="mr-2">⚠️</span> {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center py-20 text-slate-400">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            ) : (
                <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 border border-white overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100/60 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Version</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs">Created At</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/60">
                            {workflows.map((wf) => (
                                <tr key={wf._id} className="hover:bg-white/80 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-700">{wf.name}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-sm border-l border-slate-100/50">v{wf.version}</td>
                                    <td className="px-6 py-4 border-l border-slate-100/50">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${wf.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {wf.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm border-l border-slate-100/50">
                                        {new Date(wf.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right border-l border-slate-100/50">
                                        <div className="flex justify-end space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/workflows/${wf._id}/edit`}
                                                className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center space-x-1 font-semibold text-xs"
                                            >
                                                <Edit2 size={14} /> <span>Edit</span>
                                            </Link>
                                            <Link
                                                to={`/workflows/${wf._id}/execute`}
                                                className="px-3 py-1.5 bg-brand-primary text-white shadow-sm shadow-brand-primary/30 rounded-lg hover:bg-pink-600 transition flex items-center space-x-1 font-semibold text-xs"
                                            >
                                                <Play size={14} /> <span>Execute</span>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {workflows.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic font-medium">
                                        No workflows found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white transform transition-all">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6">Create New Workflow</h2>
                        <form onSubmit={handleCreate}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Workflow Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-primary focus:bg-white transition-colors"
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
                                    className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newName.trim()}
                                    className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-pink-600 transition shadow-md shadow-brand-primary/20 disabled:opacity-50"
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
