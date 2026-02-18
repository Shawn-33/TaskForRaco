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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-app flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <div className="w-8 h-8 bg-blue-600 rounded-lg" />
          ProjectMarket
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/marketplace" className={`text-gray-700 hover:text-blue-600 ${isActive('/marketplace') ? 'text-blue-600 font-semibold' : ''}`}>
            Marketplace
          </Link>

          {user?.role === 'buyer' && (
            <Link href="/buyer/dashboard" className={`text-gray-700 hover:text-blue-600 ${isActive('/buyer/dashboard') ? 'text-blue-600 font-semibold' : ''}`}>
              My Projects
            </Link>
          )}

          {user?.role === 'problem_solver' && (
            <Link href="/solver/dashboard" className={`text-gray-700 hover:text-blue-600 ${isActive('/solver/dashboard') ? 'text-blue-600 font-semibold' : ''}`}>
              My Dashboard
            </Link>
          )}

          {user?.role === 'problem_solver' && (
            <Link href="/solver/payments" className={`text-gray-700 hover:text-blue-600 ${isActive('/solver/payments') ? 'text-blue-600 font-semibold' : ''}`}>
              Earnings
            </Link>
          )}
        </div>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-gray-700">{user.full_name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-700 hover:text-red-600">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container-app py-4 flex flex-col gap-4">
            <Link href="/marketplace" className="text-gray-700 hover:text-blue-600">
              Marketplace
            </Link>

            {user?.role === 'buyer' && (
              <Link href="/buyer/dashboard" className="text-gray-700 hover:text-blue-600">
                My Projects
              </Link>
            )}

            {user?.role === 'problem_solver' && (
              <>
                <Link href="/solver/dashboard" className="text-gray-700 hover:text-blue-600">
                  My Dashboard
                </Link>
                <Link href="/solver/payments" className="text-gray-700 hover:text-blue-600">
                  Earnings
                </Link>
              </>
            )}

            {user ? (
              <button onClick={handleLogout} className="text-left text-red-600 hover:text-red-700">
                Logout
              </button>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
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
