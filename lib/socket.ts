import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface Notification {
    id: number;
    user_id: number;
    user_role: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

const getSocketUrl = (): string => {
    if (typeof window !== 'undefined') {
        return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    }
    return 'http://localhost:3001';
};

export const initSocket = (token: string): Socket => {
    if (socket && socket.connected) {
        return socket;
    }

    socket = io(getSocketUrl(), {
        auth: {
            token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    socket.on('connect', () => {
        console.log('Socket.io connected');
    });

    socket.on('disconnect', () => {
        console.log('Socket.io disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.io connection error:', error.message);
    });

    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Event listeners
export const onNewNotification = (callback: (notification: Notification) => void) => {
    if (socket) {
        socket.on('new-notification', callback);
    }
};

export const offNewNotification = () => {
    if (socket) {
        socket.off('new-notification');
    }
};

export const markNotificationRead = (notificationId: number) => {
    if (socket) {
        socket.emit('mark-notification-read', notificationId);
    }
};
