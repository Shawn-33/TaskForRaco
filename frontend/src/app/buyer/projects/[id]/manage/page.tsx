'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Users, Calendar, DollarSign, Edit, CheckCircle, XCircle, Download, FileText } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  buyer_id: number;
  assigned_solver_id?: number;
  created_at: string;
}

interface Application {
  id: number;
  project_id: number;
  problem_solver_id: number;
  solver_name?: string;
  status: string;
  requested_at: string;
  responded_at?: string;
}

interface Submission {
  id: number;
  task_id: number;
  problem_solver_id: number;
  file_name: string;
  file_path: string;
  status: string;
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
}

interface Payment {
  id: number;
  project_id: number;
  solver_id: number;
  amount: number;
  status: string;
  description?: string;
  created_at: string;
  released_at?: string;
  paid_at?: string;
}

export default function ManageProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = Number(params.id);
  
  const [project, setProject] = useState<Project | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'applications' | 'tasks' | 'payments'>('details');
  const [editing, setEditing] = useState(false);
  const [reviewingSubmission, setReviewingSubmission] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingPayment, setReviewingPayment] = useState<number | null>(null);
  const [paymentRejectionReason, setPaymentRejectionReason] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
  });

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const projectRes = await apiClient.getMyProjects();
      const foundProject = projectRes.data.find((p: Project) => p.id === projectId);
      
      if (!foundProject) {
        throw new Error('Project not found');
      }

      setProject(foundProject);
      setFormData({
        title: foundProject.title,
        description: foundProject.description,
        category: foundProject.category,
        budget: foundProject.budget.toString(),
      });

      // Load applications
      try {
        const appsRes = await apiClient.getProjectApplications(projectId);
        console.log('Applications loaded:', appsRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error('Failed to load applications:', error);
      }

      // Load submissions
      try {
        const subsRes = await apiClient.getProjectSubmissions(projectId);
        console.log('Submissions loaded:', subsRes.data);
        setSubmissions(subsRes.data);
      } catch (error) {
        console.error('Failed to load submissions:', error);
      }

      // Load payment requests
      try {
        const paymentsRes = await apiClient.getPaymentRequests(projectId);
        console.log('Payments loaded:', paymentsRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error('Failed to load payments:', error);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Project not found or you do not have access');
      router.push('/buyer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateProject(projectId, {
        ...formData,
        budget: parseFloat(formData.budget),
      });
      alert('Project updated successfully!');
      setEditing(false);
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      alert(error.response?.data?.detail || 'Failed to update project');
    }
  };

  const handleAcceptApplication = async (applicationId: number) => {
    if (!confirm('Are you sure you want to assign this solver to the project?')) {
      return;
    }

    try {
      // Accept the application and assign solver
      await apiClient.client.post(`/marketplace/applications/${applicationId}/accept`);
      alert('Solver assigned successfully!');
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to accept application:', error);
      alert(error.response?.data?.detail || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId: number) => {
    if (!confirm('Are you sure you want to reject this application?')) {
      return;
    }

    try {
      await apiClient.client.post(`/marketplace/applications/${applicationId}/reject`);
      alert('Application rejected');
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to reject application:', error);
      alert(error.response?.data?.detail || 'Failed to reject application');
    }
  };

  const handleReviewSubmission = async (submissionId: number, status: string) => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      await apiClient.reviewSubmission(
        submissionId,
        status,
        status === 'rejected' ? rejectionReason : undefined
      );
      alert(`Submission ${status} successfully!`);
      setReviewingSubmission(null);
      setRejectionReason('');
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to review submission:', error);
      alert(error.response?.data?.detail || 'Failed to review submission');
    }
  };

  const handleDownloadSubmission = async (submissionId: number, fileName: string) => {
    try {
      const response = await apiClient.downloadSubmission(submissionId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download submission:', error);
      alert(error.response?.data?.detail || 'Failed to download submission');
    }
  };

  const handleApprovePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to approve this payment? This will mark the project as completed and release payment to the solver.')) {
      return;
    }

    try {
      await apiClient.approvePayment(paymentId);
      alert('Payment approved and released successfully!');
      setReviewingPayment(null);
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to approve payment:', error);
      alert(error.response?.data?.detail || 'Failed to approve payment');
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    if (!paymentRejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this payment request?')) {
      return;
    }

    try {
      await apiClient.rejectPayment(paymentId, paymentRejectionReason);
      alert('Payment request rejected');
      setReviewingPayment(null);
      setPaymentRejectionReason('');
      loadProjectData();
    } catch (error: any) {
      console.error('Failed to reject payment:', error);
      alert(error.response?.data?.detail || 'Failed to reject payment');
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-8">
        <Link href="/buyer/dashboard" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Project Details
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'applications'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Users className="inline mr-2" size={18} />
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'tasks'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <FileText className="inline mr-2" size={18} />
            Tasks & Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-semibold border-b-2 transition ${
              activeTab === 'payments'
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <DollarSign className="inline mr-2" size={18} />
            Payment Requests ({payments.length})
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="card max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Project Details</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget (USD)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={8}
                    className="input-field"
                  />
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn-primary flex-1">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <span className="badge-success">{project.category}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Budget</label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <DollarSign size={18} className="text-green-600" />
                      <span className="text-xl font-bold">${Number(project.budget).toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      project.status === 'open' ? 'bg-green-100 text-green-800' :
                      project.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={18} />
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="card text-center py-12">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No applications yet</h3>
                <p className="text-gray-600">Solvers will appear here when they apply to your project</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <Link 
                            href={`/profile/solver/${app.problem_solver_id}`}
                            className="font-bold text-lg text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {app.solver_name || `Solver #${app.problem_solver_id}`}
                          </Link>
                          <p className="text-sm text-gray-500">ID: {app.problem_solver_id}</p>
                        </div>
                      </div>
                      
                      <div className="ml-15 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Applied on {new Date(app.requested_at).toLocaleDateString()} at {new Date(app.requested_at).toLocaleTimeString()}</span>
                        </div>
                        
                        {app.responded_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>Responded on {new Date(app.responded_at).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        <div className="mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {app.status === 'pending' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleAcceptApplication(app.id)}
                          className="btn-primary text-sm whitespace-nowrap"
                        >
                          Accept Application
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app.id)}
                          className="btn-danger text-sm whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tasks & Submissions Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="card text-center py-12">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No submissions yet</h3>
                <p className="text-gray-600">Task submissions from your assigned solver will appear here</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <FileText size={24} className="text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Task #{submission.task_id}</h3>
                          <p className="text-sm text-gray-500">Submission ID: {submission.id}</p>
                        </div>
                      </div>

                      <div className="ml-15 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Submitted on {new Date(submission.submitted_at).toLocaleDateString()} at {new Date(submission.submitted_at).toLocaleTimeString()}</span>
                        </div>

                        {submission.reviewed_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={16} />
                            <span>Reviewed on {new Date(submission.reviewed_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FileText size={16} />
                          <span className="font-medium">{submission.file_name}</span>
                        </div>

                        <div className="mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            submission.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {submission.status.toUpperCase()}
                          </span>
                        </div>

                        {submission.rejection_reason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm font-semibold text-red-800 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{submission.rejection_reason}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleDownloadSubmission(submission.id, submission.file_name)}
                        className="btn-secondary text-sm whitespace-nowrap flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </button>

                      {submission.status === 'pending' && (
                        <>
                          {reviewingSubmission === submission.id ? (
                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Rejection reason (optional for accept, required for reject)"
                                className="input-field text-sm"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReviewSubmission(submission.id, 'accepted')}
                                  className="btn-primary text-xs flex items-center gap-1 flex-1"
                                >
                                  <CheckCircle size={14} />
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleReviewSubmission(submission.id, 'rejected')}
                                  className="btn-danger text-xs flex items-center gap-1 flex-1"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  setReviewingSubmission(null);
                                  setRejectionReason('');
                                }}
                                className="btn-secondary text-xs w-full"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReviewingSubmission(submission.id)}
                              className="btn-primary text-sm whitespace-nowrap"
                            >
                              Review Submission
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payment Requests Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="card text-center py-12">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No payment requests yet</h3>
                <p className="text-gray-600">Payment requests from your assigned solver will appear here</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <DollarSign size={24} className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Payment Request #{payment.id}</h3>
                          <p className="text-sm text-gray-500">Project Completion Payment</p>
                        </div>
                      </div>

                      <div className="ml-15 space-y-2">
                        <div className="flex items-center gap-2 text-gray-700">
                          <DollarSign size={20} className="text-green-600" />
                          <span className="text-2xl font-bold">${Number(payment.amount).toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} />
                          <span>Requested on {new Date(payment.created_at).toLocaleDateString()} at {new Date(payment.created_at).toLocaleTimeString()}</span>
                        </div>

                        {payment.released_at && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle size={16} className="text-green-600" />
                            <span>Released on {new Date(payment.released_at).toLocaleDateString()}</span>
                          </div>
                        )}

                        {payment.description && (
                          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-700">{payment.description}</p>
                          </div>
                        )}

                        <div className="mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            payment.status === 'released' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {payment.status === 'pending' && (
                      <div className="flex flex-col gap-2">
                        {reviewingPayment === payment.id ? (
                          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <textarea
                              value={paymentRejectionReason}
                              onChange={(e) => setPaymentRejectionReason(e.target.value)}
                              placeholder="Rejection reason (required for reject)"
                              className="input-field text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprovePayment(payment.id)}
                                className="btn-primary text-xs flex items-center gap-1 flex-1"
                              >
                                <CheckCircle size={14} />
                                Approve & Release
                              </button>
                              <button
                                onClick={() => handleRejectPayment(payment.id)}
                                className="btn-danger text-xs flex items-center gap-1 flex-1"
                              >
                                <XCircle size={14} />
                                Reject
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setReviewingPayment(null);
                                setPaymentRejectionReason('');
                              }}
                              className="btn-secondary text-xs w-full"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReviewingPayment(payment.id)}
                            className="btn-primary text-sm whitespace-nowrap"
                          >
                            Review Payment
                          </button>
                        )}
                      </div>
                    )}

                    {payment.status === 'released' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={24} />
                        <span className="font-semibold">Payment Released</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
