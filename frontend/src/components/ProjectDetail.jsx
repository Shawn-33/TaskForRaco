import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerAPI, submissionAPI } from '../api';
import { ArrowLeft, Users, CheckCircle, XCircle, Download } from 'lucide-react';

export function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [requests, setRequests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const [projectRes, requestsRes, submissionsRes] = await Promise.all([
        buyerAPI.getProject(projectId),
        buyerAPI.getProjectRequests(projectId),
        submissionAPI.getProjectSubmissions(projectId),
      ]);
      setProject(projectRes.data);
      setRequests(requestsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSolver = async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    try {
      await buyerAPI.assignSolver(projectId, request.problem_solver_id);
      loadProjectData();
    } catch (error) {
      console.error('Error assigning solver:', error);
    }
  };

  const handleReviewSubmission = async (submissionId, status) => {
    try {
      await submissionAPI.reviewSubmission(submissionId, {
        status,
        rejection_reason: status === 'rejected' ? prompt('Reason for rejection:') : null,
      });
      loadProjectData();
    } catch (error) {
      console.error('Error reviewing submission:', error);
    }
  };

  const handleDownload = async (submissionId) => {
    try {
      const response = await submissionAPI.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submission_${submissionId}.zip`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading submission:', error);
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
        onClick={() => navigate('/buyer')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.title}</h1>
        <p className="text-gray-600 mb-4">{project.description}</p>
        {project.budget && <p className="text-sm text-gray-500">Budget: ${project.budget}</p>}
        <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-3 ${
          project.status === 'open' ? 'bg-green-100 text-green-800' :
          project.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
          project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {project.status.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'requests'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            activeTab === 'submissions'
              ? 'text-blue-600 border-blue-600'
              : 'text-gray-500 border-transparent'
          }`}
        >
          Submissions ({submissions.length})
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No requests yet</div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">Solver ID: {request.problem_solver_id}</p>
                  <p className="text-sm text-gray-500">Requested: {new Date(request.requested_at).toLocaleDateString()}</p>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mt-2 ${
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.status.toUpperCase()}
                  </span>
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleAssignSolver(request.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Assign
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No submissions yet</div>
          ) : (
            submissions.map((submission) => (
              <div key={submission.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-gray-800">Task ID: {submission.task_id}</p>
                    <p className="text-sm text-gray-500">{submission.file_name}</p>
                    <p className="text-sm text-gray-500">Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>

                {submission.rejection_reason && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Reason: {submission.rejection_reason}
                  </div>
                )}

                {submission.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReviewSubmission(submission.id, 'accepted')}
                      className="flex items-center gap-2 flex-1 bg-green-100 hover:bg-green-200 text-green-600 py-2 rounded-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReviewSubmission(submission.id, 'rejected')}
                      className="flex items-center gap-2 flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded-lg transition"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleDownload(submission.id)}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-600 py-2 rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
