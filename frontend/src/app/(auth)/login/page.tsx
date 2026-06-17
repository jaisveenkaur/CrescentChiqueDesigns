'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, User, Phone, MapPin, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/services/auth-service';
import { authService } from '@/services/auth';
import { api } from '@/services/api';
import { Logo, CrescentMoonIcon } from '@/components/brand';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionExpired = searchParams.get('expired') === 'true';
  const { login: contextLogin } = useAuth();

  // Toggle Login vs Signup state
  const [isLogin, setIsLogin] = useState(true);
  const [loginRole, setLoginRole] = useState<'customer' | 'admin'>('customer');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'unreachable'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await api.get('/auth/ping');
        if (response.status === 200) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('unreachable');
        }
      } catch (err) {
        setBackendStatus('unreachable');
      }
    };
    checkConnection();
  }, []);

  useEffect(() => {
    if (sessionExpired) {
      setInfoMsg('Your active session has expired. Please login again.');
    }
  }, [sessionExpired]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password?: string }) =>
      contextLogin(data.email, data.password || 'password123'),
    onSuccess: (data) => {
      const role = data.user.role;
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: any) => authService.register(data),
    onSuccess: () => {
      setInfoMsg('Account registered successfully! You can now log in.');
      setIsLogin(true);
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please check inputs.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (isLogin) {
      if (!email || !password) {
        setErrorMsg('Please enter both email and password.');
        return;
      }
      loginMutation.mutate({ email, password });
    } else {
      if (!name || !email || !phone || !city || !stateName) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      registerMutation.mutate({
        name,
        email,
        password,
        phone,
        city,
        state: stateName,
        address,
      });
    }
  };



  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-beige-soft text-charcoal">
      
      {/* LEFT COLUMN: Premium Editorial Luxury Branding Photo */}
      <div className="hidden md:flex md:w-1/2 relative bg-charcoal items-center p-12 overflow-hidden min-h-screen">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
            alt="Luxury Kitchen Interior Editorial"
            fill
            className="object-cover brightness-[0.4]"
            priority
          />
        </div>
        
        {/* Editorial overlay content */}
        <div className="relative z-10 flex flex-col justify-between h-full w-full text-white">
          <Link href="/" className="flex items-center shrink-0 self-start">
            <Logo variant="dark" size="sm" />
          </Link>

          <div className="flex flex-col gap-4 max-w-md my-auto">
            <span className="text-gold tracking-[0.2em] text-[10px] font-bold uppercase flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Design Philosophy
            </span>
            <p className="font-serif text-3xl italic font-light leading-relaxed text-white/95">
              &ldquo;Luxury is not about complexity, it is the visual harmony of space, light, and texture.&rdquo;
            </p>
            <span className="text-xs uppercase tracking-wider text-gold font-semibold mt-1">
              — Senior Studio Architect
            </span>
          </div>

          <div className="text-[10px] text-white/40 flex justify-between items-center w-full">
            <span>© {new Date().getFullYear()} Crescent Chique Designs</span>
            <span>concierge@crescentchique.com</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth form interface */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:w-1/2 min-h-screen bg-beige-soft">
        
        {/* Back Link for mobile/tablet */}
        <div className="w-full max-w-md flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-charcoal/70 hover:text-gold smooth-transition">
            <ArrowLeft className="h-4 w-4" /> Exit to Website
          </Link>
          <CrescentMoonIcon className="md:hidden h-5 w-5 text-gold" />
        </div>

        <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-10 border border-gold/15 shadow-xl bg-white/40">
          {/* Role selector tabs */}
          {isLogin && (
            <div className="flex border-b border-gold/10 pb-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginRole('customer');
                  setEmail('');
                  setPassword('');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider smooth-transition border-b-2 cursor-pointer ${
                  loginRole === 'customer'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-charcoal/50 hover:text-charcoal'
                }`}
              >
                Client Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginRole('admin');
                  setEmail('');
                  setPassword('');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 pb-2 text-center text-xs font-bold uppercase tracking-wider smooth-transition border-b-2 cursor-pointer ${
                  loginRole === 'admin'
                    ? 'border-gold text-gold'
                    : 'border-transparent text-charcoal/50 hover:text-charcoal'
                }`}
              >
                Admin Sign In
              </button>
            </div>
          )}

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-semibold">
              {!isLogin 
                ? 'Create Client Profile' 
                : loginRole === 'admin' 
                  ? 'Admin Portal Sign In' 
                  : 'Client Portal Sign In'}
            </h2>
            <p className="text-[11px] text-charcoal/60 mt-2">
              {!isLogin 
                ? 'Complete the form to register your active design workspace.' 
                : loginRole === 'admin' 
                  ? 'Sign in to review business inquiries, customer accounts, and manage projects.' 
                  : 'Sign in to review timeline status, file uploads, and project updates.'}
            </p>
          </div>

          {/* Messages Alert */}
          {errorMsg && (
            <div className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 mb-6">
              ⚠️ {errorMsg}
            </div>
          )}
          {infoMsg && (
            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 mb-6">
              ✓ {infoMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* NAME FIELD (Signup only) */}
            {!isLogin && (
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gold/20 bg-white/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/40" />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jaisveen@gmail.com"
                  className="w-full rounded-xl border border-gold/20 bg-white/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/40" />
              </div>
            </div>

            {/* PASSWORD FIELD */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Password *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gold/20 bg-white/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                />
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/40" />
              </div>
            </div>

            {/* SIGNUP EXTRA PROFILE FIELDS */}
            {!isLogin && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Phone Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                    />
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Beverly Hills"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">State *</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="CA"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 px-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold tracking-wider text-charcoal/60">Address (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="100 Luxury Avenue, Suite 400"
                      className="w-full rounded-xl border border-gold/20 bg-white/50 pl-10 pr-4 py-2.5 text-xs outline-none focus:border-gold smooth-transition"
                    />
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-charcoal/40" />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full py-3.5 bg-gold-gradient text-white rounded-full text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 cursor-pointer mt-2"
            >
              {loginMutation.isPending || registerMutation.isPending 
                ? 'Processing...' 
                : (isLogin ? 'Sign In to Portal' : 'Register Profile')}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          {loginRole === 'customer' ? (
            <div className="text-center mt-6 text-xs border-t border-gold/10 pt-4">
              <span className="text-charcoal/60">
                {isLogin ? 'New to Crescent Chique? ' : 'Already registered? '}
              </span>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className="text-gold font-semibold hover:underline"
              >
                {isLogin ? 'Create Profile' : 'Sign In'}
              </button>
            </div>
          ) : (
            isLogin && (
              <div className="text-center mt-6 text-xs border-t border-gold/10 pt-4 text-charcoal/50">
                Admin accounts are pre-provisioned by the studio operations board.
              </div>
            )
          )}


          {/* Backend Connection Status */}
          <div className="mt-6 border-t border-gold/10 pt-4 flex flex-col items-center gap-1.5 text-[9px]">
            <span className="text-charcoal/50 uppercase font-bold tracking-wider">
              Studio Backend
            </span>
            <div className="flex items-center gap-1.5 font-bold tracking-wide">
              <span className={`h-2 w-2 rounded-full ${
                backendStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' :
                backendStatus === 'unreachable' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' :
                'bg-amber-500 animate-pulse'
              }`} />
              <span className={
                backendStatus === 'connected' ? 'text-emerald-600' :
                backendStatus === 'unreachable' ? 'text-rose-600' :
                'text-amber-600'
              }>
                {backendStatus === 'connected' ? 'BACKEND CONNECTED' :
                 backendStatus === 'unreachable' ? 'BACKEND UNREACHABLE' :
                 'CHECKING STATUS...'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-beige-soft">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest text-gold font-bold">Loading portal...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
