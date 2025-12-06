import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { SUPER_ADMIN_EMAIL } from './db.js';
import { authenticateToken, requireAdmin, JWT_SECRET } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Check if email is super admin
const isSuperAdmin = (email) => email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
        }

        // Check if user exists
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email đã được sử dụng' });
        }

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Super admin email always gets Admin role
        const role = isSuperAdmin(email) ? 'Admin' : 'User';

        // Insert user
        const result = db.prepare(`
            INSERT INTO users (name, email, password, role, avatar)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, email, hashedPassword, role, name.charAt(0).toUpperCase());

        const user = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ user, token });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
        }

        // Find user by email
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Verify password
        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User không tồn tại' });
        }
        res.json({ user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        const users = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC').all();
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Update user role (Admin only)
app.put('/api/users/:id/role', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['Admin', 'User'].includes(role)) {
            return res.status(400).json({ error: 'Role không hợp lệ' });
        }

        db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
        const user = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users WHERE id = ?').get(id);

        res.json({ user });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { id } = req.params;

        // Prevent self-delete
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Không thể tự xóa chính mình' });
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
🚀 AI Wise Recovery Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Running on: http://localhost:${PORT}
📚 API Endpoints:
   POST /api/auth/register - Đăng ký
   POST /api/auth/login    - Đăng nhập
   GET  /api/auth/me       - Thông tin user
   GET  /api/users         - (Admin) Danh sách users
   PUT  /api/users/:id/role - (Admin) Đổi role
   DELETE /api/users/:id   - (Admin) Xóa user
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
});
