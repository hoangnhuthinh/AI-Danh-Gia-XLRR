import React, { useState, useEffect } from 'react';
import { Users, Trash2, Shield, ShieldOff, Search, UserCheck, UserX, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminView = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load users from Supabase
    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setUsers(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // Toggle admin status
    const toggleAdmin = async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (updateError) throw updateError;
            loadUsers();
        } catch (err) {
            alert('Lỗi: ' + err.message);
        }
    };

    // Delete user completely (profile + auth.users)
    const deleteUser = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa user này? Hành động này sẽ xóa hoàn toàn tài khoản.')) {
            try {
                // Call the delete_user_completely function we created in Supabase
                const { error: deleteError } = await supabase
                    .rpc('delete_user_completely', { user_id: userId });

                if (deleteError) throw deleteError;

                alert('✅ Đã xóa user thành công!');
                loadUsers();
            } catch (err) {
                alert('Lỗi: ' + err.message);
            }
        }
    };

    // Filter users by search term
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-accent to-indigo-600 p-6 rounded-xl text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8" />
                        <div>
                            <h1 className="text-2xl font-bold">Admin Panel</h1>
                            <p className="text-indigo-100 text-sm">Quản lý người dùng từ Supabase Cloud</p>
                        </div>
                    </div>
                    <button
                        onClick={loadUsers}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                    <button onClick={loadUsers} className="ml-auto text-sm underline">Thử lại</button>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-sky-card p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-text">{users.length}</div>
                            <div className="text-sm text-sky-text-secondary">Tổng số Users</div>
                        </div>
                    </div>
                </div>
                <div className="bg-sky-card p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-text">
                                {users.filter(u => u.role === 'Admin').length}
                            </div>
                            <div className="text-sm text-sky-text-secondary">Admins</div>
                        </div>
                    </div>
                </div>
                <div className="bg-sky-card p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <UserX className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-text">
                                {users.filter(u => u.role !== 'Admin').length}
                            </div>
                            <div className="text-sm text-sky-text-secondary">Regular Users</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-sky-card p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-sky-accent focus:ring-2 focus:ring-sky-accent/20 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-sky-card rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        Đang tải...
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-sky-text-secondary border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold">#</th>
                                <th className="px-4 py-3 font-semibold">Tên</th>
                                <th className="px-4 py-3 font-semibold">Email</th>
                                <th className="px-4 py-3 font-semibold">Vai trò</th>
                                <th className="px-4 py-3 font-semibold">Ngày đăng ký</th>
                                <th className="px-4 py-3 font-semibold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                                        {searchTerm ? 'Không tìm thấy user nào' : 'Chưa có user nào đăng ký'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3 font-medium text-sky-text">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-sky-accent/10 rounded-full flex items-center justify-center text-sky-accent font-bold text-sm">
                                                    {user.avatar || user.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                {user.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${user.role === 'Admin'
                                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                {user.role === 'Admin' ? <Shield className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                                {user.role || 'User'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => toggleAdmin(user.id, user.role)}
                                                    className={`p-2 rounded-lg transition-colors ${user.role === 'Admin'
                                                        ? 'text-purple-500 hover:bg-purple-50'
                                                        : 'text-slate-400 hover:bg-slate-100'
                                                        }`}
                                                    title={user.role === 'Admin' ? 'Bỏ quyền Admin' : 'Cấp quyền Admin'}
                                                >
                                                    {user.role === 'Admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa user"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Supabase Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <p className="font-semibold mb-1">☁️ Supabase Cloud Database</p>
                <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Dữ liệu được lưu trên cloud - không mất khi deploy</li>
                    <li>Xác thực bảo mật với Supabase Auth</li>
                    <li>Row Level Security (RLS) bảo vệ dữ liệu</li>
                </ul>
            </div>
        </div>
    );
};
