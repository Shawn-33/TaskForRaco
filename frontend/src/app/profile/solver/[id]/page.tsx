'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowLeft, User, Mail, Calendar, CheckCircle, Briefcase, TrendingUp, Award } from 'lucide-react';
import Link from 'next/link';

interface SolverProfile {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  statistics: {
    total_applications: number;
    accepted_applications: number;
    completed_projects: number;
    active_projects: number;
    acceptance_rate: number;
  };
}

export default function SolverProfilePage() {
  const params = useParams();
  const router = useRouter();
  const solverId = Number(params.id);
  
  const [profile, setProfile] = useState<SolverProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [solverId]);

  const loadProfile = async () => {
    try {
      const response = await apiClient.getSolverProfile(solverId);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      alert('Failed to load solver profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const stats = profile.statistics;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Profile Header */}
        <div className="card mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{profile.full_name}</h1>
                {profile.is_active && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail size={18} />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} />
                  <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span className="capitalize">{profile.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.total_applications}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Applications</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.accepted_applications}</span>
            </div>
            <p className="text-gray-600 font-medium">Accepted</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="text-purple-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-purple-600">{stats.completed_projects}</span>
            </div>
            <p className="text-gray-600 font-medium">Completed Projects</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-yellow-600">{stats.acceptance_rate}%</span>
            </div>
            <p className="text-gray-600 font-medium">Acceptance Rate</p>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
          
          <div className="space-y-6">
            {/* Active Projects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Active Projects</span>
                <span className="text-2xl font-bold text-blue-600">{stats.active_projects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((stats.active_projects / 10) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Completion Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Project Completion</span>
                <span className="text-2xl font-bold text-green-600">
                  {stats.completed_projects} / {stats.accepted_applications}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.accepted_applications > 0 ? (stats.completed_projects / stats.accepted_applications) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Success Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 font-medium">Application Success Rate</span>
                <span className="text-2xl font-bold text-purple-600">{stats.acceptance_rate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{ width: `${stats.acceptance_rate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="card mt-6 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-lg text-gray-900 mb-3">Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Experience Level:</span>{' '}
              {stats.completed_projects >= 10 ? 'Expert' :
               stats.completed_projects >= 5 ? 'Experienced' :
               stats.completed_projects >= 1 ? 'Intermediate' : 'Beginner'}
            </div>
            <div>
              <span className="font-semibold">Reliability:</span>{' '}
              {stats.acceptance_rate >= 80 ? 'Excellent' :
               stats.acceptance_rate >= 60 ? 'Good' :
               stats.acceptance_rate >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
            <div>
              <span className="font-semibold">Current Workload:</span>{' '}
              {stats.active_projects === 0 ? 'Available' :
               stats.active_projects <= 2 ? 'Light' :
               stats.active_projects <= 5 ? 'Moderate' : 'Heavy'}
            </div>
            <div>
              <span className="font-semibold">Total Earnings Potential:</span>{' '}
              Based on {stats.completed_projects} completed projects
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
