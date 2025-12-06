import React, { useState, useEffect } from 'react';
import { Key, Lock, Check, X } from 'lucide-react';

export const ApiKeyModal = ({ isOpen, onClose, onSave, currentApiKey }) => {
    const [apiKey, setApiKey] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Load from prop when modal opens
    useEffect(() => {
        if (isOpen && currentApiKey) {
            setApiKey(currentApiKey);
        }
    }, [isOpen, currentApiKey]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (apiKey.trim()) {
            onSave(apiKey.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-sky-card rounded-xl shadow-2xl w-full max-w-md p-6 m-4 transform transition-all scale-100 border border-white/10">
                <div className="flex items-center gap-3 mb-4 text-sky-accent">
                    <div className="p-2 bg-sky-accent/10 rounded-lg">
                        <Key className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-sky-text">Cấu hình Google AI</h3>
                </div>

                <p className="text-sky-text-secondary mb-4 text-sm">
                    Để sử dụng tính năng phân tích AI nâng cao, vui lòng nhập <strong>Google AI API Key</strong> của bạn. Key sẽ được lưu an toàn trong trình duyệt của bạn.
                </p>

                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-sky-text-secondary" />
                    </div>
                    <input
                        type={isVisible ? "text" : "password"}
                        className="w-full pl-10 pr-10 py-2.5 bg-sky-bg border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-accent/50 focus:border-sky-accent outline-none transition-all text-sm font-mono text-sky-text placeholder:text-gray-600"
                        placeholder="AIzaSy..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sky-text-secondary hover:text-white"
                        onClick={() => setIsVisible(!isVisible)}
                    >
                        {isVisible ? <span className="text-xs font-bold">HIDE</span> : <span className="text-xs font-bold">SHOW</span>}
                    </button>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sky-text-secondary font-medium hover:bg-white/5 rounded-lg transition-colors text-sm"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!apiKey.trim()}
                        className="px-4 py-2 bg-sky-accent text-white font-bold rounded-lg hover:bg-sky-accent/90 transition-all shadow-lg shadow-sky-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                        <Check className="w-4 h-4" /> Lưu & Tiếp tục
                    </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-sky-accent hover:text-blue-400 font-medium hover:underline">
                        Chưa có key? Lấy API Key tại đây
                    </a>
                </div>
            </div>
        </div>
    );
};
