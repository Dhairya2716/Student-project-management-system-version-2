'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    CheckCircle,
    Mail,
    Phone,
    Shield
} from 'lucide-react';

interface Staff {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: 'FACULTY' | 'ADMIN';
    department?: { name: string; code: string } | null;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

export default function StaffPage() {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'FACULTY' as 'FACULTY' | 'ADMIN',
        departmentId: '',
    });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
    }, []);

    const fetchStaff = async () => {
        try {
            const res = await fetch('/api/admin/staff');
            if (res.ok) {
                const data = await res.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingStaff ? `/api/admin/staff/${editingStaff.id}` : '/api/admin/staff';
            const res = await fetch(url, {
                method: editingStaff ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: editingStaff ? 'Staff updated!' : 'Staff created!' });
                fetchStaff();
                closeModal();
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'Operation failed' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this staff member?')) return;

        try {
            const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Staff deleted!' });
                fetchStaff();
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({ name: '', email: '', phone: '', password: '', role: 'FACULTY', departmentId: '' });
        setShowModal(true);
    };

    const openEditModal = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            email: staff.email,
            phone: staff.phone || '',
            password: '',
            role: staff.role,
            departmentId: '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStaff(null);
    };

    const filteredStaff = staffList.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Staff Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage faculty and admin users</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                    <Plus className="w-5 h-5" />
                    Add Staff
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <CheckCircle className="w-5 h-5" />
                    {message.text}
                </div>
            )}

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search staff..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading staff...</p>
                    </div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{searchQuery ? 'No staff found' : 'No staff members yet'}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Name</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Email</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Phone</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Role</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Department</th>
                                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="border-b border-white/5 hover:bg-white dark:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
                                                <span className="text-gray-900 dark:text-white font-bold">{staff.name.charAt(0)}</span>
                                            </div>
                                            <span className="text-gray-900 dark:text-white font-medium">{staff.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Mail className="w-4 h-4" />
                                            {staff.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Phone className="w-4 h-4" />
                                            {staff.phone || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${staff.role === 'ADMIN'
                                                ? 'bg-red-500/10 text-red-400'
                                                : 'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                        {staff.department?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(staff)} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(staff.id)} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-lg bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-white">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
                            <button onClick={closeModal} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                {!editingStaff && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Password</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingStaff}
                                            minLength={6}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'FACULTY' | 'ADMIN' })}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50 transition-all"
                                    >
                                        <option value="FACULTY" className="bg-[#12121a]">Faculty</option>
                                        <option value="ADMIN" className="bg-[#12121a]">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Department</label>
                                    <select
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50 transition-all"
                                    >
                                        <option value="" className="bg-[#12121a]">Select Department</option>
                                        {departments.map((d) => (
                                            <option key={d.id} value={d.id} className="bg-[#12121a]">{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:bg-white/10 transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {editingStaff ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
