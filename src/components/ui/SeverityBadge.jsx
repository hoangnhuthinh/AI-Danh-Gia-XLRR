import React from 'react';

export const SeverityBadge = ({ level }) => {
    const styles = {
        high: 'bg-red-50 text-red-700 border-red-100',
        medium: 'bg-orange-50 text-orange-700 border-orange-100',
        low: 'bg-green-50 text-green-700 border-green-100',
    };
    const labels = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center gap-1 w-fit ${styles[level]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${level === 'high' ? 'bg-red-500' : level === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}></span>
            {labels[level]}
        </span>
    );
};
