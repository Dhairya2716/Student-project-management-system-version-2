'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', email);

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log('Login successful! Redirecting to:', data.redirectUrl);

            // Redirect to dashboard
            window.location.href = data.redirectUrl;
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6 overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                            <p className="text-white/50">Sign in to continue to your dashboard</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm backdrop-blur-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/70">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white/70">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all duration-300"
                                    />
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
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-white/30 text-sm">or</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-white/50 text-sm">
                            New student?{' '}
                            <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
