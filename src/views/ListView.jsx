import React from 'react';
import { PlusCircle, Trash2, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Helper to get AI recommendation badge
const AIRecommendationBadge = ({ action }) => {
    if (!action) return <span className="text-slate-400 text-xs">N/A</span>;

    const config = {
        approve: { label: 'Phê duyệt', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: CheckCircle },
        reject: { label: 'Từ chối', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
        review: { label: 'Thẩm định', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: AlertTriangle }
    };

    const c = config[action] || config.review;
    const Icon = c.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
            <Icon className="w-3 h-3" />
            {c.label}
        </span>
    );
};

// Format datetime
const formatDateTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Format currency
const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

export const ListView = ({ requests, onStartAI, onSelect, onDelete }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-sky-card p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-sky-text">Danh sách Tờ trình Xử lý nợ</h2>
                <p className="text-sm text-sky-text-secondary">Quản lý các phương án đang chờ phê duyệt</p>
            </div>
            <button onClick={onStartAI} className="flex items-center gap-2 px-4 py-2 bg-sky-accent text-white rounded-lg hover:bg-sky-accent/90 font-medium text-sm shadow-md transition-all hover:shadow-lg">
                <PlusCircle className="w-4 h-4" /> Tạo Tờ trình Mới
            </button>
        </div>

        {requests.length === 0 ? (
            <div className="bg-sky-card rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-sky-text mb-2">Chưa có tờ trình nào</h3>
                <p className="text-sky-text-secondary mb-6">Bạn chưa tải lên hồ sơ nào. Hãy bắt đầu ngay!</p>
                <button onClick={onStartAI} className="px-6 py-2 bg-sky-accent text-white rounded-lg hover:bg-sky-accent/90 font-medium">
                    Tạo mới ngay
                </button>
            </div>
        ) : (
            <div className="bg-sky-card rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[900px]">
                    <thead className="bg-slate-50 text-sky-text-secondary border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold">Mã TT</th>
                            <th className="px-4 py-3 font-semibold">Tên KH</th>
                            <th className="px-4 py-3 font-semibold text-right">Dư nợ gốc</th>
                            <th className="px-4 py-3 font-semibold text-right">Dư nợ lãi</th>
                            <th className="px-4 py-3 font-semibold">Đánh giá AI</th>
                            <th className="px-4 py-3 font-semibold">Ngày-Giờ</th>
                            <th className="px-4 py-3 font-semibold text-right">Xóa</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {requests.map(req => {
                            // Extract data from request
                            const customerName = req.extractedData?.customerName || 'N/A';
                            const principal = req.extractedData?.debtDetails?.principal || req.extractedData?.totalOutstanding || 0;
                            const interest = req.extractedData?.debtDetails?.interest || 0;
                            const aiAction = req.aiAnalysis?.recommendation?.action;
                            const evalDate = req.date || req.createdAt;

                            return (
                                <tr
                                    key={req.id}
                                    onClick={() => onSelect(req)}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-4 py-3 font-mono font-bold text-sky-accent group-hover:text-sky-accent/80 text-xs">
                                        {req.id}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-sky-text">
                                        {customerName}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-700">
                                        {formatCurrency(principal)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-500">
                                        {formatCurrency(interest)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <AIRecommendationBadge action={aiAction} />
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {formatDateTime(evalDate)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(req.id);
                                            }}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);
