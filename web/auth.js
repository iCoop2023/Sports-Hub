// Auth helper for Sports Hub.
//
// Session tokens live in httpOnly cookies set by the API, so JS can't read
// or exfiltrate them. This file only caches non-sensitive user info
// (id, email) in localStorage for rendering the signed-in UI.
const API_BASE_URL = window.API_BASE || 'https://sports-hub-sepia.vercel.app';

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

    async sendMagicLink(email) {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            throw new Error('Failed to send magic link');
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
