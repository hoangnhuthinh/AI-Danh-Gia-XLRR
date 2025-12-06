import React from 'react';

export const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        approved: 'bg-green-100 text-green-800 border-green-200',
        rejected: 'bg-red-100 text-red-800 border-red-200',
        need_info: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    const labels = { pending: 'Chờ phê duyệt', approved: 'Đã duyệt', rejected: 'Từ chối', need_info: 'Cần bổ sung' };
    return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>{labels[status]}</span>;
};
