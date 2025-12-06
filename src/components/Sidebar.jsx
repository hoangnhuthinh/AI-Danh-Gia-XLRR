import React from 'react';
import { LayoutDashboard, FileText, Sparkles, ShieldAlert, Settings } from 'lucide-react';

export const Sidebar = ({ currentView, onNavigate, isOpen, onOpenSettings }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'list', label: 'Danh sách Tờ trình', icon: FileText },
        { id: 'ai_import', label: 'Smart Import AI', icon: Sparkles, highlight: true },
    ];

    return (
        <aside className={`fixed lg:static z-30 h-full bg-slate-900 text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden flex flex-col`}>
            <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-slate-800 shrink-0">
                {isOpen ? (
                    <span className="flex items-center gap-2 text-white"><ShieldAlert className="text-indigo-400" /> DebtGuard AI</span>
                ) : (
                    <ShieldAlert className="text-indigo-400 mx-auto" />
                )}
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium
              ${currentView === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : item.highlight
                                    ? 'bg-gradient-to-r from-indigo-900 to-slate-900 text-indigo-200 border border-indigo-800/50 hover:text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <item.icon className={`w-5 h-5 ${item.highlight && currentView !== item.id ? 'text-indigo-400' : ''}`} />
                        {isOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                    <Settings className="w-5 h-5" />
                    {isOpen && <span>Cấu hình AI</span>}
                </button>
            </div>
        </aside>
    );
};
