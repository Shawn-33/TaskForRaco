'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Calendar, DollarSign, CheckCircle, Clock, Plus, Upload, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  buyer_name: string;
  created_at: string;
}

interface Sprint {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Task {
  id: number;
  project_id: number;
  problem_solver_id: number;
  title: string;
  description: string;
  status: string;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export default function SolverProjectPage() {
  const params = useParams();
  const projectId = Number(params.id);
  
  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tasks' | 'sprints'>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState<number | null>(null);
  const [requestingCompletion, setRequestingCompletion] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    deadline: '',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      // Load project first
      const projectRes = await apiClient.getAssignedProject(projectId);
      setProject(projectRes.data);
      
      // Load tasks for this project
      try {
        const tasksRes = await apiClient.getMyTasks();
        const projectTasks = tasksRes.data.filter((t: Task) => t.project_id === projectId);
        setTasks(projectTasks);
      } catch (taskError) {
        console.log('Error loading tasks:', taskError);
        setTasks([]);
      }
      
      // Try to load sprints
      try {
        const sprintsRes = await apiClient.getProjectSprints(projectId);
        setSprints(sprintsRes.data || []);
      } catch (sprintError) {
        console.log('No sprints available:', sprintError);
        setSprints([]);
      }
    } catch (error: any) {
      console.error('Failed to load project data:', error);
      if (error.response?.status === 404) {
        console.log('Project not found or not assigned to you');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTask(taskFormData);
      setTaskFormData({ title: '', description: '', deadline: '' });
      setShowTaskForm(false);
      loadProjectData();
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
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      alert(error.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleRequestCompletion = async () => {
    if (!confirm('Are you sure you want to request project completion and payment? This will notify the buyer to review your work.')) {
      return;
    }

    setRequestingCompletion(true);
    try {
      const response = await apiClient.requestProjectCompletion(projectId);
      alert(`Payment request submitted successfully! Amount: $${response.data.amount}`);
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to request completion:', error);
      alert(error.response?.data?.detail || 'Failed to request completion');
    } finally {
      setRequestingCompletion(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'planned':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Project not found</h2>
          <Link href="/solver/dashboard" className="text-blue-600 hover:text-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <Link href="/solver/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
              <p className="text-gray-600">Posted by {project.buyer_name}</p>
            </div>
            <span className="badge-success">{project.category}</span>
          </div>

          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{project.description}</p>

          <div className="flex gap-6 text-sm mb-6">
            <div className="flex items-center gap-2 text-gray-700">
              <DollarSign size={18} className="text-green-600" />
              <span className="font-semibold">${Number(project.budget).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} className="text-blue-600" />
              <span>Started {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Request Completion Button */}
          {(project.status === 'assigned' || project.status === 'in_progress') && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleRequestCompletion}
                disabled={requestingCompletion}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {requestingCompletion ? 'Submitting Request...' : 'Request Project Completion & Payment'}
              </button>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Submit this when all work is complete and ready for buyer review
              </p>
            </div>
          )}

          {project.status === 'completed' && (
            <div className="pt-4 border-t border-gray-200 flex items-center justify-center gap-2 text-green-600">
              <CheckCircle size={24} />
              <span className="font-bold text-lg">Project Completed - Payment Released!</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'tasks'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            My Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('sprints')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'sprints'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Project Sprints ({sprints.length})
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Create Task
              </button>
            </div>

            {/* Create Task Form */}
            {showTaskForm && (
              <div className="card mb-6 bg-blue-50 border-blue-200">
                <h3 className="text-xl font-bold mb-4">Create New Task</h3>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
                    <input
                      type="text"
                      value={taskFormData.title}
                      onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                      required
                      className="input-field"
                      placeholder="Enter task title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                    <textarea
                      value={taskFormData.description}
                      onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
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
                      value={taskFormData.deadline}
                      onChange={(e) => setTaskFormData({ ...taskFormData, deadline: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button type="submit" className="btn-primary flex-1">
                      Create Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTaskForm(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="card text-center py-12 bg-gray-50">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks yet</h3>
                <p className="text-gray-600 mb-4">Create your first task to get started</p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn-primary inline-flex gap-2"
                >
                  <Plus size={20} />
                  Create Task
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.toUpperCase()}
                          </span>
                        </div>
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

                    {task.status === 'submitted' && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-yellow-600">
                        <Clock size={20} />
                        <span className="font-semibold">Waiting for buyer review</span>
                      </div>
                    )}

                    {task.status === 'rejected' && (
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2 text-red-600">
                        <AlertCircle size={20} />
                        <span className="font-semibold">Task rejected - Please resubmit</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sprints Tab */}
        {activeTab === 'sprints' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Sprints</h2>
            </div>

            {sprints.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No sprints yet</h3>
                <p className="text-gray-600">Sprints will be created by the project buyer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sprints.map((sprint) => (
                  <div key={sprint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{sprint.title}</h3>
                        {sprint.description && <p className="text-gray-600">{sprint.description}</p>}
                      </div>
                      {sprint.status && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(sprint.status)}`}>
                          {sprint.status.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-6 text-sm text-gray-600 mt-4">
                      {sprint.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Start: {new Date(sprint.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {sprint.end_date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>End: {new Date(sprint.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {sprint.status === 'completed' && (
                      <div className="mt-4 flex items-center gap-2 text-green-600">
                        <CheckCircle size={18} />
                        <span className="font-medium">Sprint Completed</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
