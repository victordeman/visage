import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authHeaders, setAuthToken } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

export function useLoginMutation() {
  const setAuth = useAuthStore(state => state.setAuth);
  
  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Login failed" }));
        throw new Error(error.message || "Invalid credentials");
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setAuthToken(data.access_token);
      setAuth(data.access_token, {
        id: data.userId,
        name: data.name,
        email: "", 
        role: data.role
      });
    }
  });
}

export function useUserProfile() {
  const setUser = useAuthStore(state => state.setUser);
  const logout = useAuthStore(state => state.logout);

  return useQuery({
    queryKey: ["/api/users/profile"],
    queryFn: async () => {
      const res = await fetch("/api/users/profile", {
        headers: authHeaders()
      });
      if (res.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data);
      return data;
    },
    retry: false
  });
}
