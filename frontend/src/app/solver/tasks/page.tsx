'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import { Plus, Upload, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: number;
  project_id: number;
  problem_solver_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  created_at: string;
}

interface Project {
  id: number;
  title: string;
}

export default function SolverTasksPage() {
  const router = useRouter();
  const { user } = useAppStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    if (user?.role !== 'problem_solver') {
      router.push('/auth/login');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        apiClient.getMyTasks(),
        apiClient.getMyAssignments(),
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTask(formData);
      setFormData({ title: '', description: '', deadline: '' });
      setShowCreateForm(false);
      fetchData();
      alert('Task created successfully!');
    } catch (error: any) {
      console.error('Failed to create task:', error);
      alert(error.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, taskId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file');
      return;
    }

    setUploadingTaskId(taskId);
    try {
      await apiClient.submitTask(taskId, file);
      alert('Task submitted successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploadingTaskId(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'created':
        return { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Created' };
      case 'submitted':
        return { icon: CheckCircle, color: 'bg-yellow-100 text-yellow-800', label: 'Submitted' };
      case 'accepted':
        return { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Accepted' };
      case 'rejected':
        return { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Rejected' };
      default:
        return { icon: Clock, color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-1">Create and manage your project tasks</p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Task
            </button>
          )}
        </div>

        {/* Create Task Form */}
        {showCreateForm && (
          <div className="card mb-8 bg-blue-50 border-blue-200">
            <h3 className="text-xl font-bold mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="input-field"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Describe the task details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary flex-1">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="card text-center py-12">Loading tasks...</div>
        ) : projects.length === 0 ? (
          <div className="card text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No assigned projects</h2>
            <p className="text-gray-600 mb-4">You need to be assigned to a project before creating tasks</p>
            <Link href="/marketplace" className="btn-primary inline-flex gap-2">
              Browse Projects
            </Link>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card text-center py-12">
            <Clock size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No tasks yet</h2>
            <p className="text-gray-600 mb-4">Create your first task to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary inline-flex gap-2"
            >
              <Plus size={20} />
              Create Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const statusInfo = getStatusInfo(task.status);
              const StatusIcon = statusInfo.icon;
              const project = projects.find((p) => p.id === task.project_id);

              return (
                <div key={task.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      {project && (
                        <p className="text-sm text-gray-500 mb-2">Project: {project.title}</p>
                      )}
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {task.deadline && (
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            Deadline: {new Date(task.deadline).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          Created: {new Date(task.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {(task.status === 'created' || task.status === 'rejected') && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full">
                        <Upload size={18} />
                        {uploadingTaskId === task.id ? 'Uploading...' : 'Submit ZIP File'}
                        <input
                          type="file"
                          accept=".zip"
                          onChange={(e) => handleFileUpload(e, task.id)}
                          disabled={uploadingTaskId === task.id}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {task.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-green-600">
                      <CheckCircle size={20} />
                      <span className="font-semibold">Task Completed & Accepted</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
