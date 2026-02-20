'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAppStore();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  // Don't render user-specific content until mounted
  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container-app flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
            ProjectMarket
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600">
              Marketplace
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-lg">
      <div className="container-app flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg transform hover:rotate-12 transition-transform duration-300" />
          ProjectMarket
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/marketplace" className={`text-gray-700 hover:text-purple-600 font-semibold transition-colors ${isActive('/marketplace') ? 'text-purple-600' : ''}`}>
            Marketplace
          </Link>

          {user?.role === 'admin' && (
            <Link href="/admin/dashboard" className={`text-gray-700 hover:text-purple-600 font-semibold transition-colors ${isActive('/admin/dashboard') ? 'text-purple-600' : ''}`}>
              Admin Dashboard
            </Link>
          )}

          {user?.role === 'buyer' && (
            <Link href="/buyer/dashboard" className={`text-gray-700 hover:text-purple-600 font-semibold transition-colors ${isActive('/buyer/dashboard') ? 'text-purple-600' : ''}`}>
              My Projects
            </Link>
          )}

          {user?.role === 'problem_solver' && (
            <Link href="/solver/dashboard" className={`text-gray-700 hover:text-purple-600 font-semibold transition-colors ${isActive('/solver/dashboard') ? 'text-purple-600' : ''}`}>
              My Dashboard
            </Link>
          )}

          {user?.role === 'problem_solver' && (
            <Link href="/solver/payments" className={`text-gray-700 hover:text-purple-600 font-semibold transition-colors ${isActive('/solver/payments') ? 'text-purple-600' : ''}`}>
              Earnings
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700 font-semibold">{user.full_name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-purple-600 font-semibold transition-colors">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="container-app py-4 flex flex-col gap-3">
            <Link href="/marketplace" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
              Marketplace
            </Link>

            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
                Admin Dashboard
              </Link>
            )}

            {user?.role === 'buyer' && (
              <Link href="/buyer/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
                My Projects
              </Link>
            )}

            {user?.role === 'problem_solver' && (
              <>
                <Link href="/solver/dashboard" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
                  My Dashboard
                </Link>
                <Link href="/solver/payments" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
                  Earnings
                </Link>
              </>
            )}

            {user ? (
              <button onClick={handleLogout} className="text-left text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-xl transition-all">
                Logout
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-xl hover:bg-purple-50 transition-all">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
