import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { solverAPI } from '../api';
import { Plus, Loader, ArrowRight } from 'lucide-react';

export function SolverDashboard() {
  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (activeTab === 'browse') {
        const response = await solverAPI.browseProjects();
        setProjects(response.data);
      } else {
        const response = await solverAPI.getAssignments();
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleRequest = async (projectId) => {
    try {
      await solverAPI.requestProject(projectId);
      alert('Request submitted! Wait for buyer approval.');
      loadData();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request: ' + error.response?.data?.detail);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Problem Solver Dashboard</h1>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'browse'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent'
          }`}
        >
          Browse Projects
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'assignments'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent'
          }`}
        >
          My Assignments
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No available projects
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                {project.budget && (
                  <p className="text-sm text-gray-500 mb-4">Budget: ${project.budget}</p>
                )}
                <button
                  onClick={() => handleRequest(project.id)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  Request Project
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No assignments yet
            </div>
          ) : (
            assignments.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block my-4 ${
                  project.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status.toUpperCase()}
                </span>
                <button
                  onClick={() => navigate(`/solver/projects/${project.id}`)}
                  className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg transition"
                >
                  <ArrowRight className="w-4 h-4" />
                  Manage Tasks
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
