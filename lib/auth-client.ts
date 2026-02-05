import { TokenPayload } from './auth';

export function setAuthToken(token: string) {
    // Store token in cookie (will be set by server, this is for client-side reference)
    if (typeof window !== 'undefined') {
        localStorage.setItem('user_token', token);
    }
}

export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('user_token');
    }
    return null;
}

export function removeAuthToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user_token');
        // Clear cookie by calling logout API
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => { });
    }
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function getCurrentUser(): TokenPayload | null {
    const token = getAuthToken();
    if (!token) return null;
    return decodeToken(token);
}

export function getDashboardUrl(role: string): string {
    switch (role) {
        case 'ADMIN':
            return '/dashboard/admin';
        case 'FACULTY':
            return '/dashboard/faculty';
        case 'STUDENT':
            return '/dashboard/student';
        default:
            return '/dashboard';
    }
}

export function redirectToDashboard(role: string) {
    if (typeof window !== 'undefined') {
        window.location.href = getDashboardUrl(role);
    }
}
