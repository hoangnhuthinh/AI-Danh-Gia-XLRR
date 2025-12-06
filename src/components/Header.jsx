import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Header = ({ currentView, onToggleSidebar }) => {
    const { currentUser, logout } = useAuth();

    const viewName = {
        'ai_import': 'Thẩm định & Phân tích AI',
        'list': 'Danh sách Tờ trình',
        // Add other view mappings here if needed
    };

    return (
        <header className="h-16 bg-sky-nav border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-sky-text-secondary hover:text-sky-text lg:hidden">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2 text-sky-text-secondary text-sm font-medium">
                    <span className="opacity-60">Application</span>
                    <span className="opacity-40">/</span>
                    <span className="text-sky-text">{viewName[currentView] || 'Tổng quan'}</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sky-text-secondary" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm hồ sơ..."
                        className="pl-9 pr-4 py-1.5 bg-slate-100 border border-transparent focus:bg-white focus:border-sky-accent/50 rounded-full text-sm text-sky-text focus:outline-none focus:ring-2 focus:ring-sky-accent/20 w-64 transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>

                {currentUser && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-bold text-sky-text">{currentUser.name}</div>
                            <div className="text-xs text-sky-text-secondary">{currentUser.role}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-accent to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-sky-accent/20">
                            {currentUser.avatar}
                        </div>
                        <button
                            onClick={logout}
                            className="ml-2 p-2 text-sky-text-secondary hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
