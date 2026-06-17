'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { Logo } from './brand';

export default function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    setIsAuthenticated(!!token);
    setUserRole(role);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Gallery', href: '/gallery' },
    { name: 'Services', href: '/services' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/');
  };

  const headerClass = `fixed top-0 left-0 right-0 z-50 w-full h-[90px] flex items-center transition-all duration-300 border-b ${
    isScrolled 
      ? 'bg-[#171d28]/95 backdrop-blur-[20px] border-white/10 shadow-lg' 
      : 'bg-[#171d28]/30 backdrop-blur-[20px] border-white/10'
  }`;

  const linkClass = (isActive: boolean) => {
    return `text-sm font-medium tracking-wider text-white/90 hover:text-gold transition-all duration-300 relative py-1.5 after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-gold after:transition-transform after:duration-300 hover:after:scale-x-100 after:origin-left ${
      isActive ? 'text-gold after:scale-x-100' : 'after:scale-x-0'
    }`;
  };

  return (
    <header className={headerClass}>
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
        <div className="flex h-full items-center justify-between">
          {/* Logo - Switch layout based on theme */}
          <Link href="/" className="flex items-center shrink-0">
            <Logo variant="dark" size="sm" />
          </Link>

          {/* Desktop Navigation Links (Centered) */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={linkClass(isActive)}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Call to Actions (Right) */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href={userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                  className="flex items-center gap-2 rounded-full border border-white/20 text-white bg-white/5 px-5 py-2 text-xs font-semibold tracking-wider uppercase hover:bg-white hover:text-charcoal smooth-transition"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-white text-charcoal hover:bg-gold hover:text-white px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium tracking-wider text-white/95 hover:text-gold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="bg-[#D4AF37] text-[#1F2937] hover:bg-[#e2c154] rounded-[14px] px-[34px] py-[20px] text-sm font-semibold tracking-wide shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center gap-3">
            {isAuthenticated && (
              <Link
                href={userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                className="rounded-full border border-white/30 p-2 text-white hover:border-gold hover:text-gold"
              >
                <UserIcon className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-lg p-2 transition-colors text-white hover:bg-white/10 hover:text-gold"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-charcoal/95 backdrop-blur-md border-b border-gold/15 py-6 px-4 shadow-xl">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-xs font-bold tracking-widest uppercase py-2 border-b border-white/5 ${
                    isActive ? 'text-gold' : 'text-white/80'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            
            {/* CTA in mobile drawer */}
            <div className="pt-4 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href={userRole === 'admin' ? '/admin/dashboard' : '/customer/dashboard'}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-center items-center gap-2 rounded-full border border-gold/40 py-3 text-xs font-bold tracking-widest uppercase text-white hover:bg-gold/5"
                  >
                    <UserIcon className="h-4 w-4" />
                    Portal Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="rounded-full bg-gold-gradient text-white py-3 text-xs font-bold tracking-widest uppercase"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="text-center text-xs font-bold tracking-widest uppercase py-2 text-white/80"
                  >
                    Sign In
                  </Link>
                  <a
                    href="#consultation"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-gold-gradient py-3 text-center text-xs font-bold tracking-widest uppercase text-white"
                  >
                    Get Free Quote
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

