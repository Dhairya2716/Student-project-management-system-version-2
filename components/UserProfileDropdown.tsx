'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Settings, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserData {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'FACULTY' | 'STUDENT';
}

interface UserProfileDropdownProps {
    user: UserData;
}

const roleGradients: Record<string, string> = {
    ADMIN: 'from-orange-500 to-amber-500',
    FACULTY: 'from-purple-500 to-violet-500',
    STUDENT: 'from-emerald-500 to-teal-500',
};

const roleAccents: Record<string, string> = {
    ADMIN: 'text-orange-500 dark:text-orange-400',
    FACULTY: 'text-purple-500 dark:text-purple-400',
    STUDENT: 'text-emerald-500 dark:text-emerald-400',
};

export default function UserProfileDropdown({ user }: UserProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    const gradient = roleGradients[user.role] || roleGradients.STUDENT;
    const accent = roleAccents[user.role] || roleAccents.STUDENT;

    const menuItems = [
        {
            icon: User,
            label: 'Profile',
            href: `/dashboard/${user.role.toLowerCase()}/profile`,
            hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-500/10',
            iconColor: 'text-purple-500 dark:text-purple-400'
        },
        {
            icon: Settings,
            label: 'Settings',
            href: `/dashboard/${user.role.toLowerCase()}/settings`,
            hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
            iconColor: 'text-blue-500 dark:text-blue-400'
        },
        {
            icon: Lock,
            label: 'Change Password',
            href: `/dashboard/${user.role.toLowerCase()}/change-password`,
            hoverColor: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
            iconColor: 'text-amber-500 dark:text-amber-400'
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-gray-100 dark:bg-white/[0.04] hover:bg-gray-200 dark:hover:bg-white/[0.08] border border-gray-200 dark:border-white/[0.06] hover:border-gray-300 dark:hover:border-white/[0.12] transition-all duration-300 group"
            >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
                    <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                    <p className={`text-[11px] font-medium ${accent}`}>{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-xl dark:shadow-2xl overflow-hidden z-50 animate-dropdown">
                    {/* User Info Header */}
                    <div className={`p-4 border-b border-gray-100 dark:border-white/[0.06] bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-white/[0.03] dark:to-transparent`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
                                <span className="text-white font-bold">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className={`text-xs ${accent} truncate`}>{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1.5">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    router.push(item.href);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${item.hoverColor} transition-all duration-200 group`}
                            >
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                                </div>
                                <span className="font-medium text-sm">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Logout */}
                    <div className="p-1.5 border-t border-gray-100 dark:border-white/[0.06]">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <LogOut className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
