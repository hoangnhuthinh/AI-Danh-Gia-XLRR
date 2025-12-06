import React from 'react';
import { LayoutDashboard, FileText, Sparkles, ShieldAlert, Settings, Zap, ZapOff, Shield, Loader2 } from 'lucide-react';

export const Sidebar = ({ currentView, onNavigate, isOpen, onOpenSettings, isApiConnected, isTestingApi, isAdmin }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
        { id: 'list', label: 'Danh sách Tờ trình', icon: FileText },
        { id: 'ai_import', label: 'Smart Import AI', icon: Sparkles, highlight: true },
        ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: Shield, adminOnly: true }] : []),
    ];


    return (
        <aside className={`fixed lg:static z-30 h-full bg-sky-nav border-r border-slate-200 text-sky-text transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 lg:w-20'} overflow-hidden flex flex-col`}>
            <div className="h-16 flex items-center px-6 font-bold text-xl tracking-tight border-b border-slate-200 shrink-0">
                {isOpen ? (
                    <span className="flex items-center gap-2 text-slate-800"><ShieldAlert className="text-sky-accent" /> AI Wise Recovery</span>
                ) : (
                    <ShieldAlert className="text-sky-accent mx-auto" />
                )}
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all font-medium
              ${currentView === item.id
                                ? 'bg-sky-accent text-white shadow-lg shadow-sky-accent/20'
                                : item.highlight
                                    ? 'bg-gradient-to-r from-sky-accent/10 to-transparent text-sky-accent border border-sky-accent/20 hover:bg-sky-accent/20'
                                    : 'text-sky-text-secondary hover:bg-slate-100 hover:text-sky-text'}`}
                    >
                        <item.icon className={`w-5 h-5 ${item.highlight && currentView !== item.id ? 'text-sky-accent' : ''}`} />
                        {isOpen && <span>{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* API Status Indicator */}
            <div className="px-3 pb-2">
                <div
                    onClick={onOpenSettings}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${isTestingApi
                            ? 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200'
                            : isApiConnected
                                ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                                : 'bg-red-50 hover:bg-red-100 border border-red-200'
                        }`}
                >
                    {isTestingApi ? (
                        <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                    ) : isApiConnected ? (
                        <Zap className="w-4 h-4 text-green-600" />
                    ) : (
                        <ZapOff className="w-4 h-4 text-red-500" />
                    )}
                    {isOpen && (
                        <span className={`text-xs font-semibold ${isTestingApi ? 'text-yellow-700' : isApiConnected ? 'text-green-700' : 'text-red-600'
                            }`}>
                            {isTestingApi ? 'Đang kiểm tra...' : isApiConnected ? 'API Kết nối OK' : 'Chưa kết nối API'}
                        </span>
                    )}
                    <span className={`w-2 h-2 rounded-full ml-auto ${isTestingApi ? 'bg-yellow-500 animate-pulse' : isApiConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`}></span>
                </div>
            </div>

            <div className="p-3 border-t border-slate-200">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium text-sky-text-secondary hover:bg-slate-100 hover:text-sky-text"
                >
                    <Settings className="w-5 h-5" />
                    {isOpen && <span>Cấu hình AI</span>}
                </button>
            </div>
        </aside>
    );
};
