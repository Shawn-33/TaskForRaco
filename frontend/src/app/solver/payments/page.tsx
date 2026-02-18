'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/store';
import { DollarSign, TrendingUp, Award } from 'lucide-react';

interface Payment {
  id: number;
  project_id: number;
  solver_id: number;
  amount: number;
  status: string;
  stripe_payout_id?: string;
  created_at: string;
  paid_at?: string;
}

interface Stats {
  total_earned: number;
  paid_amount: number;
  pending_amount: number;
  payment_count: number;
}

export default function SolverPayments() {
  const router = useRouter();
  const { user } = useAppStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_earned: 0,
    paid_amount: 0,
    pending_amount: 0,
    payment_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and is a solver
    if (user?.role !== 'problem_solver') {
      router.push('/auth/login');
      return;
    }

    fetchPayments();
  }, [user, router]);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([apiClient.getMyPayments(), apiClient.getPaymentStats()]);

      setPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'released':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestPayout = async (paymentId: number) => {
    // This would require user's Stripe account ID
    const stripeAccountId = prompt('Enter your Stripe Account ID:');
    if (!stripeAccountId) return;

    try {
      await apiClient.createPayout(paymentId, stripeAccountId);
      fetchPayments(); // Refresh payments
    } catch (error) {
      console.error('Failed to create payout:', error);
      alert('Failed to create payout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container-app py-8">
          <h1 className="text-3xl font-bold text-gray-900">Earnings & Payouts</h1>
          <p className="text-gray-600 mt-1">Track your payments and request payouts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="container-app py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earned */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Earned</p>
                <p className="text-3xl font-bold text-gray-900">${stats.total_earned.toFixed(2)}</p>
              </div>
              <DollarSign className="text-green-600 opacity-20" size={48} />
            </div>
          </div>

          {/* Already Paid */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Already Paid</p>
                <p className="text-3xl font-bold text-green-600">${stats.paid_amount.toFixed(2)}</p>
              </div>
              <Award className="text-green-600 opacity-20" size={48} />
            </div>
          </div>

          {/* Pending */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Pending Payout</p>
                <p className="text-3xl font-bold text-yellow-600">${stats.pending_amount.toFixed(2)}</p>
              </div>
              <TrendingUp className="text-yellow-600 opacity-20" size={48} />
            </div>
          </div>
        </div>

        {/* Payments Table */}
        {loading ? (
          <div className="card text-center py-12">Loading your payments...</div>
        ) : payments.length === 0 ? (
          <div className="card text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No payments yet</h2>
            <p className="text-gray-600">Complete accepted projects to earn money</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Project #{payment.project_id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">${Number(payment.amount).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.status === 'released' ? (
                          <button
                            onClick={() => handleRequestPayout(payment.id)}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Request Payout
                          </button>
                        ) : payment.status === 'paid' ? (
                          <span className="text-green-600">✓ Paid</span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="container-app pb-20">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
          <h3 className="font-bold text-lg text-gray-900 mb-2">How Payouts Work</h3>
          <ol className="space-y-2 text-gray-700 list-decimal list-inside">
            <li>Payment is created when buyer releases budget for your project</li>
            <li>Once released, you can request a payout to your Stripe account</li>
            <li>Payouts are processed instantly with your linked Stripe account</li>
            <li>View payout details and dates in the transaction history</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
