import React from 'react';
import { PlusCircle } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RISK_TYPES } from '../data/mockData';

export const ListView = ({ requests, onStartAI }) => (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Danh sách Tờ trình Xử lý nợ</h2>
                <p className="text-sm text-slate-500">Quản lý các phương án đang chờ phê duyệt</p>
            </div>
            <button onClick={onStartAI} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-md transition-all hover:shadow-lg">
                <PlusCircle className="w-4 h-4" /> Tạo Tờ trình Mới
            </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Số Tờ trình</th>
                        <th className="px-6 py-4 font-semibold">Tên Phương án</th>
                        <th className="px-6 py-4 font-semibold text-right">Tổng Dư nợ</th>
                        <th className="px-6 py-4 font-semibold">Loại hình</th>
                        <th className="px-6 py-4 font-semibold">Trạng thái</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {requests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                            <td className="px-6 py-4 font-mono font-bold text-indigo-600 group-hover:text-indigo-700">{req.id}</td>
                            <td className="px-6 py-4 font-medium text-slate-700">
                                {req.title}
                                <div className="text-xs text-slate-400 font-normal mt-0.5">{req.department}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-600">
                                {new Intl.NumberFormat('vi-VN').format(req.amount)} ₫
                            </td>
                            <td className="px-6 py-4">
                                {RISK_TYPES.find(r => r.id === req.type)?.label || req.type}
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
