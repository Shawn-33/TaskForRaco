'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowLeft, DollarSign, Calendar, User, Briefcase } from 'lucide-react';
import Link from 'next/link';

interface ProjectDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  buyer_name: string;
  buyer_id: number;
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadProject();
    checkApplication();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await apiClient.getProjectDetails(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplication = async () => {
    try {
      const response = await apiClient.getMyApplications();
      const applied = response.data.some((app: any) => app.project_id === projectId);
      setHasApplied(applied);
    } catch (error) {
      console.error('Failed to check application:', error);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await apiClient.applyForProject(projectId);
      setHasApplied(true);
      alert('Application submitted successfully!');
    } catch (error: any) {
      console.error('Failed to apply:', error);
      alert(error.response?.data?.detail || 'Failed to apply for project');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading project details...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Link href="/marketplace" className="text-blue-600 hover:text-blue-700">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <User size={16} />
                      {project.buyer_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span className="badge-success">{project.category}</span>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign size={18} />
                    <span className="text-sm font-medium">Budget</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${Number(project.budget).toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Briefcase size={18} />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    project.status === 'open' ? 'bg-green-100 text-green-800' :
                    project.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-600 mb-1">Applications</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {project.applications_count} solver{project.applications_count !== 1 ? 's' : ''} applied
                  </div>
                </div>
              </div>

              {project.status === 'open' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  {hasApplied ? (
                    <div className="text-center py-3 bg-green-50 text-green-700 rounded-lg font-medium">
                      ✓ You have applied for this project
                    </div>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="btn-primary w-full"
                    >
                      {applying ? 'Applying...' : 'Apply for Project'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
