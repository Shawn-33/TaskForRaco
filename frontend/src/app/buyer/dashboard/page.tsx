'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import { Plus, Edit, Trash, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  assigned_solver_id?: number;
  created_at: string;
}

export default function BuyerDashboard() {
  const router = useRouter();
  const { user } = useAppStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'open' | 'in_progress' | 'completed'>('open');

  useEffect(() => {
    // Check if user is logged in and is a buyer
    if (user?.role !== 'buyer') {
      router.push('/auth/login');
      return;
    }

    fetchProjects();
  }, [user, router]);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.getMyProjects();
      setProjects(res.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      // API call to delete project
      // await apiClient.deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 badge-success';
      case 'assigned':
        return 'bg-purple-100 text-purple-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openProjects = projects.filter(p => p.status === 'open');
  const inProgressProjects = projects.filter(p => p.status === 'assigned' || p.status === 'in_progress');
  const completedProjects = projects.filter(p => p.status === 'completed');

  const getFilteredProjects = () => {
    switch (activeTab) {
      case 'open':
        return openProjects;
      case 'in_progress':
        return inProgressProjects;
      case 'completed':
        return completedProjects;
      default:
        return openProjects;
    }
  };

  const filteredProjects = getFilteredProjects();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-app py-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-1">Manage and track your posted projects</p>
          </div>
          <Link href="/buyer/projects/new" className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            Post New Project
          </Link>
        </div>
      </div>

      {/* Projects List */}
      <div className="container-app py-8">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'open'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Open Projects ({openProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('in_progress')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'in_progress'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            In Progress ({inProgressProjects.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'completed'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Completed ({completedProjects.length})
          </button>
        </div>

        {loading ? (
          <div className="card text-center py-12">Loading your projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No {activeTab.replace('_', ' ')} projects
            </h2>
            <p className="text-gray-600 mb-4">
              {activeTab === 'open' && 'Start by posting your first project'}
              {activeTab === 'in_progress' && 'Projects will appear here once you assign a solver'}
              {activeTab === 'completed' && 'Completed projects will appear here'}
            </p>
            {activeTab === 'open' && (
              <Link href="/buyer/projects/new" className="btn-primary inline-flex gap-2">
                <Plus size={20} />
                Post Project
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="card">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{project.description.substring(0, 100)}...</p>
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign size={16} className="text-green-600" />
                        ${Number(project.budget).toFixed(2)}
                      </div>
                      {project.assigned_solver_id && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Users size={16} className="text-blue-600" />
                          Assigned
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-col md:flex-row">
                    <Link
                      href={`/buyer/projects/${project.id}/manage`}
                      className="btn-secondary text-sm flex items-center justify-center gap-1"
                    >
                      <Edit size={16} />
                      Manage
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="btn-danger text-sm flex items-center justify-center gap-1"
                    >
                      <Trash size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
