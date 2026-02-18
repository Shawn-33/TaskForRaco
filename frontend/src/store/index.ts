import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'buyer' | 'problem_solver' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  updated_at: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  projects: Project[];
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: number, updates: any) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      projects: [],
      
      setUser: (user) => set({ user }),
      
      setToken: (token) => set({ token }),
      
      setProjects: (projects) => set({ projects }),
      
      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),
      
      updateProject: (projectId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, ...updates } : p
          ),
        })),
      
      logout: () => {
        set({ user: null, token: null, projects: [] });
      },
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
