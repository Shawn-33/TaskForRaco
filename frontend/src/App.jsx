import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Login } from './components/Login';
import { Navigation } from './components/Navigation';
import { AdminDashboard } from './components/AdminDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { SolverDashboard } from './components/SolverDashboard';
import { SolverProjectDetail } from './components/SolverProjectDetail';

function PrivateRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : role === 'buyer' ? '/buyer' : '/solver'} />;
  }

  return <>{children}</>;
}

function App() {
  const { isAuthenticated } = useAuthStore();

  // Initialize auth state from localStorage
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      useAuthStore.setState({
        token,
        role,
        isAuthenticated: true,
      });
    }
  }, []);

  return (
    <Router>
      {isAuthenticated && <Navigation />}
      <main className={isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Buyer Routes */}
          <Route
            path="/buyer"
            element={
              <PrivateRoute requiredRole="buyer">
                <BuyerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/projects/:projectId"
            element={
              <PrivateRoute requiredRole="buyer">
                <ProjectDetail />
              </PrivateRoute>
            }
          />

          {/* Problem Solver Routes */}
          <Route
            path="/solver"
            element={
              <PrivateRoute requiredRole="problem_solver">
                <SolverDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/solver/projects/:projectId"
            element={
              <PrivateRoute requiredRole="problem_solver">
                <SolverProjectDetail />
              </PrivateRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
