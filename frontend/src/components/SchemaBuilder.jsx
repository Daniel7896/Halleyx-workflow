import React, { useState } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

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
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-2 font-medium">Field Name</th>
                            <th className="px-4 py-2 font-medium">Type</th>
                            <th className="px-4 py-2 font-medium">Required</th>
                            <th className="px-4 py-2 font-medium">Allowed Values</th>
                            <th className="px-4 py-2 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {keys.map((key) => (
                            <tr key={key} className="hover:bg-slate-50">
                                <td className="px-4 py-2 font-mono text-slate-700">{key}</td>
                                <td className="px-4 py-2">
                                    <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded capitalize">{schema[key].type}</span>
                                </td>
                                <td className="px-4 py-2">
                                    {schema[key].required ? (
                                        <span className="text-green-600 font-medium">Yes</span>
                                    ) : (
                                        <span className="text-slate-400">No</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-slate-500">
                                    {schema[key].allowed_values ? schema[key].allowed_values.join(', ') : '-'}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button onClick={() => handleDelete(key)} className="text-slate-400 hover:text-red-500 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {keys.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-6 text-center text-slate-400 italic">No schema fields defined</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Field Name</label>
                    <input
                        type="text"
                        value={newKey} onChange={e => setNewKey(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent text-sm"
                        placeholder="e.g. amount"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Type</label>
                    <select
                        value={newType} onChange={e => setNewType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-secondary text-sm"
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
                        className="rounded border-slate-300 text-brand-secondary focus:ring-brand-secondary"
                    />
                    <label htmlFor="reqCheck" className="text-sm font-medium text-slate-700">Required</label>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Allowed Values (csv)</label>
                    <input
                        type="text"
                        value={newAllowed} onChange={e => setNewAllowed(e.target.value)}
                        disabled={newType !== 'string'}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-secondary disabled:bg-slate-100 disabled:text-slate-400 text-sm"
                        placeholder="High, Medium, Low"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-brand-secondary text-white px-4 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-violet-700 transition shadow-sm font-medium text-sm h-[34px]"
                >
                    <Plus size={16} /> <span>Add</span>
                </button>
            </div>
        </div>
    );
};

export default SchemaBuilder;
