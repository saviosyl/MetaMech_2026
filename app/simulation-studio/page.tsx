'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Crown, CheckCircle2 } from 'lucide-react';

type Step = 'login' | 'verify' | 'studio';

export default function SimulationStudioPage() {
  const [step, setStep] = useState<Step>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/simulation-studio/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials or not a Premium Plus subscriber.');
        setLoading(false);
        return;
      }

      // Login successful — verification code sent to email
      setStep('verify');
      setCountdown(60);
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const handleCodeInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1);
    setVerificationCode(newCode);

    // Auto-advance to next input
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setVerificationCode(newCode);
    const nextEmpty = Math.min(pasted.length, 5);
    codeRefs.current[nextEmpty]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/simulation-studio/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid or expired code.');
        setLoading(false);
        return;
      }

      // Verified — redirect to the actual studio app
      setStep('studio');
      // Store session token
      if (data.token) {
        document.cookie = `sim_token=${data.token}; path=/simulation-studio; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      }
      // Redirect to editor
      window.location.href = '/simulation-studio/editor';
    } catch {
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');

    try {
      await fetch('/api/simulation-studio/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setCountdown(60);
      setVerificationCode(['', '', '', '', '', '']);
    } catch {
      setError('Could not resend code.');
    }
    setLoading(false);
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
            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full">
              <Crown size={14} className="text-gold" />
              <span className="text-xs font-medium text-gold">Premium Plus Exclusive</span>
            </div>
          </div>

          {/* ===== LOGIN STEP ===== */}
          {step === 'login' && (
            <div className="glass-card p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={18} className="text-teal" />
                <h2 className="font-orbitron text-lg text-white">Sign In</h2>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your-email@company.com"
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

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

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

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  This tool is exclusively available to <strong className="text-gold">Premium Plus</strong> subscribers.
                  Your login credentials were sent to the email used for your purchase.
                  A verification code will be sent to your email on every login.
                </p>
              </div>
            </div>
          )}

          {/* ===== VERIFY STEP ===== */}
          {step === 'verify' && (
            <div className="glass-card p-8 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} className="text-teal" />
                <h2 className="font-orbitron text-lg text-white">Email Verification</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                We sent a 6-digit code to <strong className="text-white">{email}</strong>
              </p>

              <form onSubmit={handleVerify} className="space-y-5">
                {/* 6-digit code input */}
                <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                  {verificationCode.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { codeRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeInput(i, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(i, e)}
                      className="w-12 h-14 text-center text-xl font-mono font-bold bg-navy/60 border border-white/15 rounded-lg text-white focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/50 transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-teal to-teal-light text-navy font-bold rounded-lg hover:shadow-glow-teal transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Verify &amp; Enter Studio
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-sm text-gray-400 hover:text-teal transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : 'Resend verification code'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => { setStep('login'); setError(''); setVerificationCode(['', '', '', '', '', '']); }}
                  className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  ← Back to login
                </button>
              </form>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            © {new Date().getFullYear()} MetaMech Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
