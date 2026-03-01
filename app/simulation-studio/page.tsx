'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, LogIn, UserPlus, Mail, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';

export default function SimulationStudioPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // TODO: Connect to backend API when deployed
    setTimeout(() => {
      setMessage('Simulation Studio is launching soon. Your account will be ready when we go live!');
      setLoading(false);
    }, 1500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setTimeout(() => {
      setMessage('Registration noted! We\'ll notify you when Simulation Studio launches.');
      setLoading(false);
    }, 1500);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setTimeout(() => {
      setMessage('If an account exists with this email, you\'ll receive a reset link.');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-teal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-[300px] h-[300px] bg-gold/8 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 w-full px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm">Back to MetaMech</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="relative p-2 rounded-xl bg-white border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <Image
                  src="/metamech-logo.png"
                  alt="MetaMech"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
            </div>
            <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-2">
              <span className="text-gradient-teal">Simulation</span>{' '}
              <span className="text-gradient-gold">Studio</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Premium 3D Industrial Simulation Platform
            </p>
          </div>

          {/* Card */}
          <div className="glass-card p-8 border border-white/10">
            {/* Tab Switcher */}
            {mode !== 'forgot' && (
              <div className="flex mb-6 bg-navy/50 rounded-lg p-1">
                <button
                  onClick={() => { setMode('login'); setMessage(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'login'
                      ? 'bg-teal text-navy shadow-glow-teal'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LogIn size={16} />
                  Sign In
                </button>
                <button
                  onClick={() => { setMode('register'); setMessage(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    mode === 'register'
                      ? 'bg-teal text-navy shadow-glow-teal'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <UserPlus size={16} />
                  Register
                </button>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-12 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setMessage(''); }}
                    className="text-xs text-teal hover:text-teal-light transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Engineer"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot' && (
              <form onSubmit={handleForgot} className="space-y-4">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setMessage(''); }}
                  className="flex items-center gap-1 text-sm text-gray-400 hover:text-teal transition-colors mb-2"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </button>
                <h3 className="font-orbitron text-lg text-white mb-1">Reset Password</h3>
                <p className="text-sm text-gray-400 mb-4">Enter your email and we&apos;ll send a reset link.</p>
                <div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-navy/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin mx-auto" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            {/* Message */}
            {message && (
              <div className="mt-4 p-3 bg-teal/10 border border-teal/20 rounded-lg text-sm text-teal-light text-center">
                {message}
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} MetaMech Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
