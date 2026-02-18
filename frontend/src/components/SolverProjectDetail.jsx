import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { solverAPI } from '../api';
import { ArrowLeft, Plus, Upload, CheckCircle2 } from 'lucide-react';

export function SolverProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', deadline: '' });
  const [uploadingTask, setUploadingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        solverAPI.getProject(projectId),
        solverAPI.getTasks(),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data.filter(t => t.project_id === parseInt(projectId)));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await solverAPI.createTask(newTask);
      setNewTask({ title: '', description: '', deadline: '' });
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleFileUpload = async (e, taskId) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file');
      return;
    }

    setUploadingTask(taskId);
    try {
      await solverAPI.submitTask(taskId, file);
      alert('Task submitted successfully!');
      loadData();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.response?.data?.detail);
    } finally {
      setUploadingTask(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-red-600">Project not found</div>;
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/solver')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h1>
        <p className="text-gray-600">{project.description}</p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Create New Task</h3>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="4"
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            No tasks yet. Create your first task to get started.
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{task.title}</h3>
                  <p className="text-gray-600 text-sm my-2">{task.description}</p>
                  {task.deadline && (
                    <p className="text-sm text-gray-500">Deadline: {new Date(task.deadline).toLocaleDateString()}</p>
                  )}
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  task.status === 'created' ? 'bg-blue-100 text-blue-800' :
                  task.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {task.status.toUpperCase()}
                </span>
              </div>

              {(task.status === 'created' || task.status === 'rejected') && (
                <div className="mt-4">
                  <label className="flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition w-full">
                    <Upload className="w-4 h-4" />
                    {uploadingTask === task.id ? 'Uploading...' : 'Submit ZIP File'}
                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => handleFileUpload(e, task.id)}
                      disabled={uploadingTask === task.id}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {task.status === 'accepted' && (
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Submission Accepted</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
