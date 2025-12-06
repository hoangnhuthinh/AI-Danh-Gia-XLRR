import React from 'react';
import { Menu } from 'lucide-react';

export const Header = ({ currentView, onToggleSidebar }) => (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={onToggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 hidden sm:block">
                {currentView === 'ai_import' ? 'Thẩm định & Phân tích AI' :
                    currentView === 'list' ? 'Danh sách Tờ trình' : 'Tổng quan Hệ thống'}
            </h2>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-700">Nguyễn Văn A</p>
                <p className="text-xs text-slate-500">Chuyên viên XLN</p>
            </div>
            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border-2 border-indigo-50">A</div>
        </div>
    </header>
);
