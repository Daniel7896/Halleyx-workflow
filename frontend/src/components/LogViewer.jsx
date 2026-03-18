import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

const LogViewer = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 bg-white/50 backdrop-blur rounded-xl border border-white">
                No logs to display
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {logs.map((log, idx) => (
                <div key={idx} className="relative pl-6 pb-2 border-l-2 border-slate-200 last:border-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 border-[3px] border-white"></div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 -mt-1.5 relative hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="font-bold text-slate-800 text-lg">{log.step_name}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                                        {log.step_type}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {new Date(log.started_at).toLocaleTimeString()} - {new Date(log.ended_at).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            <StatusBadge status={log.status} />
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluated Rules</h5>
                            {log.evaluated_rules.map((evalRule, j) => (
                                <div key={j} className="flex items-center space-x-2 text-sm">
                                    {evalRule.result ? (
                                        <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                                    ) : (
                                        <XCircle size={16} className="text-slate-300 shrink-0" />
                                    )}
                                    <code className={`px-2 py-0.5 rounded font-mono text-xs ${evalRule.result ? 'bg-green-100 text-green-800 font-bold' : 'bg-white text-slate-500 border border-slate-200'}`}>
                                        {evalRule.condition}
                                    </code>
                                </div>
                            ))}

                            {log.evaluated_rules.length === 0 && (
                                <div className="text-sm text-slate-400 italic">No rules found</div>
                            )}
                        </div>

                        <div className="mt-4 flex items-center space-x-2 text-sm">
                            <span className="text-slate-500 font-medium">Selected Next Step:</span>
                            {log.selected_next_step ? (
                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100 text-xs">
                                    {log.selected_next_step}
                                </span>
                            ) : log.status === 'failed' ? (
                                <span className="flex items-center text-red-500 font-bold">
                                    <AlertCircle size={16} className="mr-1" /> Failed to route
                                </span>
                            ) : (
                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded font-bold border border-orange-100 text-xs uppercase">
                                    Workflow Ended
                                </span>
                            )}
                        </div>

                        {log.error && (
                            <div className="mt-3 bg-red-50 text-red-600 p-2 rounded border border-red-100 text-sm flex items-start space-x-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{log.error}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LogViewer;
