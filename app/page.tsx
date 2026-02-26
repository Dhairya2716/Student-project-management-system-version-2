'use client';

import Link from 'next/link';
import { GraduationCap, Users, ClipboardList, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import BlurText from '@/components/reactbits/BlurText';
import GradientText from '@/components/reactbits/GradientText';
import CountUp from '@/components/reactbits/CountUp';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ShinyText from '@/components/reactbits/ShinyText';
import ClickSpark from '@/components/reactbits/ClickSpark';

export default function Home() {
  return (
    <ClickSpark sparkColor="#10b981" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a12] text-gray-900 dark:text-white overflow-hidden transition-colors duration-500">
        {/* Animated Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-400/[0.08] dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-glow"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-400/[0.08] dark:bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/[0.04] dark:bg-teal-500/5 rounded-full blur-[150px]"></div>
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto max-w-7xl px-6 py-4">
            <div className="flex items-center justify-between rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/80 dark:border-white/10 px-6 py-3 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                  <GraduationCap className="w-6 h-6 text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">SPMS</span>
              </Link>
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="group relative px-5 py-2.5 text-sm font-medium overflow-hidden rounded-xl"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 transition-transform duration-300 group-hover:scale-105"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></span>
                  <span className="relative text-white font-semibold">Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge with ShinyText */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 mb-8 animate-fade-in-up">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <ShinyText
                  text="Student Project Management System"
                  speed={3}
                  color="#059669"
                  shineColor="#10b981"
                  className="text-sm font-medium"
                />
              </div>

              {/* Heading with GradientText */}
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                <BlurText
                  text="Manage Your"
                  className="text-gray-900 dark:text-white text-5xl md:text-7xl font-bold justify-center"
                  delay={80}
                  animateBy="words"
                />
                <GradientText
                  colors={['#10b981', '#06b6d4', '#14b8a6', '#10b981']}
                  animationSpeed={4}
                  className="text-5xl md:text-7xl font-bold mt-2"
                >
                  Academic Projects
                </GradientText>
                <BlurText
                  text="Efficiently"
                  className="text-gray-900 dark:text-white text-5xl md:text-7xl font-bold justify-center mt-2"
                  delay={80}
                  animateBy="letters"
                />
              </h1>

              {/* Subtitle with BlurText */}
              <div className="mb-12 max-w-2xl mx-auto">
                <BlurText
                  text="A comprehensive platform for students, faculty, and administrators to manage academic projects, track progress, and collaborate seamlessly."
                  className="text-lg md:text-xl text-gray-500 dark:text-white/50 leading-relaxed justify-center"
                  delay={30}
                  animateBy="words"
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold overflow-hidden rounded-2xl transition-all duration-300"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></span>
                  <span className="relative flex items-center gap-2 text-white">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </Link>
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold bg-white dark:bg-white/5 backdrop-blur-sm text-gray-900 dark:text-white rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <span>Login to Dashboard</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-1/3 left-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 dark:from-emerald-500/20 dark:to-cyan-500/20 backdrop-blur-sm border border-emerald-200/30 dark:border-white/10 flex items-center justify-center animate-float shadow-lg">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="absolute top-1/2 right-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-teal-500/15 dark:from-cyan-500/20 dark:to-teal-500/20 backdrop-blur-sm border border-cyan-200/30 dark:border-white/10 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '0.5s' }}>
            <Calendar className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="absolute bottom-1/4 left-20 w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/15 dark:from-teal-500/20 dark:to-emerald-500/20 backdrop-blur-sm border border-teal-200/30 dark:border-white/10 flex items-center justify-center animate-float shadow-lg" style={{ animationDelay: '1s' }}>
            <ClipboardList className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          </div>
        </section>

        {/* Features Section — SpotlightCards */}
        <section className="relative py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <GradientText
                colors={['#10b981', '#06b6d4', '#8b5cf6', '#10b981']}
                animationSpeed={6}
                className="text-3xl md:text-5xl font-bold"
              >
                Everything You Need
              </GradientText>
              <p className="text-gray-500 dark:text-white/50 max-w-2xl mx-auto text-lg mt-4">
                Powerful features to manage your academic projects from start to finish
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Users, title: 'Group Formation', desc: 'Form project groups and assign team members with ease', color: 'emerald', spotlightColor: 'rgba(16, 185, 129, 0.15)' },
                { icon: GraduationCap, title: 'Guide Allocation', desc: 'Smart faculty guide assignment system', color: 'cyan', spotlightColor: 'rgba(6, 182, 212, 0.15)' },
                { icon: Calendar, title: 'Meeting Tracking', desc: 'Schedule, track, and manage project meetings', color: 'teal', spotlightColor: 'rgba(20, 184, 166, 0.15)' },
                { icon: ClipboardList, title: 'Progress Reports', desc: 'Generate detailed analytics and reports', color: 'purple', spotlightColor: 'rgba(139, 92, 246, 0.15)' },
              ].map((feature, i) => (
                <SpotlightCard
                  key={i}
                  className="p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-500 shadow-sm hover:shadow-xl group"
                  spotlightColor={feature.spotlightColor}
                >
                  <div className={`relative w-14 h-14 rounded-2xl bg-${feature.color}-50 dark:bg-${feature.color}-500/10 border border-${feature.color}-200 dark:border-${feature.color}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                  </div>
                  <h3 className="relative text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="relative text-gray-500 dark:text-white/50">{feature.desc}</p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section — CountUp */}
        <section className="relative py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { value: 500, suffix: '+', label: 'Active Projects' },
                { value: 2000, suffix: '+', label: 'Students' },
                { value: 100, suffix: '+', label: 'Faculty Guides' },
              ].map((stat, i) => (
                <SpotlightCard
                  key={i}
                  className="text-center p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all duration-300 group"
                  spotlightColor="rgba(16, 185, 129, 0.12)"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                    <CountUp to={stat.value} duration={2.5} separator="," />
                    <span>{stat.suffix}</span>
                  </div>
                  <div className="text-gray-500 dark:text-white/50 font-medium">{stat.label}</div>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <SpotlightCard
              className="p-12 md:p-16 rounded-[2.5rem] bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-emerald-200/50 dark:border-white/10 backdrop-blur-sm overflow-hidden shadow-xl"
              spotlightColor="rgba(16, 185, 129, 0.2)"
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/15 dark:bg-emerald-500/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-400/15 dark:bg-cyan-500/20 rounded-full blur-[100px]"></div>

              <div className="relative text-center">
                <GradientText
                  colors={['#10b981', '#06b6d4', '#8b5cf6', '#10b981']}
                  animationSpeed={5}
                  className="text-3xl md:text-4xl font-bold mb-4"
                >
                  Ready to Get Started?
                </GradientText>
                <p className="text-gray-500 dark:text-white/60 mb-8 max-w-xl mx-auto">
                  Join thousands of students and faculty managing their academic projects efficiently
                </p>
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-2xl hover:bg-gray-800 dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </SpotlightCard>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-8 px-6 border-t border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-700 dark:text-white/80">SPMS</span>
            </div>
            <p className="text-gray-400 dark:text-white/40 text-sm">© 2026 Student Project Management System. All rights reserved.</p>
          </div>
        </footer>

        {/* Custom Animations */}
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </ClickSpark>
  );
}
