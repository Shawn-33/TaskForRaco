'use client';

import Link from 'next/link';
import { ArrowRight, Star, Users, TrendingUp, Zap, Shield, Award, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="animated-gradient text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-app relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/20 backdrop-blur-md rounded-full mb-8 border border-white/30">
              <Sparkles size={20} />
              <span className="font-semibold">Welcome to the Future of Freelancing</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Connect & Collaborate
              <span className="block bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                Like Never Before
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-white/90 leading-relaxed">
              A marketplace where buyers post projects and problem solvers compete to deliver. 
              Manage everything with intuitive dashboards and get paid securely.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/register?role=buyer" className="group px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Post a Project
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/register?role=solver" className="group px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30 flex items-center justify-center gap-2">
                Find Projects
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">Simple, fast, and secure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group card hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Post Your Project</h3>
              <p className="text-gray-600 leading-relaxed">
                Buyers create projects with descriptions, budgets, and deadlines. Classify your project for better
                visibility and attract the right talent.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group card hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Solvers Apply Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Problem solvers discover projects and apply instantly. First to apply gets priority conversation with
                the buyer. Start earning today!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group card hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl mb-6 shadow-lg group-hover:shadow-2xl transition-shadow">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Track & Manage</h3>
              <p className="text-gray-600 leading-relaxed">
                Use intuitive dashboards with sprints and features. Track progress in real-time and sync between
                buyer and solver seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-app relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">10K+</div>
              <p className="text-white/80 text-lg">Active Projects</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">5K+</div>
              <p className="text-white/80 text-lg">Problem Solvers</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">$2.5M</div>
              <p className="text-white/80 text-lg">Total Payouts</p>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold mb-2">98%</div>
              <p className="text-white/80 text-lg">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-white">
        <div className="container-app">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Why Choose Us
            </h2>
            <p className="text-xl text-gray-600">Built with trust and security in mind</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-6 shadow-xl">
                <Shield className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Payments</h3>
              <p className="text-gray-600">All transactions are protected with industry-leading security</p>
            </div>
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mb-6 shadow-xl">
                <Award className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Quality Guaranteed</h3>
              <p className="text-gray-600">Only verified and skilled problem solvers on our platform</p>
            </div>
            <div className="text-center p-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-6 shadow-xl">
                <Star className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-4">24/7 Support</h3>
              <p className="text-gray-600">Our team is always here to help you succeed</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-purple-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container-app text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-white/90">
            Whether you're looking to hire or earn, ProjectMarket is the platform for you.
            Join thousands of satisfied users today!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/login" className="px-10 py-5 bg-white text-purple-600 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1">
              Sign In
            </Link>
            <Link href="/marketplace" className="px-10 py-5 bg-white/10 backdrop-blur-md text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
