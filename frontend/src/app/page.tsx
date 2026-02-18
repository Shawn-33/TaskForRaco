'use client';

import Link from 'next/link';
import { ArrowRight, Star, Users, TrendingUp, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container-app">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Connect & Collaborate</h1>
            <p className="text-xl mb-8 text-blue-100">
              A marketplace where buyers post projects and problem solvers compete to deliver. Manage everything with
              Trello-like dashboards and get paid securely via Stripe.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/register?role=buyer" className="btn-secondary">
                Post a Project
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link href="/auth/register?role=solver" className="btn-secondary">
                Find Projects
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container-app">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Users className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Post Your Project</h3>
              <p className="text-gray-600">
                Buyers create projects with descriptions, budgets, and deadlines. Classify your project for better
                visibility.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Zap className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Solvers Apply Fast</h3>
              <p className="text-gray-600">
                Problem solvers discover projects and apply instantly. First to apply gets priority conversation with
                the buyer.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <TrendingUp className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Track & Manage</h3>
              <p className="text-gray-600">
                Use Trello-like dashboards with sprints and features. Track progress in real-time and sync between
                buyer and solver.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-50 py-20">
        <div className="container-app">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <p className="text-gray-600">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5K+</div>
              <p className="text-gray-600">Problem Solvers</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$2.5M</div>
              <p className="text-gray-600">Total Payouts</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
              <p className="text-gray-600">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container-app text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're looking to hire or earn, ProjectMarket is the platform for you.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
            <Link href="/marketplace" className="btn-secondary">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
