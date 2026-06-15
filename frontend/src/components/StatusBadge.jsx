import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        completed: 'bg-green-500/10 text-green-400 border-green-500/20',
        failed: 'bg-red-500/10 text-red-400 border-red-500/20',
        canceled: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };

    const currentStyle = styles[status] || styles.pending;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} capitalize`}>
            {status?.replace('_', ' ') || 'unknown'}
        </span>
    );
};

export default StatusBadge;
