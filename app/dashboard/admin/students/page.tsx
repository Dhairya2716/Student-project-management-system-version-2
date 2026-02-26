'use client';

import { useState, useEffect } from 'react';
import {
    GraduationCap,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    CheckCircle,
    Mail,
    Phone,
    Users
} from 'lucide-react';

interface Student {
    id: number;
    enrollment_no: string | null;
    name: string;
    email: string;
    phone: string | null;
    batch?: { name: string } | null;
    department?: { name: string; code: string } | null;
    project_group?: { name: string } | null;
}

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Batch {
    id: number;
    name: string;
}

export default function StudentsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({
        enrollment_no: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        batchId: '',
        departmentId: '',
    });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
        fetchBatches();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await fetch('/api/admin/students');
            if (res.ok) {
                const data = await res.json();
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            if (res.ok) setDepartments(await res.json());
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/admin/batches');
            if (res.ok) setBatches(await res.json());
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingStudent ? `/api/admin/students/${editingStudent.id}` : '/api/admin/students';
            const res = await fetch(url, {
                method: editingStudent ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    batchId: formData.batchId ? parseInt(formData.batchId) : null,
                    departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
                }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: editingStudent ? 'Student updated!' : 'Student created!' });
                fetchStudents();
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
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Student deleted!' });
                fetchStudents();
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const openCreateModal = () => {
        setEditingStudent(null);
        setFormData({ enrollment_no: '', name: '', email: '', phone: '', password: '', batchId: '', departmentId: '' });
        setShowModal(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            enrollment_no: student.enrollment_no || '',
            name: student.name,
            email: student.email,
            phone: student.phone || '',
            password: '',
            batchId: '',
            departmentId: '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingStudent(null);
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.enrollment_no && s.enrollment_no.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Students</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage student records</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                    <Plus className="w-5 h-5" />
                    Add Student
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
                    placeholder="Search by name, email, or enrollment..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            <div className="rounded-2xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">Loading students...</p>
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{searchQuery ? 'No students found' : 'No students yet'}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-white/10">
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Enrollment</th>
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Name</th>
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Email</th>
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Batch</th>
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Department</th>
                                    <th className="text-left text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Group</th>
                                    <th className="text-right text-sm font-medium text-gray-500 dark:text-gray-400 px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="border-b border-white/5 hover:bg-white dark:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-sm font-medium">
                                                {student.enrollment_no || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                                                    <span className="text-gray-900 dark:text-white font-bold">{student.name.charAt(0)}</span>
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-medium">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.email}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.batch?.name || '-'}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{student.department?.code || '-'}</td>
                                        <td className="px-6 py-4">
                                            {student.project_group ? (
                                                <span className="flex items-center gap-2 text-emerald-400">
                                                    <Users className="w-4 h-4" />
                                                    {student.project_group.name}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 dark:text-gray-500">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(student)} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(student.id)} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-lg bg-[#12121a] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-white">{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                            <button onClick={closeModal} className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Enrollment No</label>
                                    <input
                                        type="text"
                                        value={formData.enrollment_no}
                                        onChange={(e) => setFormData({ ...formData, enrollment_no: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Email *</label>
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
                                {!editingStudent && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Password *</label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingStudent}
                                            minLength={6}
                                            className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Batch</label>
                                    <select
                                        value={formData.batchId}
                                        onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50 transition-all"
                                    >
                                        <option value="" className="bg-[#12121a]">Select Batch</option>
                                        {batches.map((b) => (
                                            <option key={b.id} value={b.id} className="bg-[#12121a]">{b.name}</option>
                                        ))}
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
                                    {editingStudent ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
