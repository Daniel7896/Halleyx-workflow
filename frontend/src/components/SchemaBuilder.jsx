import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const SchemaBuilder = ({ schema, onChange }) => {
    const [newKey, setNewKey] = useState('');
    const [newType, setNewType] = useState('string');
    const [newReq, setNewReq] = useState(false);
    const [newAllowed, setNewAllowed] = useState('');

    const handleAdd = () => {
        if (!newKey.trim()) return;
        const update = { ...schema };
        update[newKey.trim()] = {
            type: newType,
            required: newReq,
        };
        if (newAllowed.trim() && newType === 'string') {
            update[newKey.trim()].allowed_values = newAllowed.split(',').map(s => s.trim());
        }
        onChange(update);
        setNewKey('');
        setNewAllowed('');
        setNewReq(false);
        setNewType('string');
    };

    const handleDelete = (key) => {
        const update = { ...schema };
        delete update[key];
        onChange(update);
    };

    const keys = Object.keys(schema || {});

    return (
        <div className="space-y-4">
            <div className="border border-white/[0.08] rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.03] border-b border-white/[0.06]">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Field Name</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Type</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Required</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider">Allowed Values</th>
                            <th className="px-4 py-3 font-semibold text-slate-500 uppercase text-xs tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {keys.map((key) => (
                            <tr key={key} className="hover:bg-white/[0.03] transition-colors">
                                <td className="px-4 py-3 font-mono text-white font-medium">{key}</td>
                                <td className="px-4 py-3">
                                    <span className="bg-brand-primary/10 text-brand-primary text-xs px-2 py-0.5 rounded capitalize font-semibold">{schema[key].type}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {schema[key].required ? (
                                        <span className="text-green-400 font-medium">Yes</span>
                                    ) : (
                                        <span className="text-slate-500">No</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {schema[key].allowed_values ? schema[key].allowed_values.join(', ') : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => handleDelete(key)} className="text-slate-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded transition">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {keys.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-slate-500 italic">No schema fields defined</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-white/[0.03] p-4 border border-white/[0.08] rounded-xl flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Field Name</label>
                    <input
                        type="text"
                        value={newKey} onChange={e => setNewKey(e.target.value)}
                        className="input-dark text-sm"
                        placeholder="e.g. amount"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                    <select
                        value={newType} onChange={e => setNewType(e.target.value)}
                        className="input-dark text-sm"
                    >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                    </select>
                </div>
                <div className="mb-2 flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="reqCheck"
                        checked={newReq} onChange={e => setNewReq(e.target.checked)}
                        className="rounded border-white/20 bg-white/5 text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="reqCheck" className="text-sm font-medium text-slate-300">Required</label>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Allowed Values (csv)</label>
                    <input
                        type="text"
                        value={newAllowed} onChange={e => setNewAllowed(e.target.value)}
                        disabled={newType !== 'string'}
                        className="input-dark text-sm disabled:opacity-30"
                        placeholder="High, Medium, Low"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="btn-primary px-4 py-2.5 flex items-center space-x-1 text-sm h-[40px]"
                >
                    <Plus size={16} /> <span>Add</span>
                </button>
            </div>
        </div>
    );
};

export default SchemaBuilder;
