import React from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';

export const DashboardView = ({ onNavigate, onStartAI }) => (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6 px-4">
        <div className="p-4 sm:p-6 bg-sky-accent/10 rounded-full animate-in zoom-in duration-500">
            <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 text-sky-accent" />
        </div>
        <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-sky-text mb-2">Hệ thống Phê duyệt Phương án Xử lý nợ</h2>
            <p className="text-sky-text-secondary max-w-lg mx-auto text-sm sm:text-base">Nền tảng hỗ trợ thẩm định, đánh giá khả năng thu hồi và phê duyệt phương án xử lý nợ tập trung với sự hỗ trợ của AI.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button onClick={onStartAI} className="px-5 sm:px-6 py-3 bg-sky-accent text-white font-bold rounded-lg hover:bg-sky-accent/90 shadow-lg shadow-sky-accent/20 flex items-center justify-center gap-2 transition-all hover:scale-105">
                <Sparkles className="w-5 h-5" /> Bắt đầu Smart Import AI
            </button>
            <button onClick={() => onNavigate('list')} className="px-5 sm:px-6 py-3 bg-sky-card border border-slate-200 text-sky-text font-medium rounded-lg hover:bg-slate-50 transition-all">
                Xem danh sách hồ sơ
            </button>
        </div>
    </div>
);
