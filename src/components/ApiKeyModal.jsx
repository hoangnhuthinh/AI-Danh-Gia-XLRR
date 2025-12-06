import React, { useState, useEffect } from 'react';
import { Key, Lock, Check, X } from 'lucide-react';

export const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('google_api_key');
        if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            localStorage.setItem('google_api_key', apiKey.trim());
            onSave(apiKey.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 transform transition-all scale-100">
                <div className="flex items-center gap-3 mb-4 text-indigo-600">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <Key className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Cấu hình Google AI</h3>
                </div>

                <p className="text-slate-600 mb-4 text-sm">
                    Để sử dụng tính năng phân tích AI nâng cao, vui lòng nhập <strong>Google AI API Key</strong> của bạn. Key sẽ được lưu an toàn trong trình duyệt của bạn.
                </p>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type={isVisible ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-mono"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        onClick={() => setIsVisible(!isVisible)}
                    >
                        {isVisible ? <span className="text-xs font-bold">HIDE</span> : <span className="text-xs font-bold">SHOW</span>}
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!apiKey.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                        <Check className="w-4 h-4" /> Lưu & Tiếp tục
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium hover:underline">
                        Chưa có key? Lấy API Key tại đây
                    </a>
                </div>
            </div>
        </div>
    );
};
