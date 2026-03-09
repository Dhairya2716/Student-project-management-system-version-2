'use client';

import { useState, useEffect } from 'react';
import StudentLayout from '@/components/StudentLayout';
import Link from 'next/link';
import {
    User, Mail, Phone, BookOpen, GraduationCap, Building2,
    Save, FileText, Users, Calendar, Star, ChevronRight,
    CheckCircle, Clock, Loader2, Edit3, Shield
} from 'lucide-react';

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

interface GroupInfo {
    id: number;
    name: string;
    title: string;
    status: string;
    isLeader: boolean;
    memberCount: number;
    meetingCount: number;
}

export default function StudentProfile() {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [group, setGroup] = useState<GroupInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editing, setEditing] = useState(false);

    const [phone, setPhone] = useState('');
    const [description, setDescription] = useState('');
    const [cgpa, setCgpa] = useState('');

    const token = () => localStorage.getItem('token');

    useEffect(() => {
        Promise.all([
            fetch('/api/student/profile', { headers: { Authorization: `Bearer ${token()}` } })
                .then(r => r.ok ? r.json() : null),
            fetch('/api/student/group', { headers: { Authorization: `Bearer ${token()}` } })
                .then(r => r.ok ? r.json() : null)
        ]).then(([prof, grp]) => {
            if (prof) {
                setProfile(prof);
                setPhone(prof.phone || '');
                setDescription(prof.description || '');
                setCgpa(prof.cgpa?.toString() || '');
            }
            if (grp) setGroup(grp);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/student/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
                body: JSON.stringify({ phone, description, cgpa: cgpa ? parseFloat(cgpa) : null })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setEditing(false);
                const updated = await fetch('/api/student/profile', { headers: { Authorization: `Bearer ${token()}` } });
                if (updated.ok) setProfile(await updated.json());
            } else {
                const err = await res.json();
                setMessage({ type: 'error', text: err.error || 'Failed to update' });
            }
        } catch { setMessage({ type: 'error', text: 'Something went wrong' }); }
        finally { setSaving(false); }
    };

    const cgpaColor = (v: number | null) => {
        if (!v) return 'text-gray-400';
        if (v >= 8.5) return 'text-emerald-400';
        if (v >= 7) return 'text-cyan-400';
        if (v >= 6) return 'text-amber-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
            </StudentLayout>
        );
    }

    if (!profile) return null;

    const initials = profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return (
        <StudentLayout>
            <div className="p-8 max-w-5xl mx-auto">
                {/* Hero Banner */}
                <div className="relative mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/20 dark:border-emerald-500/10 p-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                                <span className="text-3xl font-bold text-white">{initials}</span>
                            </div>
                            {group?.isLeader && (
                                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow">
                                    <Star className="w-3.5 h-3.5 text-white fill-white" />
                                </div>
                            )}
                        </div>
                        {/* Identity */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium mt-0.5">{profile.enrollment_no || 'No enrollment no.'}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Building2 className="w-3.5 h-3.5" /> {profile.department || '—'}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <GraduationCap className="w-3.5 h-3.5" /> {profile.batch || '—'}
                                </span>
                                {profile.cgpa && (
                                    <span className={`flex items-center gap-1 text-xs font-semibold ${cgpaColor(profile.cgpa)}`}>
                                        <BookOpen className="w-3.5 h-3.5" /> CPI {profile.cgpa.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                        {/* Edit toggle */}
                        <button onClick={() => setEditing(!editing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${editing
                                ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                            <Edit3 className="w-4 h-4" />
                            {editing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column — info cards */}
                    <div className="space-y-4">
                        {/* Contact Info */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{profile.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">Phone</p>
                                        <p className="text-sm text-gray-700 dark:text-gray-200">{profile.phone || <span className="text-gray-400 italic">Not set</span>}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Academic Info */}
                        <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Academic</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: Building2, label: 'Department', value: profile.department },
                                    { icon: GraduationCap, label: 'Batch', value: profile.batch },
                                    { icon: BookOpen, label: 'CPI / CGPA', value: profile.cgpa ? `${profile.cgpa.toFixed(2)} / 10` : null },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-200">{value || <span className="italic text-gray-400">Not set</span>}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Group Card */}
                        {group ? (
                            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Project Group</h3>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {group.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{group.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{group.title}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                                        {group.memberCount || '—'} members
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                                        {group.meetingCount || 0} meetings
                                    </div>
                                    {group.isLeader && (
                                        <div className="col-span-2 flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                                            <Star className="w-3.5 h-3.5 fill-amber-400" /> Group Leader
                                        </div>
                                    )}
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border ${group.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : group.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                    {group.status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {group.status}
                                </span>
                            </div>
                        ) : (
                            <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-dashed border-gray-300 dark:border-white/10 text-center">
                                <Users className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                                <p className="text-xs text-gray-400 mb-3">Not in a group yet</p>
                                <Link href="/dashboard/student/team/create"
                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center justify-center gap-1 transition-colors">
                                    Create a group <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}

                        {/* Quick link to Settings */}
                        <Link href="/dashboard/student/settings"
                            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-emerald-500/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Password</p>
                                    <p className="text-xs text-gray-400">Security settings</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    </div>

                    {/* Right column — edit form */}
                    <div className="lg:col-span-2">
                        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Personal Information</h2>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {editing ? 'Make changes and click Save' : 'Click Edit Profile to update your details'}
                                    </p>
                                </div>
                                {editing && (
                                    <span className="px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">Editing</span>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Read-only fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Full Name</label>
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl">
                                            <User className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{profile.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl">
                                            <Mail className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Editable fields */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                                    {editing ? (
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                                                placeholder="+91 98765 43210"
                                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 text-sm transition-all" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl">
                                            <Phone className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{profile.phone || <span className="italic text-gray-400">Not set</span>}</span>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">CPI / CGPA <span className="text-gray-300 dark:text-gray-600">(0–10)</span></label>
                                    {editing ? (
                                        <div className="relative">
                                            <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="number" step="0.01" min="0" max="10" value={cgpa} onChange={e => setCgpa(e.target.value)}
                                                placeholder="8.50"
                                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 text-sm transition-all" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl">
                                            <BookOpen className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                                            <span className={`text-sm font-semibold ${cgpaColor(profile.cgpa)}`}>
                                                {profile.cgpa ? `${profile.cgpa.toFixed(2)} / 10` : <span className="italic text-gray-400 font-normal">Not set</span>}
                                            </span>
                                        </div>
                                    )}
                                    <p className="mt-1.5 text-xs text-gray-400">Visible to your faculty guide and displayed on your team page</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">About Me</label>
                                    {editing ? (
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                            <textarea value={description} onChange={e => setDescription(e.target.value)}
                                                placeholder="Tell us about your interests, skills, and goals..."
                                                rows={4}
                                                className="w-full pl-11 pr-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 text-sm transition-all resize-none" />
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-xl min-h-[80px]">
                                            {profile.description
                                                ? <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.description}</p>
                                                : <p className="text-sm italic text-gray-400">No bio added yet. Click Edit Profile to add one.</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Toast */}
                                {message && (
                                    <div className={`flex items-center gap-3 p-3.5 rounded-xl text-sm border ${message.type === 'success'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                        {message.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : null}
                                        {message.text}
                                    </div>
                                )}

                                {editing && (
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button type="button" onClick={() => { setEditing(false); setMessage(null); }}
                                            className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white transition-all text-sm">
                                            Discard
                                        </button>
                                        <button type="submit" disabled={saving}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 text-sm shadow-lg shadow-emerald-500/20">
                                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </StudentLayout>
    );
}
