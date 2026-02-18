'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Search, Filter, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: string;
  buyer_name: string;
  applications_count: number;
  created_at: string;
}

export default function Marketplace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [myApplications, setMyApplications] = useState<number[]>([]);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesRes = await apiClient.getCategories();
        setCategories(categoriesRes.data.categories || []);

        // Fetch user's applications to filter them out (only if logged in)
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          try {
            const appsRes = await apiClient.getMyApplications();
            const appliedProjectIds = appsRes.data.map((app: any) => app.project_id);
            setMyApplications(appliedProjectIds);
          } catch (error) {
            // User might not be logged in or not a solver, ignore
            console.log('Could not fetch applications:', error);
          }
        }

        // Fetch projects
        const projectsRes = await apiClient.browseProjects(0, 50, selectedCategory || undefined, search || undefined);
        setProjects(projectsRes.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, search, sortBy, mounted]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm py-8">
        <div className="container-app">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Marketplace</h1>
          <p className="text-gray-600">Discover amazing projects and showcase your skills</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container-app py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field">
            <option value="created_at">Newest First</option>
            <option value="budget">Highest Budget</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container-app pb-20">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="text-gray-400">Loading projects...</div>
            </div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No projects found</h2>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const hasApplied = myApplications.includes(project.id);
              
              return (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <div className="card hover:shadow-lg transition-shadow cursor-pointer relative">
                    {hasApplied && (
                      <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                        Applied
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{project.title}</h3>
                        <p className="text-sm text-gray-500">by {project.buyer_name}</p>
                      </div>
                      <span className="badge-success text-xs">{project.category}</span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">${Number(project.budget).toFixed(2)}</div>
                        <p className="text-xs text-gray-500">{project.applications_count} applications</p>
                      </div>
                      <button className="btn-primary text-sm">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
