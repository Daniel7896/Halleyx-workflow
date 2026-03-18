import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { Loader2, ArrowLeft, PlayCircle, CheckCircle2, ExternalLink } from 'lucide-react';

const ExecutionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [workflow, setWorkflow] = useState(null);
    const [formData, setFormData] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [error, setError] = useState('');
    const [successExecution, setSuccessExecution] = useState(null);

    useEffect(() => {
        fetchWorkflow();
    }, [id]);

    const fetchWorkflow = async () => {
        try {
            const data = await client.get(`/workflows/${id}`);
            setWorkflow(data);
            const initialForm = {};
            Object.keys(data.input_schema || {}).forEach(k => {
                initialForm[k] = data.input_schema[k].type === 'boolean' ? false : '';
            });
            setFormData(initialForm);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const validate = () => {
        const errors = {};
        const schema = workflow?.input_schema || {};
        Object.keys(schema).forEach(key => {
            const def = schema[key];
            const value = formData[key];
            if (def.required && (value === undefined || value === null || value === '')) {
                errors[key] = `${capitalize(key)} is required`;
            }
        });
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const handleExecute = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setExecuting(true);
            setError('');
            setSuccessExecution(null);

            const payload = { ...formData };
            Object.keys(workflow.input_schema || {}).forEach(k => {
                if (workflow.input_schema[k].type === 'number') {
                    payload[k] = payload[k] !== '' ? Number(payload[k]) : null;
                }
            });

            const execRes = await client.post(`/workflows/${id}/execute`, payload);
            setSuccessExecution(execRes);
        } catch (err) {
            setError(err.message);
        } finally {
            setExecuting(false);
        }
    };

    const renderField = (key, def) => {
        const value = formData[key] === undefined ? '' : formData[key];
        const onChange = (val) => {
            setFormData({ ...formData, [key]: val });
            if (fieldErrors[key]) setFieldErrors({ ...fieldErrors, [key]: '' });
        };

        const baseClasses = `w-full border-2 rounded-xl px-4 py-3 focus:outline-none transition-colors bg-slate-50 focus:bg-white text-slate-800 font-medium ${fieldErrors[key] ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-brand-primary'
            }`;

        if (def.type === 'boolean') {
            return (
                <label className="flex items-center space-x-3 cursor-pointer p-1">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={e => onChange(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-secondary shadow-inner"></div>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{value ? 'Yes' : 'No'}</span>
                </label>
            );
        }

        if (def.type === 'string' && def.allowed_values && def.allowed_values.length > 0) {
            return (
                <select
                    required={def.required}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={baseClasses}
                >
                    <option value="" disabled>Select {capitalize(key)}</option>
                    {def.allowed_values.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            );
        }

        if (def.type === 'number') {
            return (
                <input
                    type="number"
                    required={def.required}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className={baseClasses}
                    placeholder="0"
                />
            );
        }

        return (
            <input
                type="text"
                required={def.required}
                value={value}
                onChange={e => onChange(e.target.value)}
                className={baseClasses}
                placeholder={`Enter ${key}`}
            />
        );
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

    const schemaKeys = Object.keys(workflow?.input_schema || {});

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center space-x-4 mb-8">
                <Link to="/workflows" className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition bg-white shadow-sm">
                    <ArrowLeft size={18} className="text-slate-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">Execute Workflow</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">{workflow?.name} (v{workflow?.version})</p>
                </div>
            </div>

            {/* FIX 5.3: Success banner with execution ID and navigation */}
            {successExecution && (
                <div className="mb-8 bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                        <CheckCircle2 size={24} className="text-green-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-green-800 text-lg">Execution Started Successfully!</h3>
                            <p className="text-green-700 text-sm mt-1 font-mono">
                                Execution ID: <span className="font-bold">{successExecution._id}</span>
                            </p>
                            <p className="text-green-700 text-sm mt-1">
                                Status: <span className="font-bold capitalize">{successExecution.status}</span>
                            </p>
                            <button
                                onClick={() => navigate(`/executions/${successExecution._id}`)}
                                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm flex items-center transition shadow-sm"
                            >
                                <ExternalLink size={16} className="mr-2" /> View Execution Logs
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium mb-8">
                    {error}
                </div>
            )}

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 border border-white p-8">
                {schemaKeys.length === 0 ? (
                    <div className="text-center py-10">
                        <h3 className="text-slate-500 font-medium mb-4">This workflow requires no start parameters.</h3>
                        <button
                            onClick={handleExecute}
                            disabled={executing}
                            className="bg-brand-primary hover:bg-pink-600 text-white px-8 py-3 rounded-xl font-bold transition flex items-center justify-center mx-auto shadow-lg shadow-brand-primary/20 space-x-2 disabled:opacity-50"
                        >
                            {executing ? <Loader2 size={20} className="animate-spin" /> : <PlayCircle size={20} />}
                            <span>Start Execution</span>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleExecute} noValidate className="space-y-6">
                        {schemaKeys.map(key => {
                            const def = workflow.input_schema[key];
                            return (
                                <div key={key}>
                                    {/* FIX 5.1: Capitalized label with red asterisk for required */}
                                    <label className="flex items-center text-sm font-bold text-slate-700 mb-2">
                                        {capitalize(key)}
                                        {def.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                                        <span className="ml-2 text-xs font-normal text-slate-400 capitalize">({def.type})</span>
                                    </label>
                                    {renderField(key, def)}
                                    {/* FIX 5.2: Inline validation error under each field */}
                                    {fieldErrors[key] && (
                                        <p className="mt-1.5 text-sm text-red-500 font-medium">{fieldErrors[key]}</p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-6 mt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={executing}
                                className="w-full bg-brand-primary hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center shadow-xl shadow-brand-primary/30 space-x-2 disabled:opacity-50"
                            >
                                {executing ? <Loader2 size={24} className="animate-spin" /> : <PlayCircle size={24} />}
                                <span>Launch Workflow Now</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ExecutionPage;
