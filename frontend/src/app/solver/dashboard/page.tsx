'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import { CheckCircle, Clock, AlertCircle, Briefcase, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface ProjectRequest {
  id: number;
  project_id: number;
  problem_solver_id: number;
  status: string;
  requested_at: string;
}

interface AssignedProject {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  buyer_id: number;
  assigned_solver_id: number;
  created_at: string;
}

export default function SolverDashboard() {
  const router = useRouter();
  const { user, token } = useAppStore();
  const [applications, setApplications] = useState<ProjectRequest[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<AssignedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'applications'>('assigned');
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check if user is logged in and is a solver
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role !== 'problem_solver') {
      router.push('/auth/login');
      return;
    }

    // Only fetch data if we have a token
    if (token) {
      fetchData();
    }
  }, [user, token, router, mounted]);

  const fetchData = async () => {
    try {
      const [appsRes, assignedRes] = await Promise.all([
        apiClient.getMyApplications(),
        apiClient.getMyAssignments(),
      ]);
      setApplications(appsRes.data);
      setAssignedProjects(assignedRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600 bg-yellow-100',
          label: 'Pending',
          description: 'Waiting for buyer response',
        };
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-600 bg-green-100',
          label: 'Accepted',
          description: 'You\'ve been selected!',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-600 bg-red-100',
          label: 'Rejected',
          description: 'Buyer selected another solver',
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600 bg-gray-100',
          label: 'Unknown',
          description: '',
        };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-app py-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solver Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your projects and applications</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container-app py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Active Projects</p>
                <p className="text-3xl font-bold text-blue-600">{assignedProjects.length}</p>
              </div>
              <Briefcase className="text-blue-600 opacity-20" size={48} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
              </div>
              <FolderOpen className="text-gray-600 opacity-20" size={48} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{applications.filter((a) => a.status === 'accepted').length}</p>
              </div>
              <CheckCircle className="text-green-600 opacity-20" size={48} />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{applications.filter((a) => a.status === 'pending').length}</p>
              </div>
              <Clock className="text-yellow-600 opacity-20" size={48} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'assigned'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Briefcase className="inline mr-2" size={18} />
            My Projects ({assignedProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'applications'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <FolderOpen className="inline mr-2" size={18} />
            Applications ({applications.length})
          </button>
        </div>

        {/* Assigned Projects Tab */}
        {activeTab === 'assigned' && (
          <div>
            {loading ? (
              <div className="card text-center py-12">Loading your projects...</div>
            ) : assignedProjects.length === 0 ? (
              <div className="card text-center py-12">
                <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No assigned projects yet</h2>
                <p className="text-gray-600 mb-4">Apply to projects in the marketplace to get started</p>
                <Link href="/marketplace" className="btn-primary inline-flex gap-2">
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {assignedProjects.map((project) => (
                  <div key={project.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{project.title}</h3>
                        <span className="badge-success text-xs">{project.category}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status.toUpperCase().replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{project.description.substring(0, 150)}...</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Budget: <span className="font-bold text-green-600">${Number(project.budget).toFixed(2)}</span>
                      </div>
                      <Link href={`/solver/project/${project.id}`} className="btn-primary text-sm">
                        View Project
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div>
            {loading ? (
              <div className="card text-center py-12">Loading your applications...</div>
            ) : applications.length === 0 ? (
              <div className="card text-center py-12">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h2>
                <p className="text-gray-600 mb-4">Start by browsing and applying to projects</p>
                <Link href="/marketplace" className="btn-primary inline-flex gap-2">
                  Browse Projects
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((app) => {
                  const statusInfo = getStatusInfo(app.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div key={app.id} className="card">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${statusInfo.color}`}>
                          <StatusIcon size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Project #{app.project_id}</p>
                          <h3 className="font-bold text-lg text-gray-900">Project {app.project_id}</h3>
                          <p className="text-sm text-gray-600 mt-1">{statusInfo.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Applied on {new Date(app.requested_at).toLocaleDateString()}</p>
                        </div>
                        {app.status === 'accepted' && (
                          <Link href={`/solver/project/${app.project_id}`} className="btn-primary text-sm">
                            View Project
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="container-app py-8 pb-20">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Next Steps</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Continue browsing and applying to projects that match your skills</li>
            <li>✓ Once accepted, you'll get access to the project dashboard</li>
            <li>✓ Complete tasks and update your status to get paid</li>
            <li>✓ Check your earnings in the Payments section</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
