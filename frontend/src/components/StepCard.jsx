import React from 'react';
import { Play, Trash2, Edit2 } from 'lucide-react';

const StepCard = ({ step, onEdit, onDelete, onSetStart, isStartStep }) => {
    return (
        <div className={`p-4 rounded-xl border-2 transition-all duration-300 relative backdrop-blur-sm 
      ${isStartStep
            ? 'border-brand-primary/40 bg-brand-primary/5 shadow-lg shadow-brand-primary/10'
            : 'border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:shadow-md'}`}>

            {isStartStep && (
                <span className="absolute -top-3 left-4 bg-brand-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                    Start Step
                </span>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white font-bold text-sm shrink-0 border border-white/10">
                        {step.order}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg flex items-center space-x-2">
                            <span>{step.name}</span>
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-0.5 bg-white/10 text-slate-400 rounded text-xs font-medium uppercase">
                                {step.step_type}
                            </span>
                        </div>
                        {step.metadata && Object.keys(step.metadata).length > 0 && (
                            <div className="mt-3 text-xs text-slate-500 bg-white/[0.03] p-2 rounded-md border border-white/[0.06]">
                                <pre className="whitespace-pre-wrap font-mono text-[10px]">
                                    {JSON.stringify(step.metadata, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    {!isStartStep && (
                        <button
                            onClick={() => onSetStart(step._id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md hover:bg-brand-primary/10 hover:text-brand-primary hover:border-brand-primary/20 transition-colors flex items-center space-x-1 text-slate-400"
                            title="Set as start step"
                        >
                            <Play size={14} /> <span>Start Step</span>
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(step)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/10 rounded-md hover:bg-blue-500/10 text-blue-400 hover:border-blue-500/20 transition-colors flex items-center space-x-1"
                    >
                        <Edit2 size={14} /> <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(step._id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white/5 border border-red-500/10 rounded-md hover:bg-red-500/10 text-red-400 hover:border-red-500/20 transition-colors flex items-center space-x-1"
                    >
                        <Trash2 size={14} /> <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepCard;
