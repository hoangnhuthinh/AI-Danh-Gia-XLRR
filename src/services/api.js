// API Service for backend authentication

const API_BASE = '/api';

// Helper to get token from sessionStorage
const getToken = () => sessionStorage.getItem('auth_token');

// Helper to make authenticated requests
const authFetch = async (url, options = {}) => {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
    }

    return data;
};

// Auth API
export const authAPI = {
    login: async (email, password) => {
        const data = await authFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (data.token) {
            sessionStorage.setItem('auth_token', data.token);
        }
        return data;
    },

    register: async (name, email, password) => {
        const data = await authFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        if (data.token) {
            sessionStorage.setItem('auth_token', data.token);
        }
        return data;
    },

    getCurrentUser: async () => {
        return authFetch('/auth/me');
    },

    logout: () => {
        sessionStorage.removeItem('auth_token');
    }
};

// Users API (Admin)
export const usersAPI = {
    getAll: async () => {
        return authFetch('/users');
    },

    updateRole: async (userId, role) => {
        return authFetch(`/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
    },

    delete: async (userId) => {
        return authFetch(`/users/${userId}`, {
            method: 'DELETE'
        });
    }
};

export { getToken };
