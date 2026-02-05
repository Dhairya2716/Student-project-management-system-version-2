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

    const menuItems = [
        {
            icon: User,
            label: 'Profile',
            href: `/dashboard/${user.role.toLowerCase()}/profile`,
            color: 'text-purple-400'
        },
        {
            icon: Settings,
            label: 'Settings',
            href: `/dashboard/${user.role.toLowerCase()}/settings`,
            color: 'text-blue-400'
        },
        {
            icon: Lock,
            label: 'Change Password',
            href: `/dashboard/${user.role.toLowerCase()}/change-password`,
            color: 'text-yellow-400'
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all group"
            >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user.name.charAt(0)}</span>
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-purple-400">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-white/10 bg-gradient-to-br from-purple-500/10 to-violet-500/10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                <p className="text-xs text-purple-400 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-2">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    router.push(item.href);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all group"
                            >
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-2 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all group"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
