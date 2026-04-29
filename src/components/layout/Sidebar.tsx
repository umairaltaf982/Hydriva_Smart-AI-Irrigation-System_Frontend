'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Leaf, Droplets, History, Bell, Settings, Wifi, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/plants', label: 'My Plants', icon: Leaf },
  { href: '/irrigation', label: 'Irrigation', icon: Droplets },
  { href: '/history', label: 'History', icon: History },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-dark flex flex-col z-40">
      <div className="p-6 border-b border-green-800/30">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl hydriva-gradient flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">HYD<span className="text-green-400">RIVA</span></span>
            <p className="text-green-400/70 text-xs">Smart Irrigation</p>
          </div>
        </Link>
      </div>
      <div className="px-6 py-3 border-b border-green-800/30">
        <div className="flex items-center gap-2 text-xs text-green-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
          <Wifi className="w-3 h-3" />
          <span>System Online</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                active ? 'bg-green-600 text-white shadow-lg shadow-green-900/30' : 'text-gray-300 hover:bg-green-800/30 hover:text-white')}>
              <Icon className="w-5 h-5" />{label}
            </Link>
          );
        })}
      </nav>
      {user && (
        <div className="p-4 border-t border-green-800/30">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  );
}
