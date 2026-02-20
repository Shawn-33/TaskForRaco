'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useAppStore();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    password_confirm: '',
    role: searchParams.get('role') || 'problem_solver',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.register({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
      });

      const { access_token, user_id, email: userEmail, role } = res.data;
      setToken(access_token);
      // Create user object from response fields
      setUser({
        id: user_id,
        email: userEmail,
        full_name: formData.full_name,
        role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'buyer') {
        router.push('/buyer/dashboard');
      } else {
        router.push('/solver/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-xl">
              <div className="w-8 h-8 bg-white rounded-lg"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join ProjectMarket
            </h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl text-red-700 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">I am a</label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="buyer">Buyer (Post Projects)</option>
                <option value="problem_solver">Problem Solver (Find Projects)</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="password_confirm"
                value={formData.password_confirm}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full text-lg py-4">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-blue-600">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl text-sm text-gray-700 border-2 border-blue-100">
            <p className="font-bold mb-2">By signing up, you agree to:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Payment Terms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
