import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-slate-100 text-slate-700 border-slate-200',
        in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-green-100 text-green-700 border-green-200',
        failed: 'bg-red-100 text-red-700 border-red-200',
        canceled: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };

    const currentStyle = styles[status] || styles.pending;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${currentStyle} capitalize`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default StatusBadge;
