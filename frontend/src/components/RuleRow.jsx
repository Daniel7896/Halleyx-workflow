import React from 'react';
import { ArrowRight, Trash2, Edit } from 'lucide-react';

const RuleRow = ({ rule, steps, onEdit, onDelete }) => {
    const nextStep = rule.next_step_id ? steps.find(s => s._id === rule.next_step_id) : null;
    const nextStepName = nextStep ? nextStep.name : 'End Workflow';

    return (
        <div className="group flex items-center justify-between p-3 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                    {rule.priority}
                </div>
                <div className="flex items-center space-x-3">
                    <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-mono whitespace-nowrap">
                        {rule.condition}
                    </code>
                    <ArrowRight size={16} className="text-slate-400" />
                    <span className={`text-sm font-medium px-2 py-1 rounded ${!rule.next_step_id ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-700'}`}>
                        {nextStepName}
                    </span>
                </div>
            </div>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(rule)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit size={16} />
                </button>
                <button onClick={() => onDelete(rule._id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
};

export default RuleRow;
