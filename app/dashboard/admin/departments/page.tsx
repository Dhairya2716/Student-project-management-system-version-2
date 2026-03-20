'use client';

import { useState, useEffect } from 'react';
import {
    Building,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    CheckCircle
} from 'lucide-react';

interface Department {
    id: number;
    name: string;
    code: string;
    _count?: { staff: number; student: number };
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            if (res.ok) {
                const data = await res.json();
                setDepartments(data);
            }
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingDept
                ? `/api/admin/departments/${editingDept.id}`
                : '/api/admin/departments';

            const res = await fetch(url, {
                method: editingDept ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: editingDept ? 'Department updated!' : 'Department created!' });
                fetchDepartments();
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
        if (!confirm('Are you sure you want to delete this department?')) return;

        try {
            const res = await fetch(`/api/admin/departments/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Department deleted!' });
                fetchDepartments();
            } else {
                setMessage({ type: 'error', text: 'Failed to delete department' });
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const openCreateModal = () => {
        setEditingDept(null);
        setFormData({ name: '', code: '' });
        setShowModal(true);
    };

    const openEditModal = (dept: Department) => {
        setEditingDept(dept);
        setFormData({ name: dept.name, code: dept.code });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingDept(null);
        setFormData({ name: '', code: '' });
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Departments</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage academic departments</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Department
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <CheckCircle className="w-5 h-5" />
                    {message.text}
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                    type="text"
                    placeholder="Search departments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            {/* Table */}
            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading departments...</p>
                    </div>
                ) : filteredDepartments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{searchQuery ? 'No departments found' : 'No departments yet'}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-white/10">
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Code</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Department Name</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Staff</th>
                                <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Students</th>
                                <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDepartments.map((dept) => (
                                <tr key={dept.id}
                                    className="border-b border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-sm font-medium">
                                            {dept.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{dept.name}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{dept._count?.staff || 0}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{dept._count?.student || 0}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(dept)}
                                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(dept.id)}
                                                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                            >
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-md bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-white">
                                {editingDept ? 'Edit Department' : 'Add Department'}
                            </h2>
                            <button onClick={closeModal} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Department Code</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. CSE, ECE"
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Department Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Computer Science & Engineering"
                                    required
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-medium rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {editingDept ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
