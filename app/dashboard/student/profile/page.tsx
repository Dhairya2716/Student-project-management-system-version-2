'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/StudentLayout';
import { User, Mail, Phone, BookOpen, GraduationCap, Building2, Save, FileText } from 'lucide-react';

interface StudentProfile {
    name: string;
    email: string;
    phone: string | null;
    enrollment_no: string | null;
    department: string;
    batch: string;
    description: string | null;
    cgpa: number | null;
}

export default function StudentProfile() {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [cgpa, setCgpa] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setPhone(data.phone || '');
                setDescription(data.description || '');
                setCgpa(data.cgpa?.toString() || '');
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
            const response = await fetch('/api/student/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone,
                    description,
                    cgpa: cgpa ? parseFloat(cgpa) : null
                })
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully' });
                fetchProfile(); // Refresh data
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Failed to update profile' });
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
            </StudentLayout>
        );
    }

    if (!profile) return null;

    return (
        <StudentLayout>
            <div className="p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                    <p className="text-white/50">Manage your personal information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Read-only Info */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">{profile.name.charAt(0)}</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                            <p className="text-white/50 text-sm">{profile.enrollment_no}</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                            <div className="flex items-center gap-3 text-white/70">
                                <Mail className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm">{profile.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/70">
                                <Building2 className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm">{profile.department}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/70">
                                <GraduationCap className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm">{profile.batch}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Form */}
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Editable Information</h3>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        About Me
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all min-h-[120px]"
                                            placeholder="Tell us about your interests and skills..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">
                                        Current CGPA / CPI
                                    </label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            value={cgpa}
                                            onChange={(e) => setCgpa(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            placeholder="8.5"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-white/30">
                                        This will be displayed on your dashboard and accessible to your faculty guide.
                                    </p>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl ${message.type === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    }`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
