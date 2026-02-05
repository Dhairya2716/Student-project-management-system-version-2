'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, User, Phone, Loader2, ArrowRight, Sparkles } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            router.push('/login?registered=true');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <GraduationCap className="w-8 h-8 text-white" />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">SPMS</span>
                    </Link>
                </div>

                {/* Card */}
                <div className="relative">
                    {/* Card glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-[2rem] blur-xl opacity-50"></div>

                    <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-300">Student Registration</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                            <p className="text-white/50">Join SPMS to manage your projects</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/70">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/70">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/70">Phone <span className="text-white/30">(Optional)</span></label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone number"
                                        className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/70">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Password"
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white/70">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm"
                                            required
                                            minLength={6}
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full py-4 overflow-hidden rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500"></span>
                                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></span>
                                <span className="relative flex items-center justify-center gap-2 text-white">
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="text-center text-white/50 text-sm mt-6">
                            Already have an account?{' '}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
