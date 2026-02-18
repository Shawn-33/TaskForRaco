import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  role: null,

  setAuth: (user, token, role) => set({
    user,
    token,
    isAuthenticated: true,
    role,
  }),

  // Backward-compatible setters used across the app
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
    role: null,
  }),

  updateUser: (user) => set({ user }),
}));

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  submissions: [],

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setTasks: (tasks) => set({ tasks }),
  setSubmissions: (submissions) => set({ submissions }),

  addProject: (project) => set({
    projects: [...get().projects, project],
  }),

  updateProject: (id, updates) => set({
    projects: get().projects.map(p => p.id === id ? { ...p, ...updates } : p),
  }),

  addTask: (task) => set({
    tasks: [...get().tasks, task],
  }),

  updateTask: (id, updates) => set({
    tasks: get().tasks.map(t => t.id === id ? { ...t, ...updates } : t),
  }),

  addSubmission: (submission) => set({
    submissions: [...get().submissions, submission],
  }),
}));

// Backwards-compatible alias used by some components
export const useAppStore = useAuthStore;
