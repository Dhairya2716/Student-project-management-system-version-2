'use client';

import { useState, useEffect } from 'react';
import {
    BookOpen,
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    CheckCircle,
    Calendar
} from 'lucide-react';

interface Batch {
    id: number;
    name: string;
    start_year: number;
    end_year: number;
    _count?: { student: number };
}

export default function BatchesPage() {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
    const [formData, setFormData] = useState({ name: '', start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4 });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/admin/batches');
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (error) {
            console.error('Failed to fetch batches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const url = editingBatch ? `/api/admin/batches/${editingBatch.id}` : '/api/admin/batches';
            const res = await fetch(url, {
                method: editingBatch ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: editingBatch ? 'Batch updated!' : 'Batch created!' });
                fetchBatches();
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
        if (!confirm('Are you sure you want to delete this batch?')) return;

        try {
            const res = await fetch(`/api/admin/batches/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Batch deleted!' });
                fetchBatches();
            }
        } catch {
            setMessage({ type: 'error', text: 'Something went wrong' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const openCreateModal = () => {
        setEditingBatch(null);
        setFormData({ name: '', start_year: new Date().getFullYear(), end_year: new Date().getFullYear() + 4 });
        setShowModal(true);
    };

    const openEditModal = (batch: Batch) => {
        setEditingBatch(batch);
        setFormData({ name: batch.name, start_year: batch.start_year, end_year: batch.end_year });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingBatch(null);
    };

    const filteredBatches = batches.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Batches</h1>
                    <p className="text-white/50">Manage academic batches/years</p>
                </div>
                <button onClick={openCreateModal} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all">
                    <Plus className="w-5 h-5" />
                    Add Batch
                </button>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                    <CheckCircle className="w-5 h-5" />
                    {message.text}
                </div>
            )}

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                    type="text"
                    placeholder="Search batches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-md pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
                        <p className="text-white/50">Loading batches...</p>
                    </div>
                ) : filteredBatches.length === 0 ? (
                    <div className="col-span-full p-12 text-center">
                        <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/50">{searchQuery ? 'No batches found' : 'No batches yet'}</p>
                    </div>
                ) : (
                    filteredBatches.map((batch) => (
                        <div key={batch.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-orange-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-orange-400" />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(batch)} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(batch.id)} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">{batch.name}</h3>
                            <p className="text-white/50 text-sm mb-4">{batch.start_year} - {batch.end_year}</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="px-3 py-1 rounded-lg bg-white/5 text-white/70">
                                    {batch._count?.student || 0} Students
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
                    <div className="relative w-full max-w-md bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">{editingBatch ? 'Edit Batch' : 'Add Batch'}</h2>
                            <button onClick={closeModal} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Batch Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. 2024-2028"
                                    required
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">Start Year</label>
                                    <input
                                        type="number"
                                        value={formData.start_year}
                                        onChange={(e) => setFormData({ ...formData, start_year: parseInt(e.target.value) })}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/70 mb-2">End Year</label>
                                    <input
                                        type="number"
                                        value={formData.end_year}
                                        onChange={(e) => setFormData({ ...formData, end_year: parseInt(e.target.value) })}
                                        required
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all">Cancel</button>
                                <button type="submit" disabled={saving} className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {editingBatch ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
