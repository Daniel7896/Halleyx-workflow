import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Loader2, ArrowLeft, RotateCw, XCircle, CheckCircle2, XOctagon, AlertCircle } from 'lucide-react';

const fmt = (date) =>
    date ? new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' }) : null;

const ExecutionLogs = () => {
    const { id } = useParams();
    const [execution, setExecution] = useState(null);
    const [workflow, setWorkflow] = useState(null);
    const [steps, setSteps] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchExecution = async () => {
        try {
            setLoading(true);
            const exec = await client.get(`/executions/${id}`);
            setExecution(exec);

            // Fetch workflow name
            if (exec.workflow_id) {
                try {
                    const wf = await client.get(`/workflows/${exec.workflow_id}`);
                    setWorkflow(wf);

                    // Build a step name lookup map
                    const stepsData = await client.get(`/workflows/${exec.workflow_id}/steps`);
                    const stepMap = {};
                    stepsData.forEach(s => { stepMap[s._id] = s.name; });
                    setSteps(stepMap);
                } catch (_) { }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExecution(); }, [id]);

    const handleCancel = async () => {
        try {
            setActionLoading(true);
            await client.post(`/executions/${id}/cancel`);
            await fetchExecution();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRetry = async () => {
        try {
            setActionLoading(true);
            await client.post(`/executions/${id}/retry`);
            await fetchExecution();
        } catch (err) {
            setError(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading && !execution) {
        return (
            <div className="flex justify-center items-center py-20 text-brand-primary">
                <Loader2 className="animate-spin" size={40} />
            </div>
        );
    }

    if (error && !execution) {
        return (
            <div className="max-w-4xl mx-auto py-10 px-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium text-center">{error}</div>
            </div>
        );
    }

    if (!execution) return null;

    // FIX 6.2: Truncated ID
    const shortId = execution._id ? `${execution._id.substring(0, 8)}...` : '—';

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            <Link to="/workflows" className="inline-flex items-center text-slate-500 hover:text-brand-primary transition font-medium text-sm">
                <ArrowLeft size={16} className="mr-1" /> Back to Workflows
            </Link>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 font-medium text-sm">{error}</div>
            )}

            {/* FIX 6.2: Header section */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 p-6 border border-white">
                <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 leading-tight">Execution Logs</h1>
                        <p className="text-sm font-mono text-slate-400 mt-1" title={execution._id}>ID: {shortId}</p>
                    </div>
                    <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <StatusBadge status={execution.status} />
                        {/* FIX 6.5: Cancel button only if in_progress */}
                        {execution.status === 'in_progress' && (
                            <button
                                onClick={handleCancel}
                                disabled={actionLoading}
                                className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center transition disabled:opacity-50"
                            >
                                <XCircle size={14} className="mr-1" /> Cancel
                            </button>
                        )}
                        {/* FIX 6.4: Retry button only if failed */}
                        {execution.status === 'failed' && (
                            <button
                                onClick={handleRetry}
                                disabled={actionLoading}
                                className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg hover:bg-slate-900 flex items-center transition shadow-md shadow-slate-800/20 disabled:opacity-50"
                            >
                                {actionLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : <RotateCw size={14} className="mr-1" />}
                                Retry
                            </button>
                        )}
                    </div>
                </div>

                {/* FIX 6.2: All header metadata */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Workflow</div>
                        <div className="font-semibold text-slate-700">{workflow?.name || execution.workflow_id}</div>
                        <div className="text-xs text-slate-400 font-mono">v{execution.workflow_version}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Started At</div>
                        <div className="font-semibold text-slate-700 text-sm">{fmt(execution.started_at)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ended At</div>
                        <div className="font-semibold text-slate-700 text-sm">
                            {execution.ended_at ? fmt(execution.ended_at) : <span className="text-blue-500 italic">In Progress…</span>}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Steps Executed</div>
                        <div className="font-semibold text-slate-700">{execution.logs.length}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Retries</div>
                        <div className="font-semibold text-slate-700">{execution.retries ?? 0}</div>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Triggered By</div>
                        <div className="font-semibold text-slate-700 capitalize">{execution.triggered_by || 'system'}</div>
                    </div>
                </div>
            </div>

            {/* FIX 6.3: Timeline */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Execution Timeline</h2>
                {execution.logs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-white/50 backdrop-blur rounded-xl border border-white italic">
                        No steps were executed.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {execution.logs.map((log, idx) => (
                            <div key={idx} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-0">
                                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-[3px] border-white ${log.status === 'completed' ? 'bg-green-400' : log.status === 'failed' ? 'bg-red-400' : 'bg-slate-300'}`}></div>

                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 -mt-1.5 hover:shadow-md transition-shadow">
                                    {/* Step Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{log.step_name}</h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">{log.step_type}</span>
                                                <span className="text-xs text-slate-400">
                                                    {fmt(log.started_at)} → {fmt(log.ended_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <StatusBadge status={log.status} />
                                    </div>

                                    {/* Evaluated Rules */}
                                    {log.evaluated_rules && log.evaluated_rules.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluated Rules</h5>
                                            {log.evaluated_rules.map((evalRule, j) => {
                                                const isMatched = evalRule.rule_id === log.matched_rule_id;
                                                return (
                                                    // FIX 6.3: highlight matched rule with distinct background
                                                    <div key={j} className={`flex items-start space-x-2 p-2 rounded-lg text-sm transition-colors
                            ${isMatched ? 'bg-green-50 border border-green-200' : 'bg-slate-50 border border-slate-100'}`}>
                                                        {evalRule.result ? (
                                                            <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XOctagon size={16} className="text-slate-300 shrink-0 mt-0.5" />
                                                        )}
                                                        <code className={`font-mono text-xs leading-relaxed ${evalRule.result ? 'text-green-800 font-bold' : 'text-slate-500'}`}>
                                                            {evalRule.condition}
                                                        </code>
                                                        {isMatched && (
                                                            <span className="ml-auto text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0 uppercase">MATCHED</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* FIX 6.3: Next step or Workflow Ended */}
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span className="text-slate-500 font-medium">Next Step:</span>
                                        {log.selected_next_step ? (
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100 text-xs">
                                                {steps[log.selected_next_step] || log.selected_next_step}
                                            </span>
                                        ) : log.status === 'failed' ? (
                                            <span className="flex items-center text-red-500 font-bold text-xs">
                                                <AlertCircle size={14} className="mr-1" /> Failed to route
                                            </span>
                                        ) : (
                                            <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-100 text-xs uppercase">
                                                Workflow Ended
                                            </span>
                                        )}
                                    </div>

                                    {/* FIX 6.3: Error box */}
                                    {log.error && (
                                        <div className="mt-3 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 text-sm flex items-start space-x-2">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <span>{log.error}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExecutionLogs;
