// Auth helper for Sports Hub.
//
// Session tokens live in httpOnly cookies set by the API, so JS can't read
// or exfiltrate them. This file only caches non-sensitive user info
// (id, email) in localStorage for rendering the signed-in UI.
const API_BASE_URL = window.API_BASE || window.location.origin;

class AuthManager {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    }

    isLoggedIn() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }

    async login(email, password) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || 'Login failed');
        }

        return await response.json();
    }

    async register(email, password) {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.detail || 'Registration failed');
        }

        return await response.json();
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('auth_user', JSON.stringify(user));
    }

    clearUser() {
        this.user = null;
        localStorage.removeItem('auth_user');
        // Legacy cleanup — older builds stored a token here.
        localStorage.removeItem('auth_token');
    }

    async validateSession() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.user_id && data.email) {
                    this.setUser({ id: data.user_id, email: data.email });
                    return true;
                }
            }
            this.clearUser();
            return false;
        } catch (e) {
            // Network error — keep whatever is cached locally
            return this.isLoggedIn();
        }
    }

    async logout() {
        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (e) {
            console.error('Logout failed:', e);
        }
        this.clearUser();
    }
}

const auth = new AuthManager();
