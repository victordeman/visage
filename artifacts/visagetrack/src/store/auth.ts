import { create } from "zustand";
import { getAuthToken, removeAuthToken } from "@/lib/utils";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  jobDesignation?: string;
  hasEmbedding?: boolean;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getAuthToken(),
  user: null,
  isAuthenticated: !!getAuthToken(),
  isAdmin: false,
  setAuth: (token, user) => set({ token, user, isAuthenticated: true, isAdmin: user.role === 'admin' }),
  setUser: (user) => set({ user, isAdmin: user.role === 'admin' }),
  logout: () => {
    removeAuthToken();
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
  }
}));
