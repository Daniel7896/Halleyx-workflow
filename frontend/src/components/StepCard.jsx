import React from 'react';
import { Settings, Play, Trash2, Edit2 } from 'lucide-react';

const StepCard = ({ step, onEdit, onDelete, onSetStart, isStartStep }) => {
    return (
        <div className={`p-4 rounded-xl border-2 transition-all duration-300 relative bg-white/60 backdrop-blur-sm 
      ${isStartStep ? 'border-brand-primary shadow-brand-primary/20 shadow-lg' : 'border-white hover:border-slate-300 hover:shadow-md'}`}>

            {isStartStep && (
                <span className="absolute -top-3 left-4 bg-brand-primary text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-sm">
                    Start Step
                </span>
            )}

            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 text-white font-bold text-sm shadow-inner shrink-0">
                        {step.order}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-lg flex items-center space-x-2">
                            <span>{step.name}</span>
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs font-medium uppercase">
                                {step.step_type}
                            </span>
                        </div>
                        {step.metadata && Object.keys(step.metadata).length > 0 && (
                            <div className="mt-3 text-xs text-slate-500 bg-white/50 p-2 rounded-md border border-slate-100">
                                <pre className="whitespace-pre-wrap font-mono uppercase tracking-wider text-[10px]">
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
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:text-brand-primary transition-colors flex items-center space-x-1"
                            title="Set as start step"
                        >
                            <Play size={14} /> <span>Start Step</span>
                        </button>
                    )}
                    <button
                        onClick={() => onEdit(step)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-md hover:bg-blue-50 text-blue-600 transition-colors flex items-center space-x-1"
                    >
                        <Edit2 size={14} /> <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(step._id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-100 rounded-md hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-1"
                    >
                        <Trash2 size={14} /> <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StepCard;
