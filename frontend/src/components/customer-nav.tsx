'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  Clock, 
  FolderOpen, 
  Bell, 
  User, 
  LogOut, 
  Inbox,
  Menu
} from 'lucide-react';
import { Logo } from './brand';

export default function CustomerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Customer');
  const [email, setEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('user_name') || 'Valued Customer');
    setEmail(localStorage.getItem('user_email') || 'client@crescentchique.com');
  }, []);

  const menuItems = [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Leads', href: '/customer/leads', icon: Inbox },
    { name: 'My Appointments', href: '/customer/appointments', icon: Calendar },
    { name: 'Project Timeline', href: '/customer/timeline', icon: Clock },
    { name: 'Quotations', href: '/customer/quotations', icon: FileText },
    { name: 'Upload Center', href: '/customer/files', icon: FolderOpen },
    { name: 'Notifications', href: '/customer/notifications', icon: Bell },
    { name: 'My Profile', href: '/customer/profile', icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    router.push('/login');
  };

  // Mobile navigation tabs (Bottom Nav)
  const mobileTabs = [
    { name: 'Home', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'Timeline', href: '/customer/timeline', icon: Clock },
    { name: 'Book', href: '/customer/appointments', icon: Calendar },
    { name: 'Files', href: '/customer/files', icon: FolderOpen },
    { name: 'More', href: '#', icon: Menu, onClick: () => setIsMobileMenuOpen(true) },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-charcoal text-white min-h-screen border-r border-gold/15 sticky top-0">
        {/* Brand header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center shrink-0">
            <Logo variant="dark" size="sm" />
          </Link>
          <span className="text-[10px] text-gold/60 uppercase tracking-widest font-semibold block mt-2">
            Client Portal
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium tracking-wide smooth-transition group ${
                  isActive 
                    ? 'bg-gold text-white shadow-md shadow-gold/25' 
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 smooth-transition ${isActive ? 'text-white' : 'text-gold/80 group-hover:scale-110'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gold-gradient flex items-center justify-center font-serif text-sm font-bold text-white uppercase shadow-sm">
              {name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">{name}</h4>
              <p className="text-[10px] text-white/50 truncate">{email}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="text-white/60 hover:text-gold smooth-transition" 
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-charcoal/95 backdrop-blur-md border-t border-white/15 h-16 flex items-center justify-around px-2 pb-safe shadow-lg">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href !== '#' && pathname === tab.href;
          
          if (tab.onClick) {
            return (
              <button
                key={tab.name}
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center flex-1 h-full text-white/75 hover:text-gold transition-colors"
              >
                <Icon className="h-5 w-5 text-gold/80" />
                <span className="text-[9px] font-medium mt-1 tracking-wider uppercase">{tab.name}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-gold font-bold' : 'text-white/75 hover:text-gold'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-gold' : 'text-white/75'}`} />
              <span className="text-[9px] font-medium mt-1 tracking-wider uppercase">{tab.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* MOBILE DRAWER DRAWER (For 'More' item) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Overlay background */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content panel */}
          <div className="relative flex flex-col w-4/5 max-w-sm h-full bg-charcoal text-white p-6 shadow-2xl transition-transform duration-300 ease-out transform">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <span className="font-serif text-sm font-bold tracking-widest text-gold">CRESCENT CHIQUE</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-gold text-xs uppercase font-semibold"
              >
                Close
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-2 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-gold text-white' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 text-gold" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gold flex items-center justify-center text-xs font-serif text-white font-bold uppercase">
                  {name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold truncate">{name}</h4>
                  <p className="text-[10px] text-white/50 truncate">{email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold uppercase tracking-wider text-center"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
