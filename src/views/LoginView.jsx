import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, User, ArrowRight, Loader2, Globe } from 'lucide-react';

export const LoginView = () => {
    const { login, register, loginWithGoogle } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        console.log('📝 Form submitted:', { isLogin, email, name });

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
            console.log('✅ Auth success!');
        } catch (error) {
            console.error('❌ Auth error:', error);
            setErrorMessage(error.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-bg to-slate-100">
            {/* Centered Login Form */}
            <div className="w-full max-w-md p-6">
                {/* Branding header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        <ShieldAlert className="w-12 h-12 text-sky-accent" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">AI Wise Recovery Login</h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Phân tích rủi ro & đề xuất phương án thu hồi nợ tối ưu với Google AI
                    </p>
                </div>

                <div className="bg-sky-card p-2 rounded-xl border border-slate-200 flex mb-6">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isLogin ? 'bg-sky-accent text-white shadow-md' : 'text-sky-text-secondary hover:text-sky-text'}`}
                    >
                        Đăng nhập
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isLogin ? 'bg-sky-accent text-white shadow-md' : 'text-sky-text-secondary hover:text-sky-text'}`}
                    >
                        Đăng ký
                    </button>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        ❌ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-text-secondary" />
                            <input
                                type="text"
                                placeholder="Họ và tên đầy đủ"
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/20 outline-none transition-all placeholder:text-slate-400"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-text-secondary" />
                        <input
                            type="email"
                            placeholder="Email làm việc"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/20 outline-none transition-all placeholder:text-slate-400"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-text-secondary" />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/20 outline-none transition-all placeholder:text-slate-400"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-sky-accent text-white font-bold rounded-xl shadow-lg shadow-sky-accent/30 hover:bg-sky-accent/90 transition-all flex items-center justify-center gap-2 group"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {!loading && (
                            <>
                                {isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-sky-bg text-sky-text-secondary">Hoặc tiếp tục với</span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 bg-white border border-slate-200 text-sky-text font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
                >
                    {/* Simple Google Icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </button>

                <p className="text-center text-xs text-sky-text-secondary mt-8">
                    Bằng việc đăng nhập, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật.
                </p>
            </div>
        </div>
    );
};
