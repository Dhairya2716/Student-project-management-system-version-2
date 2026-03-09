'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Bell, Check, CheckCheck, X, Info, Calendar, Users, ClipboardList } from 'lucide-react';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationBellProps {
    accentColor?: 'emerald' | 'purple'; // emerald = student, purple = faculty
}

const typeIcon = (type: string) => {
    if (type.includes('MEETING')) return <Calendar className="w-4 h-4" />;
    if (type.includes('GROUP')) return <Users className="w-4 h-4" />;
    if (type.includes('SUBMISSION') || type.includes('EVALUATION')) return <ClipboardList className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
};

const typeColor = (type: string) => {
    if (type.includes('MEETING')) return 'text-cyan-400 bg-cyan-500/10';
    if (type.includes('GROUP')) return 'text-emerald-400 bg-emerald-500/10';
    if (type.includes('EVALUATION') || type.includes('SUBMISSION')) return 'text-amber-400 bg-amber-500/10';
    return 'text-blue-400 bg-blue-500/10';
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell({ accentColor = 'emerald' }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const accent = accentColor === 'purple'
        ? { ring: 'ring-purple-500/20', dot: 'bg-purple-500', mark: 'text-purple-400 hover:bg-purple-500/10', all: 'bg-purple-500 hover:bg-purple-600' }
        : { ring: 'ring-emerald-500/20', dot: 'bg-emerald-500', mark: 'text-emerald-400 hover:bg-emerald-500/10', all: 'bg-emerald-500 hover:bg-emerald-600' };

    const token = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications?limit=20', {
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch { /* silent */ }
    };

    const markRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_read: true })
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        try {
            await fetch('/api/notifications/mark-all-read', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token()}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { /* silent */ }
    };

    // Fetch on mount, then poll every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const timer = setInterval(fetchNotifications, 30000);
        return () => clearInterval(timer);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        setOpen(o => !o);
        if (!open) fetchNotifications();
    };

    return (
        <div ref={ref} className="relative">
            {/* Bell button */}
            <button
                onClick={handleOpen}
                className={`relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/[0.06] transition-all duration-200 group ${open ? `ring-2 ${accent.ring}` : ''}`}
                aria-label="Notifications"
            >
                <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white ${accent.dot} rounded-full ring-2 ring-white dark:ring-[#0a0a12]`}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white dark:bg-[#13131f] border border-gray-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="font-semibold text-sm text-gray-900 dark:text-white">Notifications</span>
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-500">{unreadCount} new</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${accent.mark} transition-colors`} title="Mark all as read">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    All read
                                </button>
                            )}
                            <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-white/[0.04]">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <Bell className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-sm text-gray-400 dark:text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-white/[0.02]' : ''}`}
                                >
                                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center ${typeColor(n.type)}`}>
                                        {typeIcon(n.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        {n.link ? (
                                            <Link href={n.link} onClick={() => { markRead(n.id); setOpen(false); }}
                                                className="block font-medium text-sm text-gray-900 dark:text-white hover:underline truncate">
                                                {n.title}
                                            </Link>
                                        ) : (
                                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{n.title}</p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-1">{timeAgo(n.created_at)}</p>
                                    </div>
                                    {!n.is_read && (
                                        <button onClick={() => markRead(n.id)} className="mt-1 p-1 rounded-md text-gray-300 hover:text-emerald-400 transition-colors" title="Mark as read">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-white/[0.06]">
                            <p className="text-[10px] text-center text-gray-400 dark:text-gray-600">
                                Showing latest {notifications.length} notifications
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
