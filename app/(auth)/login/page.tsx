'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import ClickSpark from '@/components/reactbits/ClickSpark';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import BlurText from '@/components/reactbits/BlurText';
import GradientText from '@/components/reactbits/GradientText';

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
        <ClickSpark sparkColor="#10b981" sparkSize={10} sparkRadius={15} sparkCount={8} duration={400}>
            <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] flex items-center justify-center p-6 overflow-hidden transition-colors duration-500">
                {/* Animated Background */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-400/[0.08] dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-400/[0.08] dark:bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                </div>

                <div className="relative w-full max-w-md animate-fade-in-up">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                                <GraduationCap className="w-8 h-8 text-white" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            </div>
                            <GradientText colors={['#10b981', '#06b6d4', '#10b981']} animationSpeed={3} showBorder={false}>
                                <span className="text-3xl font-bold bg-clip-text text-transparent">SPMS</span>
                            </GradientText>
                        </Link>
                    </div>

                    {/* Card */}
                    <div className="relative">
                        {/* Card glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 dark:from-emerald-500/20 dark:to-cyan-500/20 rounded-[2rem] blur-xl opacity-50"></div>

                        <SpotlightCard className="relative bg-white/90 dark:bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-gray-200/80 dark:border-white/10 p-8 shadow-xl dark:shadow-2xl" spotlightColor="rgba(16, 185, 129, 0.15)">
                            <div className="text-center mb-8">
                                <BlurText text="Welcome Back" className="text-3xl font-bold text-gray-900 dark:text-white mb-2" delay={30} />
                                <p className="text-gray-500 dark:text-white/50">Sign in to continue to your dashboard</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all duration-300"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/70">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/30 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Enter your password"
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400/50 transition-all duration-300"
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
                                    <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></span>
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
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                                <span className="text-gray-400 dark:text-white/30 text-sm">or</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10"></div>
                            </div>

                            {/* Footer */}
                            <p className="text-center text-gray-500 dark:text-white/50 text-sm">
                                New student?{' '}
                                <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-medium transition-colors">
                                    Create an account
                                </Link>
                            </p>
                        </SpotlightCard>
                    </div>
                </div>
            </div>
        </ClickSpark>
    );
}
