'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import { Shield, Users, Search, RefreshCw } from 'lucide-react';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  users: {
    total: number;
    active: number;
    buyers: number;
    solvers: number;
    admins: number;
  };
  projects: {
    total: number;
    open: number;
    in_progress: number;
    completed: number;
  };
  payments: {
    total: number;
    pending: number;
    released: number;
    total_amount: number;
    released_amount: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAppStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Check if user is logged in and is an admin
    if (user?.role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    loadUsers();
  }, [user, router]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const loadUsers = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        apiClient.getAllUsers(),
        apiClient.getAdminStats(),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((u) =>
        statusFilter === 'active' ? u.is_active : !u.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm('Are you sure you want to change this user\'s role?')) {
      return;
    }

    try {
      await apiClient.assignRole(userId, newRole);
      alert('Role updated successfully!');
      loadUsers();
    } catch (error: any) {
      console.error('Failed to change role:', error);
      alert(error.response?.data?.detail || 'Failed to change role');
    }
  };

  const handleToggleActive = async (userId: number, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      if (isActive) {
        await apiClient.deactivateUser(userId);
      } else {
        await apiClient.activateUser(userId);
      }
      alert(`User ${action}d successfully!`);
      loadUsers();
    } catch (error: any) {
      console.error(`Failed to ${action} user:`, error);
      alert(error.response?.data?.detail || `Failed to ${action} user`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'buyer':
        return 'bg-blue-100 text-blue-800';
      case 'problem_solver':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'problem_solver':
        return 'Problem Solver';
      case 'buyer':
        return 'Buyer';
      case 'admin':
        return 'Admin';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-app py-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield size={32} className="text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <p className="text-gray-600">Manage users and system settings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="container-app py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
        
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.users.total || 0}</p>
              </div>
              <Users size={40} className="text-gray-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{stats?.users.active || 0}</p>
              </div>
              <Users size={40} className="text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Buyers</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.users.buyers || 0}</p>
              </div>
              <Users size={40} className="text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Solvers</p>
                <p className="text-3xl font-bold text-green-600">{stats?.users.solvers || 0}</p>
              </div>
              <Users size={40} className="text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Admins</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.users.admins || 0}</p>
              </div>
              <Shield size={40} className="text-purple-600" />
            </div>
          </div>
        </div>

        {/* Project Stats */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Project Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.projects.total || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open Projects</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.projects.open || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.projects.in_progress || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{stats?.projects.completed || 0}</p>
            </div>
          </div>
        </div>

        {/* Payment Stats */}
        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">Payment Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Payments</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.payments.total || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats?.payments.pending || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Released</p>
              <p className="text-3xl font-bold text-green-600">{stats?.payments.released || 0}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.payments.total_amount.toFixed(2) || '0.00'}</p>
            </div>
          </div>

          <div className="card">
            <div>
              <p className="text-sm text-gray-600 mb-1">Released Amount</p>
              <p className="text-2xl font-bold text-green-600">${stats?.payments.released_amount.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-4 mt-8">User Management</h2>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="buyer">Buyer</option>
              <option value="problem_solver">Problem Solver</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={loadUsers}
              className="btn-secondary flex items-center gap-2 whitespace-nowrap"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{u.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{u.full_name}</td>
                      <td className="px-6 py-4 text-sm">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          disabled={u.role === 'admin'}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(u.role)} ${
                            u.role === 'admin' ? 'cursor-not-allowed' : 'cursor-pointer'
                          }`}
                        >
                          <option value="admin">Admin</option>
                          <option value="buyer">Buyer</option>
                          <option value="problem_solver">Problem Solver</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleActive(u.id, u.is_active)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              u.is_active
                                ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                : 'bg-green-100 hover:bg-green-200 text-green-600'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
