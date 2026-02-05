'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Building2, Save, Loader2 } from 'lucide-react';

interface ProfileData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    description: string | null;
    department?: {
        id: number;
        name: string;
        code: string;
    };
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        description: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const response = await fetch('/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    phone: data.phone || '',
                    description: data.description || ''
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || `Failed to fetch profile: ${response.status} ${response.statusText}`;
                console.error('Profile fetch failed:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                });
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setProfile(data.user);

                // Update localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data.user }));

                setTimeout(() => setMessage(null), 3000);
            } else {
                throw new Error(data.error || 'Failed to update profile');
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">My Profile</h1>
                    <p className="text-white/50 mt-1">Manage your personal information</p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center mb-4">
                                <span className="text-white font-bold text-3xl">{profile?.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                            <p className="text-purple-400 text-sm">{profile?.role}</p>
                            {profile?.department && (
                                <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                    <p className="text-xs text-white/50">Department</p>
                                    <p className="text-sm text-white font-medium">{profile.department.name}</p>
                                    <p className="text-xs text-purple-400">{profile.department.code}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-6">
                        <h3 className="text-xl font-bold text-white">Edit Profile</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={profile?.email}
                                    disabled
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 cursor-not-allowed"
                                />
                                <p className="text-xs text-white/30 mt-1">Email cannot be changed</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all"
                                    placeholder="+91 1234567890"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                    About / Bio
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-violet-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
