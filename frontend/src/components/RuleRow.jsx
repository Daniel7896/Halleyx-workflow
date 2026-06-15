import React from 'react';
import { ArrowRight, Trash2, Edit } from 'lucide-react';

const RuleRow = ({ rule, steps, onEdit, onDelete }) => {
    const nextStep = rule.next_step_id ? steps.find(s => s._id === rule.next_step_id) : null;
    const nextStepName = nextStep ? nextStep.name : 'End Workflow';

    return (
        <div className="group flex items-center justify-between p-3 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 text-slate-300 flex items-center justify-center font-bold text-sm">
                    {rule.priority}
                </div>
                <div className="flex items-center space-x-3">
                    <code className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded text-sm font-mono whitespace-nowrap">
                        {rule.condition}
                    </code>
                    <ArrowRight size={16} className="text-slate-600" />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${!rule.next_step_id ? 'bg-orange-500/10 text-orange-400' : 'bg-white/10 text-slate-300'}`}>
                        {nextStepName}
                    </span>
                </div>
            </div>
            <div className="flex space-x-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(rule)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded transition">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(rule._id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default RuleRow;
